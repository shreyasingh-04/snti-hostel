from pydantic_settings import BaseSettings
from typing import Optional
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    GOOGLE_SHEET_ID: Optional[str] = None
    GOOGLE_CREDENTIALS_PATH: Optional[str] = None

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        params.pop("sslmode", None)
        new_query = urlencode({k: v[0] for k, v in params.items()})
        url = urlunparse(parsed._replace(query=new_query))
        return url

    class Config:
        env_file = ".env"

settings = Settings()
