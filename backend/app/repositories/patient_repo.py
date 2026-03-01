"""Patient repository."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Patient
from app.repositories.base_repo import BaseRepository


class PatientRepository(BaseRepository[Patient]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Patient, session)

    async def get_by_user_id(self, user_id: str) -> Optional[Patient]:
        result = await self.session.execute(
            select(Patient).where(Patient.user_id == user_id)
        )
        return result.scalar_one_or_none()
