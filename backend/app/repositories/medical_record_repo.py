"""MedicalRecord repository."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.medical_record import MedicalRecord
from app.repositories.base_repo import BaseRepository


class MedicalRecordRepository(BaseRepository[MedicalRecord]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(MedicalRecord, session)
