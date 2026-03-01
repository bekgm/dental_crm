"""Seed the admin user on first run."""

from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User

logger = logging.getLogger("dentalcrm.seed")


async def seed_admin(session: AsyncSession) -> None:
    result = await session.execute(
        select(User).where(User.email == settings.ADMIN_EMAIL)
    )
    if result.scalar_one_or_none():
        logger.info("Admin user already exists, skipping seed.")
        return

    admin = User(
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        full_name="System Admin",
        role="admin",
        is_active=True,
    )
    session.add(admin)
    await session.commit()
    logger.info("Admin user seeded: %s", settings.ADMIN_EMAIL)
