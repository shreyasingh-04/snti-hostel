# app/models/user.py
# The "students" table — stores both trainees and admins

from datetime import datetime
from sqlalchemy import String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class TraineeType(str, enum.Enum):
    vocational = "Vocational Trainee"   # expires after 3 months
    pre_trainee = "Pre-Trainee"         # expires after 2 years


class UserRole(str, enum.Enum):
    trainee = "trainee"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    trainee_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    trainee_type: Mapped[str] = mapped_column(String(50), nullable=True)
    hostel_block: Mapped[str] = mapped_column(String(20), nullable=True)
    mess_type: Mapped[str] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(20), default="trainee")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
