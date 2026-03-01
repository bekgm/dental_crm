"""Appointment repository."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.repositories.base_repo import BaseRepository


class AppointmentRepository(BaseRepository[Appointment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Appointment, session)
