"""Doctor service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password
from app.models.doctor import Doctor
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.user_repo import UserRepository
from app.schemas.doctor import DoctorCreate, DoctorRead, DoctorUpdate


class DoctorService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = DoctorRepository(session)
        self.user_repo = UserRepository(session)

    async def list_doctors(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        search: str | None = None,
    ) -> dict[str, Any]:
        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_doctor(self, doctor_id: str) -> Doctor:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise NotFoundException("Doctor")
        return doctor

    async def get_doctor_by_user_id(self, user_id: str) -> Doctor:
        doctor = await self.repo.get_by_user_id(user_id)
        if not doctor:
            raise NotFoundException("Doctor")
        return doctor

    async def create_doctor(self, data: DoctorCreate) -> Doctor:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")

        lic = await self.repo.get_by_license(data.license_number)
        if lic:
            raise ConflictException("License number already registered")

        user = await self.user_repo.create(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            phone=data.phone,
            role="doctor",
        )

        doctor = await self.repo.create(
            user_id=user.id,
            specialization=data.specialization,
            license_number=data.license_number,
            bio=data.bio,
            years_of_experience=data.years_of_experience,
        )
        return doctor

    async def update_doctor(self, doctor_id: str, data: DoctorUpdate) -> Doctor:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise NotFoundException("Doctor")

        doctor_fields = data.model_dump(
            exclude_unset=True, exclude={"full_name", "phone"}
        )
        user_fields = data.model_dump(
            exclude_unset=True, include={"full_name", "phone"}
        )

        if user_fields:
            await self.user_repo.update(doctor.user_id, **user_fields)
        if doctor_fields:
            await self.repo.update(doctor_id, **doctor_fields)

        return await self.repo.get_by_id(doctor_id)  # type: ignore[return-value]

    async def delete_doctor(self, doctor_id: str) -> None:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise NotFoundException("Doctor")
        await self.user_repo.delete(doctor.user_id)

    def to_read(self, doctor: Doctor) -> DoctorRead:
        return DoctorRead(
            id=doctor.id,
            user_id=doctor.user_id,
            full_name=doctor.user.full_name,
            email=doctor.user.email,
            phone=doctor.user.phone,
            specialization=doctor.specialization,
            license_number=doctor.license_number,
            bio=doctor.bio,
            years_of_experience=doctor.years_of_experience,
            created_at=doctor.created_at,
        )
