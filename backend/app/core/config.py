from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    GOOGLE_SHEET_ID: Optional[str] = None
    GOOGLE_CREDENTIALS_PATH: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
