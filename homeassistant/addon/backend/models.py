from sqlalchemy import Column, Integer, String, Date, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Integer, default=0) # 0 = Normal User, 1 = Admin

class LagerOrt(Base):
    __tablename__ = "lagerorte"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)

class LagerItem(Base):
    __tablename__ = "lager"

    id = Column(String(50), primary_key=True, index=True) # YYYY-MM-N
    barcode = Column(String(255), unique=True, index=True, nullable=False)
    lagerort = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    menge = Column(Integer, default=0, nullable=False)
    einlager_datum = Column(Date, nullable=False)
    status = Column(Integer, default=1, nullable=False) # 1 = Aktiv, 0 = Versteckt
    hidden_date = Column(DateTime, nullable=True)
