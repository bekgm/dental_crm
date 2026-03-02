"""Doctor endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_admin
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.doctor import DoctorCreate, DoctorRead, DoctorUpdate
from app.services.doctor_service import DoctorService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[DoctorRead])
async def list_doctors(
    session: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    search: str | None = None,
):
    svc = DoctorService(session)
    result = await svc.list_doctors(
        page=page, per_page=per_page, sort_by=sort_by, sort_order=sort_order, search=search
    )
    result["items"] = [svc.to_read(d) for d in result["items"]]
    return result


@router.get("/{doctor_id}", response_model=DoctorRead)
async def get_doctor(
    doctor_id: str,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = DoctorService(session)
    doctor = await svc.get_doctor(doctor_id)
    return svc.to_read(doctor)


@router.post("", response_model=DoctorRead, status_code=201)
async def create_doctor(
    data: DoctorCreate,
    session: DBSession,
    _admin: User = Depends(require_admin),
):
    svc = DoctorService(session)
    doctor = await svc.create_doctor(data)
    return svc.to_read(doctor)


@router.patch("/{doctor_id}", response_model=DoctorRead)
async def update_doctor(
    doctor_id: str,
    data: DoctorUpdate,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = DoctorService(session)
    # Doctors can update their own profile
    if current_user.role == "doctor":
        doctor = await svc.get_doctor(doctor_id)
        if doctor.user_id != current_user.id:
            from app.core.exceptions import ForbiddenException
            raise ForbiddenException()
    else:
        require_admin(current_user)
    doctor = await svc.update_doctor(doctor_id, data)
    return svc.to_read(doctor)


@router.delete("/{doctor_id}", response_model=MessageResponse)
async def delete_doctor(
    doctor_id: str,
    session: DBSession,
    _admin: User = Depends(require_admin),
):
    svc = DoctorService(session)
    await svc.delete_doctor(doctor_id)
    return MessageResponse(detail="Doctor deleted")
