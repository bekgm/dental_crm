"""Appointment schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    service_id: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = Field(30, ge=15, le=480)
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    doctor_id: Optional[str] = None
    service_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    status: Optional[str] = Field(
        None,
        pattern="^(scheduled|confirmed|in_progress|completed|cancelled|no_show)$",
    )
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None


class AppointmentRead(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    service_id: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int
    status: str
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    service_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
