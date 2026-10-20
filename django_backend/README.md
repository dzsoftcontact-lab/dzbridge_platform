# DZ-Bridge: Django REST Framework (DRF) Backend & Test Client

This directory (`/django_backend/`) contains the complete **Django 5.1 & Django REST Framework (DRF)** backend architecture and its dedicated **simple frontend test client** for seamless integration with the DZ-Bridge matchmaking ecosystem.

---

## 🌟 Architecture & Features

- **Framework**: Django 5.1.2 + Django REST Framework 3.15.2
- **Authentication**: Stateless JWT via `djangorestframework-simplejwt`
- **Database Support**: PostgreSQL 16 (UUID, JSONB, GIN) with SQLite3 development fallback
- **Interactive DRF Frontend Client**: Located at `/django_backend/templates/test_client.html`, served directly at `http://localhost:8000/` and `http://localhost:8000/test-client/`.
- **OpenAPI 3.0 / Swagger**: Integrated via `drf-spectacular` at `http://localhost:8000/api/docs/`.
- **4-Factor Algorithmic Matchmaking**: Implemented in `apps/matches/engine.py` (Skills 45%, Availability 25%, Location 15%, Diaspora 15%).
- **Immutable Audit Logging**: Automatic `ActivityLoggerMiddleware` recording mutating operations into `activity_logs`.

---

## 🚀 Quick Start (Running Django Locally)

### 1. Create and Activate Python Virtual Environment
```bash
cd django_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create an Admin Superuser (Optional)
```bash
python manage.py createsuperuser --email admin@dz-bridge.dz
```

### 5. Launch Development Server
```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 🖥️ Accessing the Built-In DRF Frontend Test Client

Once the server is running on port `8000`:
- **Simple Frontend Test Client**: Open [`http://localhost:8000/`](http://localhost:8000/) or [`http://localhost:8000/test-client/`](http://localhost:8000/test-client/) in your browser.
- **Interactive Swagger Documentation**: [`http://localhost:8000/api/docs/`](http://localhost:8000/api/docs/)
- **Django Administration Console**: [`http://localhost:8000/admin/`](http://localhost:8000/admin/)

---

## 🔗 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register/` | Register new Expert or Organization |
| `POST` | `/api/v1/auth/login/` | Obtain JWT Bearer Token |
| `GET`  | `/api/v1/profiles/me/` | Current User Profile & Preferences |
| `POST` | `/api/v1/profiles/availability/` | Declare Algeria Visit Window |
| `GET`  | `/api/v1/projects/` | List and filter tech-transfer proposals |
| `POST` | `/api/v1/projects/` | University submits new project |
| `PATCH`| `/api/v1/projects/<id>/status/` | Finite state machine transition |
| `GET`  | `/api/v1/matches/recommendations/` | 4-Factor Compatibility Calculation |
| `POST` | `/api/v1/matches/<id>/respond/` | Expert accepts/declines invitation |
| `POST` | `/api/v1/collaborations/confirm/` | Confirm bilateral cooperation agreement |
| `GET`  | `/api/v1/audit/logs/` | Query immutable activity audit logs |
