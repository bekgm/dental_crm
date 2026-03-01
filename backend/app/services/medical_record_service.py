"""Medical record service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.medical_record import MedicalRecord
from app.repositories.medical_record_repo import MedicalRecordRepository
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordRead, MedicalRecordUpdate


class MedicalRecordService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = MedicalRecordRepository(session)

    async def list_records(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        patient_id: str | None = None,
        doctor_id: str | None = None,
    ) -> dict[str, Any]:
        filters = []
        if patient_id:
            filters.append(MedicalRecord.patient_id == patient_id)
        if doctor_id:
            filters.append(MedicalRecord.doctor_id == doctor_id)
        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            filters=filters or None,
        )

    async def get_record(self, record_id: str) -> MedicalRecord:
        record = await self.repo.get_by_id(record_id)
        if not record:
            raise NotFoundException("Medical record")
        return record

    async def create_record(self, data: MedicalRecordCreate) -> MedicalRecord:
        return await self.repo.create(**data.model_dump())

    async def update_record(
        self, record_id: str, data: MedicalRecordUpdate
    ) -> MedicalRecord:
        record = await self.repo.update(
            record_id, **data.model_dump(exclude_unset=True)
        )
        if not record:
            raise NotFoundException("Medical record")
        return record

    async def delete_record(self, record_id: str) -> None:
        deleted = await self.repo.delete(record_id)
        if not deleted:
            raise NotFoundException("Medical record")

    def to_read(self, record: MedicalRecord) -> MedicalRecordRead:
        return MedicalRecordRead(
            id=record.id,
            patient_id=record.patient_id,
            doctor_id=record.doctor_id,
            appointment_id=record.appointment_id,
            diagnosis=record.diagnosis,
            treatment=record.treatment,
            prescription=record.prescription,
            tooth_number=record.tooth_number,
            xray_file=record.xray_file,
            notes=record.notes,
            patient_name=record.patient.user.full_name if record.patient else None,
            doctor_name=record.doctor.user.full_name if record.doctor else None,
            created_at=record.created_at,
        )
