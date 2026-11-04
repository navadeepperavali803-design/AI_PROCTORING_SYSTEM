import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

logger = logging.getLogger(__name__)

# Create async database engine
# If SQLite, ensure connect_args allows multi-threading
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    future=True,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a transactional database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
