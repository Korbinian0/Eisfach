from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import LagerOrt, User
from schemas import LagerOrtCreate, LagerOrtResponse
from auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/locations", tags=["Lagerorte"])

@router.get("/", response_model=list[LagerOrtResponse])
def get_locations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(LagerOrt).all()

@router.post("/", response_model=LagerOrtResponse)
def create_location(loc_in: LagerOrtCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    existing = db.query(LagerOrt).filter(LagerOrt.name == loc_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Lagerort existiert bereits")
    loc = LagerOrt(name=loc_in.name)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

@router.delete("/{loc_id}")
def delete_location(loc_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    loc = db.query(LagerOrt).filter(LagerOrt.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Lagerort nicht gefunden")
    db.delete(loc)
    db.commit()
    return {"message": "Lagerort gelöscht"}
