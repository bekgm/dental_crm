"""Invoice service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.invoice import Invoice
from app.repositories.invoice_repo import InvoiceRepository
from app.schemas.invoice import InvoiceCreate, InvoiceRead, InvoiceUpdate


class InvoiceService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = InvoiceRepository(session)

    async def list_invoices(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        status: str | None = None,
        patient_id: str | None = None,
    ) -> dict[str, Any]:
        filters = []
        if status:
            filters.append(Invoice.status == status)
        if patient_id:
            filters.append(Invoice.patient_id == patient_id)
        return await self.repo.paginate(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            filters=filters or None,
        )

    async def get_invoice(self, invoice_id: str) -> Invoice:
        invoice = await self.repo.get_by_id(invoice_id)
        if not invoice:
            raise NotFoundException("Invoice")
        return invoice

    async def create_invoice(self, data: InvoiceCreate) -> Invoice:
        total = data.amount + data.tax - data.discount
        if total < 0:
            raise BadRequestException("Total cannot be negative")

        return await self.repo.create(
            patient_id=data.patient_id,
            appointment_id=data.appointment_id,
            amount=data.amount,
            tax=data.tax,
            discount=data.discount,
            total=total,
            description=data.description,
            due_date=data.due_date,
            payment_method=data.payment_method,
        )

    async def update_invoice(
        self, invoice_id: str, data: InvoiceUpdate
    ) -> Invoice:
        invoice = await self.repo.get_by_id(invoice_id)
        if not invoice:
            raise NotFoundException("Invoice")

        update_data = data.model_dump(exclude_unset=True)

        # Recalculate total if amount fields change
        amount = update_data.get("amount", invoice.amount)
        tax = update_data.get("tax", invoice.tax)
        discount = update_data.get("discount", invoice.discount)
        update_data["total"] = amount + tax - discount

        # Track payment time
        if update_data.get("status") == "paid" and not invoice.paid_at:
            update_data["paid_at"] = datetime.now(timezone.utc)

        result = await self.repo.update(invoice_id, **update_data)
        return result  # type: ignore[return-value]

    async def delete_invoice(self, invoice_id: str) -> None:
        deleted = await self.repo.delete(invoice_id)
        if not deleted:
            raise NotFoundException("Invoice")

    def to_read(self, invoice: Invoice) -> InvoiceRead:
        return InvoiceRead(
            id=invoice.id,
            patient_id=invoice.patient_id,
            appointment_id=invoice.appointment_id,
            amount=invoice.amount,
            tax=invoice.tax,
            discount=invoice.discount,
            total=invoice.total,
            status=invoice.status,
            payment_method=invoice.payment_method,
            description=invoice.description,
            due_date=invoice.due_date,
            paid_at=invoice.paid_at,
            patient_name=invoice.patient.user.full_name if invoice.patient else None,
            created_at=invoice.created_at,
        )
