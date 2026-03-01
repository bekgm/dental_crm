"""Invoice schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InvoiceCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    amount: float = Field(gt=0)
    tax: float = Field(0.0, ge=0)
    discount: float = Field(0.0, ge=0)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    payment_method: Optional[str] = None


class InvoiceUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    tax: Optional[float] = Field(None, ge=0)
    discount: Optional[float] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(pending|paid|overdue|cancelled)$")
    payment_method: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class InvoiceRead(BaseModel):
    id: str
    patient_id: str
    appointment_id: Optional[str] = None
    amount: float
    tax: float
    discount: float
    total: float
    status: str
    payment_method: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
