"""Service schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    price: float = Field(gt=0)
    duration_minutes: int = Field(30, ge=15, le=480)
    category: Optional[str] = None


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    category: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceRead(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    category: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
