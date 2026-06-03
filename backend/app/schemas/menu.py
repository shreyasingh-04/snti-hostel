# app/schemas/menu.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MenuSave(BaseModel):
    breakfast: str
    lunch: str
    dinner: str


class MenuOut(BaseModel):
    id: int
    user_id: int
    breakfast: Optional[str]
    lunch: Optional[str]
    dinner: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True


class MenuOptionCreate(BaseModel):
    meal: str       # "breakfast" | "lunch" | "dinner"
    item_name: str


class MenuOptionOut(BaseModel):
    id: int
    meal: str
    item_name: str

    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    rating: int
    category: str
    comment: Optional[str] = None


class FeedbackOut(BaseModel):
    id: int
    user_id: int
    rating: int
    category: str
    comment: Optional[str]
    submitted_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
