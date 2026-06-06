from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.core.scheduler import start_scheduler
from app.routers import auth, menu, admin
from app.models import user, menu as menu_models
import os

app = FastAPI(title="Snti Hostel Mess API", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(admin.router)

DIST = "/home/runner/workspace/frontend/dist"

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()
    await seed_menu_options()
    if os.path.exists(f"{DIST}/assets"):
        app.mount("/assets", StaticFiles(directory=f"{DIST}/assets"), name="assets")

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

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if os.path.exists(f"{DIST}/assets"):
    app.mount("/assets", StaticFiles(directory=f"{DIST}/assets"), name="assets")

@app.get("/")
async def root():
    if os.path.exists(f"{DIST}/index.html"):
        return FileResponse(f"{DIST}/index.html")
    return {"message": "API running"}

@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    if os.path.exists(f"{DIST}/index.html"):
        return FileResponse(f"{DIST}/index.html")
    return {"message": "Not found"}
