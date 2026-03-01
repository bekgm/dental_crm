"""User model — authentication entity used by all roles."""

from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # admin | doctor | receptionist | patient
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    doctor_profile: Mapped["Doctor | None"] = relationship(  # type: ignore[name-defined]
        "Doctor", back_populates="user", uselist=False, lazy="selectin",
    )
    patient_profile: Mapped["Patient | None"] = relationship(  # type: ignore[name-defined]
        "Patient", back_populates="user", uselist=False, lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User {self.email} role={self.role}>"
