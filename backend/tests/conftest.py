import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import engine, Base, AsyncSessionLocal
from app.db.seed import seed_database

@pytest_asyncio.fixture(scope="function", autouse=True)
async def initialize_test_database():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data
    async with AsyncSessionLocal() as session:
        await seed_database(session)

    yield

    # Clean up
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
