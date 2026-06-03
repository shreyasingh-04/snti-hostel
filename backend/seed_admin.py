"""
seed_admin.py
Run this ONCE after the database tables are created to create the admin account.

Usage:
  cd backend
  python seed_admin.py
"""

import asyncio
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from sqlalchemy import select


async def seed():
    # Make sure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        result = await db.execute(select(User).where(User.email == "admin@snti.in"))
        if result.scalar_one_or_none():
            print("Admin already exists — skipping.")
            return

        admin = User(
            name="Admin",
            email="admin@snti.in",
            trainee_id="ADM-001",
            trainee_type=None,
            hostel_block=None,
            mess_type=None,
            password_hash=hash_password("Admin@1234"),
            role="admin",
        )
        db.add(admin)
        await db.commit()
        print("Admin created successfully!")
        print("  Email:    admin@snti.in")
        print("  Password: Admin@1234")
        print("  *** Change the password after first login! ***")


asyncio.run(seed())
