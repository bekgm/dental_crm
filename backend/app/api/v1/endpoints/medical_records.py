"""Medical record endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_doctor
from app.core.exceptions import ForbiddenException
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordRead,
    MedicalRecordUpdate,
)
from app.services.doctor_service import DoctorService
from app.services.medical_record_service import MedicalRecordService
from app.services.patient_service import PatientService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[MedicalRecordRead])
async def list_medical_records(
    session: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    patient_id: str | None = None,
    doctor_id: str | None = None,
):
    svc = MedicalRecordService(session)

    # Scope by role
    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        patient_id = pat.id
    elif current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        doctor_id = doc.id
    elif current_user.role == "receptionist":
        raise ForbiddenException("Receptionists cannot access medical records")

    result = await svc.list_records(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        patient_id=patient_id,
        doctor_id=doctor_id,
    )
    result["items"] = [svc.to_read(r) for r in result["items"]]
    return result


@router.get("/{record_id}", response_model=MedicalRecordRead)
async def get_medical_record(
    record_id: str,
    session: DBSession,
    current_user: CurrentUser,
):
    if current_user.role == "receptionist":
        raise ForbiddenException("Receptionists cannot access medical records")

    svc = MedicalRecordService(session)
    record = await svc.get_record(record_id)

    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        if record.patient_id != pat.id:
            raise ForbiddenException()
    elif current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        if record.doctor_id != doc.id:
            raise ForbiddenException()

    return svc.to_read(record)


@router.post("", response_model=MedicalRecordRead, status_code=201)
async def create_medical_record(
    data: MedicalRecordCreate,
    session: DBSession,
    current_user: CurrentUser = Depends(require_doctor),
):
    # Only doctors/admins can create records
    if current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        if data.doctor_id != doc.id:
            raise ForbiddenException("Can only create records under your own name")

    svc = MedicalRecordService(session)
    record = await svc.create_record(data)
    return svc.to_read(record)


@router.patch("/{record_id}", response_model=MedicalRecordRead)
async def update_medical_record(
    record_id: str,
    data: MedicalRecordUpdate,
    session: DBSession,
    current_user: CurrentUser = Depends(require_doctor),
):
    svc = MedicalRecordService(session)
    record = await svc.get_record(record_id)

    if current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        if record.doctor_id != doc.id:
            raise ForbiddenException()

    result = await svc.update_record(record_id, data)
    return svc.to_read(result)


@router.delete("/{record_id}", response_model=MessageResponse)
async def delete_medical_record(
    record_id: str,
    session: DBSession,
    current_user: CurrentUser = Depends(require_doctor),
):
    svc = MedicalRecordService(session)
    await svc.delete_record(record_id)
    return MessageResponse(detail="Medical record deleted")
