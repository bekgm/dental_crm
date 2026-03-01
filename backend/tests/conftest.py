"""Shared test fixtures."""

from __future__ import annotations

import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_session
from app.core.security import hash_password
from app.main import app
from app.models.user import User

# In-memory SQLite for tests (swap for test PG if preferred)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionFactory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.quit if hasattr(loop, "quit") else loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionFactory() as s:
        yield s


@pytest_asyncio.fixture
async def client(session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_session():
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

    app.dependency_overrides[get_session] = override_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_user(session: AsyncSession) -> User:
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("Admin123!"),
        full_name="Test Admin",
        role="admin",
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient, admin_user: User) -> str:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "Admin123!"},
    )
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def auth_headers(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}
