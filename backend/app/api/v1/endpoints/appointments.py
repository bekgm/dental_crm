"""Appointment endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_staff
from app.core.exceptions import ForbiddenException
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentUpdate
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.appointment_service import AppointmentService
from app.services.doctor_service import DoctorService
from app.services.patient_service import PatientService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[AppointmentRead])
async def list_appointments(
    session: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    status: str | None = None,
    doctor_id: str | None = None,
    patient_id: str | None = None,
):
    svc = AppointmentService(session)

    # Scope by role
    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        patient_id = pat.id
    elif current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        doctor_id = doc.id

    result = await svc.list_appointments(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        status=status,
        doctor_id=doctor_id,
        patient_id=patient_id,
    )
    result["items"] = [svc.to_read(a) for a in result["items"]]
    return result


@router.get("/{appointment_id}", response_model=AppointmentRead)
async def get_appointment(
    appointment_id: str,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = AppointmentService(session)
    appt = await svc.get_appointment(appointment_id)

    # Verify access
    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        if appt.patient_id != pat.id:
            raise ForbiddenException()
    elif current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        if appt.doctor_id != doc.id:
            raise ForbiddenException()

    return svc.to_read(appt)


@router.post("", response_model=AppointmentRead, status_code=201)
async def create_appointment(
    data: AppointmentCreate,
    session: DBSession,
    current_user: CurrentUser,
):
    # Patients can book for themselves, staff for anyone
    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        if data.patient_id != pat.id:
            raise ForbiddenException("You can only book for yourself")
    elif current_user.role not in ("admin", "receptionist"):
        raise ForbiddenException()

    svc = AppointmentService(session)
    appt = await svc.create_appointment(data)
    return svc.to_read(appt)


@router.patch("/{appointment_id}", response_model=AppointmentRead)
async def update_appointment(
    appointment_id: str,
    data: AppointmentUpdate,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = AppointmentService(session)
    appt = await svc.get_appointment(appointment_id)

    # Doctors can only update status of their own appointments
    if current_user.role == "doctor":
        dsvc = DoctorService(session)
        doc = await dsvc.get_doctor_by_user_id(current_user.id)
        if appt.doctor_id != doc.id:
            raise ForbiddenException()
    elif current_user.role not in ("admin", "receptionist"):
        raise ForbiddenException()

    result = await svc.update_appointment(appointment_id, data)
    return svc.to_read(result)


@router.delete("/{appointment_id}", response_model=MessageResponse)
async def delete_appointment(
    appointment_id: str,
    session: DBSession,
    _staff: User = Depends(require_staff),
):
    svc = AppointmentService(session)
    await svc.delete_appointment(appointment_id)
    return MessageResponse(detail="Appointment deleted")
