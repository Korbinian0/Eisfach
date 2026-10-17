from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import User
from auth import get_password_hash
from routers import auth, lager, locations, home_assistant

# Create tables if not exist (can also use schema.sql)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eisfach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lager.router)
app.include_router(locations.router)
app.include_router(home_assistant.router)

# Mount static files for frontend web interface
app.mount("/", StaticFiles(directory="../web", html=True), name="web")

@app.on_event("startup")
def startup_event():
    # Ensure default admin user exists
    from database import SessionLocal
    db = SessionLocal()
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        hashed_pw = get_password_hash("admin")
        admin = User(username="admin", password_hash=hashed_pw, role=1)
        db.add(admin)
        db.commit()
    db.close()
