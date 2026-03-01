"""Invoice endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import CurrentUser, DBSession, require_receptionist
from app.core.exceptions import ForbiddenException
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.invoice import InvoiceCreate, InvoiceRead, InvoiceUpdate
from app.services.invoice_service import InvoiceService
from app.services.patient_service import PatientService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[InvoiceRead])
async def list_invoices(
    session: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str | None = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    status: str | None = None,
    patient_id: str | None = None,
):
    svc = InvoiceService(session)

    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        patient_id = pat.id
    elif current_user.role == "doctor":
        raise ForbiddenException("Doctors cannot access invoices")

    result = await svc.list_invoices(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        status=status,
        patient_id=patient_id,
    )
    result["items"] = [svc.to_read(i) for i in result["items"]]
    return result


@router.get("/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(
    invoice_id: str,
    session: DBSession,
    current_user: CurrentUser,
):
    svc = InvoiceService(session)
    invoice = await svc.get_invoice(invoice_id)

    if current_user.role == "patient":
        psvc = PatientService(session)
        pat = await psvc.get_patient_by_user_id(current_user.id)
        if invoice.patient_id != pat.id:
            raise ForbiddenException()
    elif current_user.role == "doctor":
        raise ForbiddenException()

    return svc.to_read(invoice)


@router.post("", response_model=InvoiceRead, status_code=201)
async def create_invoice(
    data: InvoiceCreate,
    session: DBSession,
    _staff: CurrentUser = Depends(require_receptionist),
):
    svc = InvoiceService(session)
    invoice = await svc.create_invoice(data)
    return svc.to_read(invoice)


@router.patch("/{invoice_id}", response_model=InvoiceRead)
async def update_invoice(
    invoice_id: str,
    data: InvoiceUpdate,
    session: DBSession,
    _staff: CurrentUser = Depends(require_receptionist),
):
    svc = InvoiceService(session)
    invoice = await svc.update_invoice(invoice_id, data)
    return svc.to_read(invoice)


@router.delete("/{invoice_id}", response_model=MessageResponse)
async def delete_invoice(
    invoice_id: str,
    session: DBSession,
    _staff: CurrentUser = Depends(require_receptionist),
):
    svc = InvoiceService(session)
    await svc.delete_invoice(invoice_id)
    return MessageResponse(detail="Invoice deleted")
