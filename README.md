# DZ-Bridge - Algerian Expert & Diaspora Matchmaking Platform

**National Technology & Knowledge Transfer Ecosystem · Algerian Scholar Award**

DZ-Bridge connects Algerian diaspora scholars, local university researchers, and institutions (universities, laboratories, and startups) for high-impact academic and industrial collaboration.

---

## 🚀 Quick Start on Linux (Ubuntu / Debian)

A master management script **`manage_app.sh`** is provided in the project root to automate system setup, dependency installation, service orchestration, backups, and maintenance.

### 1. Make the script executable:
```bash
chmod +x manage_app.sh
```

### 2. Interactive Menu Mode (Recommended):
Run the script without arguments to open the interactive terminal menu:
```bash
./manage_app.sh
```

### 3. Command-Line Usage (CLI Flags):
```bash
# Automated environment setup (apt packages, Python venv, Node/npm, migrations, seeding):
./manage_app.sh setup

# Start all services (Django backend on :8000 + React frontend on :3000 in background):
./manage_app.sh start

# Check runtime status, open ports, memory usage, and health probes:
./manage_app.sh status

# Gracefully stop all background services:
./manage_app.sh stop

# Restart services:
./manage_app.sh restart

# Create a compressed timestamped backup (.tar.gz) of the database and configs:
./manage_app.sh backup

# Restore from a backup archive:
./manage_app.sh restore [backup_filename.tar.gz]

# Re-seed the database with Algerian Scholar Award laureates & universities:
./manage_app.sh seed

# Run Django unit tests and React TypeScript compile checks:
./manage_app.sh test

# Stream live service logs:
./manage_app.sh logs both      # Or: logs backend / logs frontend

# Clean temporary bytecode, cache, and old logs:
./manage_app.sh clean

# Start / stop via Docker Compose:
./manage_app.sh docker-up
./manage_app.sh docker-down

# View all available commands and help:
./manage_app.sh help
```

---

## 🌐 Default Ports & Service URLs

| Service | Port | Local URL | Description |
| :--- | :--- | :--- | :--- |
| **React Management Console** | `3000` | [`http://localhost:3000`](http://localhost:3000) | Web frontend with API Manager, Role Switcher & Database Studio |
| **Django DRF Test Client** | `8000` | [`http://localhost:8000/`](http://localhost:8000/) | Dedicated simple frontend to test Django backend services |
| **Swagger Interactive Docs** | `8000` | [`http://localhost:8000/api/docs/`](http://localhost:8000/api/docs/) | OpenAPI 3.0 interactive endpoints schema |
| **Django Admin Panel** | `8000` | [`http://localhost:8000/admin/`](http://localhost:8000/admin/) | Django administrative database console |

---

## 👥 Seed Credentials (Pre-Configured)

All test accounts use the password: **`DzBridge2026!`**

| Role | Email | Name / Affiliation |
| :--- | :--- | :--- |
| **Super Admin** | `admin@dz-bridge.dz` | Directeur Général DZ-Bridge (MESRS) |
| **Diaspora Expert** | `belgacem.haba@algerian-scholars.dz` | Prof. Belgacem Haba (Adeia / Silicon Valley) |
| **Diaspora Expert** | `amina.benali@cnrs.fr` | Dr. Amina Benali (CNRS Paris & Sorbonne) |
| **University Host** | `contact@esi.dz` | Dr. Rachid Haddad (ESI Algiers) |
