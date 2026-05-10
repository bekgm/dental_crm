# DentalCRM — Dental Clinic Management Platform

A production-ready SaaS platform for managing dental clinics with comprehensive role-based access control, appointment scheduling, patient medical records, invoicing, and real-time analytics.

## Features

- **Multi-role Access Control**: Admin, Doctor, Receptionist, and Patient roles with granular permissions
- **Appointment Scheduling**: Real-time booking system with conflict detection and reminders
- **Patient Management**: Complete patient profiles with medical histories and treatment plans
- **Medical Records**: Secure storage and retrieval of medical documentation
- **Invoicing System**: Automated billing and payment tracking
- **Analytics Dashboard**: Real-time insights into clinic performance and metrics
- **Enterprise Security**: JWT-based authentication with refresh token rotation
- **High Performance**: Async-first architecture with optimized database queries
- **Docker Ready**: One-command setup with Docker Compose

## Tech Stack

| Layer | Technology |
|----------|--------------------------------------|
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16 with async support |
| **Authentication** | JWT (access + refresh tokens) |
| **Frontend** | React 18, TypeScript, Vite, Material-UI, Zustand |
| **DevOps** | Docker, Docker Compose |

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dental_crm

# Setup environment variables
cp backend/.env.example backend/.env

# Start all services
docker-compose up --build
```

### Access Points
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173

## Role-Based Access Control

| Role | Key Capabilities |
|---|---|
| **Admin** | Full system access, user management, analytics, system configuration |
| **Doctor** | View own appointments, manage patient medical records, treatment planning |
| **Receptionist** | Patient management, appointment scheduling, payment processing |
| **Patient** | View own profile, book appointments, access visit history, medical records |

## Project Structure

```
dental_crm/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/       # API endpoints (auth, appointments, etc.)
│   │   │   └── router.py        # Route aggregation
│   │   ├── core/
│   │   │   ├── config.py        # Application configuration
│   │   │   ├── database.py      # Database connection
│   │   │   ├── security.py      # JWT & auth utilities
│   │   │   ├── deps.py          # Dependency injection
│   │   │   └── exceptions.py    # Custom exceptions
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business logic layer
│   │   ├── repositories/        # Data access patterns
│   │   ├── middleware/          # Logging, error handling
│   │   ├── main.py              # Application entry point
│   │   ├── seed.py              # Database seeding
│   │   └── tasks.py             # Background tasks
│   ├── alembic/                 # Database migrations
│   ├── tests/                   # Unit & integration tests
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # HTTP client & API services
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page-level components
│   │   ├── store/               # Zustand state management
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml           # Multi-container orchestration
├── README.md
└── LICENSE
```

## Development Setup

### Backend Development

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed sample data
python -m app.seed

# Start development server
python -m uvicorn app.main:app --reload

# Run tests
pytest tests/
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive Swagger UI documentation.

### Key Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/patients` - List patients
- `GET /api/v1/doctors` - List doctors
- `GET /api/v1/dashboard/analytics` - Get dashboard metrics

## Database Schema

The system includes the following main entities:

- **Users** - System users (admin, doctor, receptionist, patient)
- **Doctors** - Doctor profiles with specializations
- **Patients** - Patient information and contact details
- **Appointments** - Appointment scheduling and status tracking
- **Medical Records** - Patient medical history documentation
- **Services** - Available dental services and treatments
- **Invoices** - Billing and payment records

Run migrations to create all tables:
```bash
alembic upgrade head
```

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app tests/
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dental_crm

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM=noreply@dentalcrm.com
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.
