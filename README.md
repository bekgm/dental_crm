# DentalCRM — Dental Clinic Management Platform

Production-ready SaaS for managing dental clinics with role-based access control, appointment scheduling, medical records, invoicing, and analytics.

## Tech Stack

| Layer | Technology |
|----------|--------------------------------------|
| Backend | FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| Frontend | React 18, TypeScript, Vite, MUI, Zustand |
| DevOps | Docker, docker-compose |

## Quick Start

```bash
# Clone and start
cp backend/.env.example backend/.env
docker-compose up --build

# Backend:  http://localhost:8000/docs
# Frontend: http://localhost:5173
```

## Roles

| Role | Capabilities |
|--------------|----------------------------------------------|
| admin | Full system access, analytics, user management |
| doctor | Own appointments, patient records, medical records |
| receptionist | Patient CRUD, scheduling, payments |
| patient | Own profile, booking, visit history |

## Project Structure

```
dentFlow/
├── backend/
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Config, security, deps
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   └── middleware/     # Logging, error handling
│   ├── alembic/           # Migrations
│   └── tests/             # pytest suite
├── frontend/
│   └── src/
│       ├── api/           # Axios client
│       ├── components/    # Reusable UI
│       ├── pages/         # Route pages
│       ├── store/         # Zustand stores
│       ├── hooks/         # Custom hooks
│       └── types/         # TypeScript types
└── docker-compose.yml
```
