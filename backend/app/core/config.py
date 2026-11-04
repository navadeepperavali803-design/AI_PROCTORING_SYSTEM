import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "ProctorAI Enterprise API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "change-this-to-a-super-secret-key-min-32-chars-long-123456"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    # Default is async SQLite for instant local zero-dependency spin up
    DATABASE_URL: str = "sqlite+aiosqlite:///./proctoring.db"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Storage
    STORAGE_DIR: str = "storage"
    SNAPSHOTS_DIR: str = "storage/snapshots"
    REPORTS_DIR: str = "storage/reports"

    # Proctoring CV Thresholds
    HEAD_POSE_YAW_THRESHOLD: float = 25.0
    HEAD_POSE_PITCH_THRESHOLD: float = 20.0
    LOOK_AWAY_ALERT_SECONDS: float = 3.0
    ABSENCE_ALERT_SECONDS: float = 3.0
    MULTI_PERSON_CONFIDENCE: float = 0.60
    PHONE_DETECTION_CONFIDENCE: float = 0.55
    FRAME_PROCESSING_FPS: int = 5

settings = Settings()
