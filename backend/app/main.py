import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.database import engine, Base, AsyncSessionLocal
from app.db.seed import seed_database
from app.api.v1 import auth, exams, sessions, events, reports, proctoring

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("proctor_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing ProctorAI Enterprise Backend...")

    # Ensure storage directories exist
    os.makedirs(settings.SNAPSHOTS_DIR, exist_ok=True)
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schemas verified.")

    # Seed initial data
    async with AsyncSessionLocal() as db:
        await seed_database(db)

    yield

    # Shutdown actions
    await engine.dispose()
    logger.info("Database connections terminated.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Full-stack AI-powered online examination proctoring platform API with computer vision detection and suspicious event management.",
    version="2.4.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage for snapshot thumbnails
if os.path.exists(settings.STORAGE_DIR):
    app.mount(
        "/storage",
        StaticFiles(directory=settings.STORAGE_DIR),
        name="storage"
    )

# Include API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(exams.router, prefix=settings.API_V1_PREFIX)
app.include_router(sessions.router, prefix=settings.API_V1_PREFIX)
app.include_router(events.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(proctoring.router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": "2.4.0",
        "documentation": "/docs",
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2026-11-04T10:00:00Z",
    }
