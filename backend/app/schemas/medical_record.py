"""Medical record schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MedicalRecordCreate(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    treatment: str
    prescription: Optional[str] = None
    tooth_number: Optional[str] = None
    notes: Optional[str] = None


class MedicalRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    tooth_number: Optional[str] = None
    xray_file: Optional[str] = None
    notes: Optional[str] = None


class MedicalRecordRead(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    treatment: str
    prescription: Optional[str] = None
    tooth_number: Optional[str] = None
    xray_file: Optional[str] = None
    notes: Optional[str] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
