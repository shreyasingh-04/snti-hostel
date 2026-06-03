# app/schemas/auth.py
# Pydantic models define what data the API accepts and returns

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    trainee_id: str
    trainee_type: str
    hostel_block: str
    mess_type: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    trainee_id: str
    trainee_type: Optional[str]
    hostel_block: Optional[str]
    mess_type: Optional[str]
    role: str
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True
