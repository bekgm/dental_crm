"""Doctor schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class DoctorCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=255)
    phone: Optional[str] = None
    specialization: str = Field(min_length=2, max_length=255)
    license_number: str = Field(min_length=2, max_length=100)
    bio: Optional[str] = None
    years_of_experience: Optional[int] = Field(None, ge=0)


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None


class DoctorRead(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    specialization: str
    license_number: str
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
