"""V1 API router — aggregates all sub-routers."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    appointments,
    auth,
    dashboard,
    doctors,
    invoices,
    medical_records,
    patients,
    services,
    upload,
    users,
)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(patients.router, prefix="/patients", tags=["Patients"])
router.include_router(doctors.router, prefix="/doctors", tags=["Doctors"])
router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
router.include_router(medical_records.router, prefix="/medical-records", tags=["Medical Records"])
router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
router.include_router(services.router, prefix="/services", tags=["Services"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(upload.router, prefix="/upload", tags=["Upload"])
