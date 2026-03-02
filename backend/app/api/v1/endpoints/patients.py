"""Patient endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_staff
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.patient import PatientCreate, PatientRead, PatientUpdate
from app.services.patient_service import PatientService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PatientRead])
async def list_patients(
    session: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    search: str | None = None,
):
    # Patients can only see themselves
    if current_user.role == "patient":
        svc = PatientService(session)
        patient = await svc.get_patient_by_user_id(current_user.id)
        return {
            "items": [svc.to_read(patient)],
            "total": 1,
            "page": 1,
            "per_page": 1,
            "total_pages": 1,
        }

    # Staff can list all
    _staff = require_staff(current_user)
    svc = PatientService(session)
    result = await svc.list_patients(
        page=page, per_page=per_page, sort_by=sort_by, sort_order=sort_order, search=search
    )
    result["items"] = [svc.to_read(p) for p in result["items"]]
    return result


@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: str,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = PatientService(session)
    patient = await svc.get_patient(patient_id)
    # Patients can only access their own
    if current_user.role == "patient" and patient.user_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException()
    return svc.to_read(patient)


@router.post("", response_model=PatientRead, status_code=201)
async def create_patient(
    data: PatientCreate,
    session: DBSession,
    _staff: User = Depends(require_staff),
):
    svc = PatientService(session)
    patient = await svc.create_patient(data)
    return svc.to_read(patient)


@router.patch("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: str,
    data: PatientUpdate,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = PatientService(session)
    # Patients can update their own profile
    if current_user.role == "patient":
        patient = await svc.get_patient(patient_id)
        if patient.user_id != current_user.id:
            from app.core.exceptions import ForbiddenException
            raise ForbiddenException()
    else:
        require_staff(current_user)
    patient = await svc.update_patient(patient_id, data)
    return svc.to_read(patient)


@router.delete("/{patient_id}", response_model=MessageResponse)
async def delete_patient(
    patient_id: str,
    session: DBSession,
    _staff: User = Depends(require_staff),
):
    svc = PatientService(session)
    await svc.delete_patient(patient_id)
    return MessageResponse(detail="Patient deleted")
