from functools import lru_cache
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    APP_NAME: str = "Crowd Ideas API"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./app.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


class PaginationParams(BaseModel):
    page: int = 1
    size: int = 10

