from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./finanzas.db"
    APP_NAME: str = "Finanzas API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    STATIC_DIR: str = "../frontend/dist/frontend/browser"
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_NAME: str = "finanzas_session"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
