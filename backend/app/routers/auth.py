# app/routers/auth.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.core.sheets import sync_registration_to_sheet
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

def calc_expiry(trainee_type: str) -> datetime:
    if trainee_type == "Vocational Trainee":
        return datetime.utcnow() + timedelta(days=90)    # 3 months
    return datetime.utcnow() + timedelta(days=730)        # 2 years

@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_tid = await db.execute(select(User).where(User.trainee_id == data.trainee_id))
    if existing_tid.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Trainee ID already exists")

    user = User(
        name=data.name, email=data.email, trainee_id=data.trainee_id,
        trainee_type=data.trainee_type, hostel_block=data.hostel_block,
        mess_type=data.mess_type, password_hash=hash_password(data.password),
        role="trainee", expires_at=calc_expiry(data.trainee_type),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    # Sync to Google Sheets if configured
    await sync_registration_to_sheet(user)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, role=user.role, name=user.name)

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
