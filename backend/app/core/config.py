from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./finanzas.db"
    APP_NAME: str = "Finanzas API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    STATIC_DIR: str = "../frontend/dist/frontend/browser"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()