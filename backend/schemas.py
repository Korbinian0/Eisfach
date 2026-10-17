from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    role: int = 0

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: int

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[int] = None

class LagerItemBase(BaseModel):
    barcode: str
    lagerort: str
    name: str
    menge: int

class LagerItemCreate(LagerItemBase):
    pass

class LagerItemResponse(LagerItemBase):
    id: str
    einlager_datum: date
    status: int
    hidden_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class LinkBarcodeRequest(BaseModel):
    existing_id: str
    new_barcode: str
    additional_menge: int

class LagerOrtCreate(BaseModel):
    name: str

class LagerOrtResponse(LagerOrtCreate):
    id: int
    class Config:
        from_attributes = True
