# app/routers/menu.py
# Handles: save/get menu, feedback, menu options

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.menu import Menu, MenuOption, Feedback
from app.schemas.menu import MenuSave, MenuOut, MenuOptionCreate, MenuOptionOut, FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/api/menu", tags=["menu"])


# ── Trainee: save or update their menu ────────────────────────────────────────

@router.post("/save", response_model=MenuOut)
async def save_menu(
    data: MenuSave,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Menu).where(Menu.user_id == current_user.id))
    menu = result.scalar_one_or_none()

    if menu:
        # Update existing
        menu.breakfast = data.breakfast
        menu.lunch = data.lunch
        menu.dinner = data.dinner
    else:
        # Create new
        menu = Menu(user_id=current_user.id, **data.model_dump())
        db.add(menu)

    await db.commit()
    await db.refresh(menu)
    return menu


@router.get("/my", response_model=MenuOut)
async def get_my_menu(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Menu).where(Menu.user_id == current_user.id))
    menu = result.scalar_one_or_none()
    if not menu:
        raise HTTPException(status_code=404, detail="No menu saved yet")
    return menu


# ── Feedback ──────────────────────────────────────────────────────────────────

@router.post("/feedback", response_model=FeedbackOut, status_code=201)
async def submit_feedback(
    data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fb = Feedback(user_id=current_user.id, **data.model_dump())
    db.add(fb)
    await db.commit()
    await db.refresh(fb)
    # Attach the user name for display
    result = FeedbackOut.model_validate(fb)
    result.user_name = current_user.name
    return result


# ── Menu options (admin manages, trainee reads) ────────────────────────────────

@router.get("/options", response_model=List[MenuOptionOut])
async def get_menu_options(db: AsyncSession = Depends(get_db)):
    """Anyone (even unauthenticated) can read the available dishes."""
    result = await db.execute(select(MenuOption).order_by(MenuOption.meal, MenuOption.item_name))
    return result.scalars().all()


@router.post("/options", response_model=MenuOptionOut, status_code=201)
async def add_menu_option(
    data: MenuOptionCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    opt = MenuOption(**data.model_dump())
    db.add(opt)
    await db.commit()
    await db.refresh(opt)
    return opt


@router.delete("/options/{option_id}", status_code=204)
async def delete_menu_option(
    option_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    await db.execute(delete(MenuOption).where(MenuOption.id == option_id))
    await db.commit()
