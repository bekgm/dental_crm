"""Appointment service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.appointment import Appointment
from app.repositories.appointment_repo import AppointmentRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentUpdate


class AppointmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AppointmentRepository(session)
        self.patient_repo = PatientRepository(session)
        self.doctor_repo = DoctorRepository(session)

    async def list_appointments(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        status: str | None = None,
        doctor_id: str | None = None,
        patient_id: str | None = None,
    ) -> dict[str, Any]:
        filters = []
        if status:
            filters.append(Appointment.status == status)
        if doctor_id:
            filters.append(Appointment.doctor_id == doctor_id)
        if patient_id:
            filters.append(Appointment.patient_id == patient_id)
        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by or "scheduled_at",
            sort_order=sort_order,
            filters=filters or None,
        )

    async def get_appointment(self, appointment_id: str) -> Appointment:
        appt = await self.repo.get_by_id(appointment_id)
        if not appt:
            raise NotFoundException("Appointment")
        return appt

    async def create_appointment(self, data: AppointmentCreate) -> Appointment:
        # Validate references
        if not await self.patient_repo.get_by_id(data.patient_id):
            raise NotFoundException("Patient")
        if not await self.doctor_repo.get_by_id(data.doctor_id):
            raise NotFoundException("Doctor")
        scheduled = data.scheduled_at if data.scheduled_at.tzinfo else data.scheduled_at.replace(tzinfo=timezone.utc)
        if scheduled < datetime.now(timezone.utc):
            raise BadRequestException("Cannot schedule appointment in the past")

        return await self.repo.create(**data.model_dump())

    async def update_appointment(
        self, appointment_id: str, data: AppointmentUpdate
    ) -> Appointment:
        appt = await self.repo.get_by_id(appointment_id)
        if not appt:
            raise NotFoundException("Appointment")

        update_data = data.model_dump(exclude_unset=True)

        # Handle cancellation
        if update_data.get("status") == "cancelled" and not update_data.get(
            "cancellation_reason"
        ):
            raise BadRequestException("Cancellation reason is required")

        result = await self.repo.update(appointment_id, **update_data)
        return result  # type: ignore[return-value]

    async def delete_appointment(self, appointment_id: str) -> None:
        deleted = await self.repo.delete(appointment_id)
        if not deleted:
            raise NotFoundException("Appointment")

    def to_read(self, appt: Appointment) -> AppointmentRead:
        return AppointmentRead(
            id=appt.id,
            patient_id=appt.patient_id,
            doctor_id=appt.doctor_id,
            service_id=appt.service_id,
            scheduled_at=appt.scheduled_at,
            duration_minutes=appt.duration_minutes,
            status=appt.status,
            notes=appt.notes,
            cancellation_reason=appt.cancellation_reason,
            patient_name=appt.patient.user.full_name if appt.patient else None,
            doctor_name=appt.doctor.user.full_name if appt.doctor else None,
            service_name=appt.service.name if appt.service else None,
            created_at=appt.created_at,
        )
