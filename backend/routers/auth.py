from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import User
from schemas import Token, UserCreate, UserResponse, UserUpdate
from auth import AUTH_DISABLED, verify_password, get_password_hash, create_access_token, get_current_admin, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.get("/session")
def get_session(db: Session = Depends(get_db)):
    if not AUTH_DISABLED:
        return {"auth_disabled": False}

    admin = db.query(User).filter(User.role == 1).order_by(User.id).first()
    if admin is None:
        raise HTTPException(status_code=503, detail="Kein Admin-Konto vorhanden")
    return {"auth_disabled": True, "username": admin.username, "role": admin.role}

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "username": user.username, "role": user.role}

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(username=user_in.username, password_hash=hashed_password, role=user_in.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(User).all()

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

    updates = user_in.model_dump(exclude_unset=True)
    if any(value is None for value in updates.values()):
        raise HTTPException(status_code=422, detail="Benutzerfelder dürfen nicht null sein")
    if not updates:
        raise HTTPException(status_code=400, detail="Keine Änderungen angegeben")

    username = updates.get("username")
    if user.id == admin.id and username is not None and username != user.username:
        raise HTTPException(status_code=400, detail="Der eigene Benutzername kann hier nicht geändert werden")
    if username is not None:
        existing_user = db.query(User).filter(User.username == username, User.id != user_id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")

    if user.id == admin.id and updates.get("role") == 0:
        raise HTTPException(status_code=400, detail="Die eigene Admin-Rolle kann nicht geändert werden")
    if updates.get("role") == 0 and user.role == 1:
        admin_count = db.query(User).filter(User.role == 1).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Der letzte Admin kann nicht zum Benutzer herabgestuft werden")

    if "password" in updates:
        updates["password_hash"] = get_password_hash(updates.pop("password"))
    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Das eigene Admin-Konto kann nicht gelöscht werden")
    if user.role == 1:
        admin_count = db.query(User).filter(User.role == 1).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Der letzte Admin kann nicht gelöscht werden")

    db.delete(user)
    db.commit()
    return {"message": "Benutzer gelöscht"}
