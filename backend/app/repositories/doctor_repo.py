"""Doctor repository."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.doctor import Doctor
from app.repositories.base_repo import BaseRepository


class DoctorRepository(BaseRepository[Doctor]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Doctor, session)

    async def get_by_user_id(self, user_id: str) -> Optional[Doctor]:
        result = await self.session.execute(
            select(Doctor).where(Doctor.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_license(self, license_number: str) -> Optional[Doctor]:
        result = await self.session.execute(
            select(Doctor).where(Doctor.license_number == license_number)
        )
        return result.scalar_one_or_none()
