# app/core/database.py
# Sets up the async SQLAlchemy engine and session factory

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# Async engine — connects to PostgreSQL using asyncpg driver
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Session factory — each request gets its own session
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """All SQLAlchemy models inherit from this."""
    pass


async def get_db():
    """
    FastAPI dependency — yields a DB session per request,
    then closes it automatically when the request finishes.
    """
    async with AsyncSessionLocal() as session:
        yield session
