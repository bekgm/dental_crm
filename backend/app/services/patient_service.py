"""Patient service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password
from app.models.patient import Patient
from app.models.user import User
from app.repositories.patient_repo import PatientRepository
from app.repositories.user_repo import UserRepository
from app.schemas.patient import PatientCreate, PatientRead, PatientUpdate


class PatientService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PatientRepository(session)
        self.user_repo = UserRepository(session)

    async def list_patients(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        search: str | None = None,
    ) -> dict[str, Any]:
        filters = []
        # search across the joined user name would be complex;
        # for now filter on patient-level fields or do a post-filter.
        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            filters=filters or None,
        )

    async def get_patient(self, patient_id: str) -> Patient:
        patient = await self.repo.get_by_id(patient_id)
        if not patient:
            raise NotFoundException("Patient")
        return patient

    async def get_patient_by_user_id(self, user_id: str) -> Patient:
        patient = await self.repo.get_by_user_id(user_id)
        if not patient:
            raise NotFoundException("Patient")
        return patient

    async def create_patient(self, data: PatientCreate) -> Patient:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")

        # Create user first
        user = await self.user_repo.create(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            phone=data.phone,
            role="patient",
        )

        # Create patient profile
        patient = await self.repo.create(
            user_id=user.id,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            address=data.address,
            insurance_number=data.insurance_number,
            emergency_contact=data.emergency_contact,
            notes=data.notes,
        )
        return patient

    async def update_patient(self, patient_id: str, data: PatientUpdate) -> Patient:
        patient = await self.repo.get_by_id(patient_id)
        if not patient:
            raise NotFoundException("Patient")

        patient_fields = data.model_dump(
            exclude_unset=True, exclude={"full_name", "phone"}
        )
        user_fields = data.model_dump(
            exclude_unset=True, include={"full_name", "phone"}
        )

        if user_fields:
            await self.user_repo.update(patient.user_id, **user_fields)

        if patient_fields:
            patient = await self.repo.update(patient_id, **patient_fields)

        # Re-fetch to get updated relations
        return await self.repo.get_by_id(patient_id)  # type: ignore[return-value]

    async def delete_patient(self, patient_id: str) -> None:
        patient = await self.repo.get_by_id(patient_id)
        if not patient:
            raise NotFoundException("Patient")
        # Deleting user cascades to patient
        await self.user_repo.delete(patient.user_id)

    def to_read(self, patient: Patient) -> PatientRead:
        return PatientRead(
            id=patient.id,
            user_id=patient.user_id,
            full_name=patient.user.full_name,
            email=patient.user.email,
            phone=patient.user.phone,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender,
            address=patient.address,
            insurance_number=patient.insurance_number,
            emergency_contact=patient.emergency_contact,
            notes=patient.notes,
            created_at=patient.created_at,
        )
