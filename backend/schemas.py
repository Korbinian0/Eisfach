from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    role: int = Field(default=0, ge=0, le=1)

class UserCreate(UserBase):
    password: str = Field(min_length=1)

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=1, max_length=100)
    role: Optional[int] = Field(default=None, ge=0, le=1)
    password: Optional[str] = Field(default=None, min_length=1)

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

class LagerOrtUpdate(BaseModel):
    lagerort: str = Field(min_length=1, max_length=255)

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
