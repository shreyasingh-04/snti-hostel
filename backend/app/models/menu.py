# app/models/menu.py
# Menu selections and feedback entries

from datetime import datetime
from sqlalchemy import String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Menu(Base):
    __tablename__ = "menus"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    breakfast: Mapped[str] = mapped_column(String(100), nullable=True)
    lunch: Mapped[str] = mapped_column(String(100), nullable=True)
    dinner: Mapped[str] = mapped_column(String(100), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="menu")


class MenuOption(Base):
    """Admin-managed list of available dishes per meal."""
    __tablename__ = "menu_options"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    meal: Mapped[str] = mapped_column(String(20))        # breakfast / lunch / dinner
    item_name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    rating: Mapped[int] = mapped_column(Integer)          # 1–5
    category: Mapped[str] = mapped_column(String(50))
    comment: Mapped[str] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="feedbacks")
