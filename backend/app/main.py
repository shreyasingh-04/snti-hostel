from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.scheduler import start_scheduler
from app.routers import auth, menu, admin
from app.models import user, menu as menu_models  # noqa

app = FastAPI(title="Snti Hostel Mess API", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(admin.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()
    await seed_menu_options()

async def seed_menu_options():
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.menu import MenuOption
    default_options = [
        ("breakfast","Idli & Sambar"),("breakfast","Poha"),("breakfast","Bread Toast & Egg"),
        ("breakfast","Paratha"),("breakfast","Upma"),
        ("lunch","Dal Tadka + Rice"),("lunch","Chicken Curry + Rice"),("lunch","Rajma Chawal"),
        ("lunch","Special Thali"),("lunch","Fish Curry + Rice"),
        ("dinner","Roti + Sabzi + Dal"),("dinner","Fried Rice + Manchurian"),
        ("dinner","Paneer Butter Masala"),("dinner","Mutton Curry + Roti"),("dinner","Egg Bhurji + Roti"),
    ]
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(MenuOption))
        if not result.scalars().first():
            for meal, item in default_options:
                db.add(MenuOption(meal=meal, item_name=item))
            await db.commit()

@app.get("/")
async def root():
    return {"message": "Snti Hostel API running", "docs": "/docs"}
