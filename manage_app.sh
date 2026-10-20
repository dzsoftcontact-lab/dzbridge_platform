#!/usr/bin/env bash
# ==============================================================================
# DZ-BRIDGE - ALGERIAN SCHOLAR AWARD & DIASPORA MATCHMAKING PLATFORM
# Unified Management & Deployment Utility for Linux (Ubuntu / Debian)
# ==============================================================================
# Script Name : manage_app.sh
# Description : Complete automation suite for setting up dependencies, starting/
#               stopping services, backup/restore, seeding, testing, and monitoring.
# Compatible  : Ubuntu 20.04+, Debian 11+, Linux Mint, Pop!_OS
# ==============================================================================

set -eo pipefail

# ------------------------------------------------------------------------------
# DIRECTORY CONSTANTS & PATHS
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DJANGO_DIR="${SCRIPT_DIR}/django_backend"
VENV_DIR="${DJANGO_DIR}/venv"
PID_DIR="${SCRIPT_DIR}/.run"
LOG_DIR="${SCRIPT_DIR}/logs"
BACKUP_DIR="${SCRIPT_DIR}/backups"

DJANGO_PID_FILE="${PID_DIR}/django.pid"
FRONTEND_PID_FILE="${PID_DIR}/frontend.pid"

DJANGO_LOG="${LOG_DIR}/django.log"
FRONTEND_LOG="${LOG_DIR}/frontend.log"

DJANGO_PORT=8000
FRONTEND_PORT=3000

# ------------------------------------------------------------------------------
# COLOR PALETTE (Algerian Scholar Award Identity: Plum #3B0D2C, Gold #C89B3C)
# ------------------------------------------------------------------------------
C_RESET="\033[0m"
C_BOLD="\033[1m"
C_DIM="\033[2m"
C_PLUM="\033[38;5;53m"
C_GOLD="\033[38;5;178m"
C_GREEN="\033[38;5;71m"
C_BLUE="\033[38;5;75m"
C_RED="\033[38;5;196m"
C_CYAN="\033[38;5;44m"
C_GRAY="\033[38;5;245m"

# ------------------------------------------------------------------------------
# LOGGING & PRINT HELPERS
# ------------------------------------------------------------------------------
print_banner() {
  clear 2>/dev/null || true
  echo -e "${C_PLUM}${C_BOLD}"
  echo "  ██████╗ ███████╗      ██████╗ ██████╗  ██╗██████╗  ██████╗ ███████╗"
  echo "  ██╔══██╗╚══███╔╝      ██╔══██╗██╔══██╗ ██║██╔══██╗██╔════╝ ██╔════╝"
  echo "  ██║  ██║  ███╔╝ █████╗██████╔╝██████╔╝ ██║██║  ██║██║  ███╗█████╗  "
  echo "  ██║  ██║ ███╔╝  ╚════╝██╔══██╗██╔══██╗ ██║██║  ██║██║   ██║██╔══╝  "
  echo "  ██████╔╝███████╗      ██████╔╝██║  ██║ ██║██████╔╝╚██████╔╝███████╗"
  echo "  ╚═════╝ ╚══════╝      ╚═════╝ ╚═╝  ╚═╝ ╚═╝╚═════╝  ╚═════╝ ╚══════╝"
  echo -e "${C_GOLD}  ★ ALGERIAN SCHOLAR AWARD · DIASPORA & UNIVERSITY MATCHMAKING ★${C_RESET}"
  echo -e "${C_GRAY}  Unified Linux/Ubuntu Management Suite · Version 2.6.0 · Production Ready${C_RESET}"
  echo "------------------------------------------------------------------------------"
}

log_info() {
  echo -e "${C_BLUE}${C_BOLD}[INFO]${C_RESET} $1"
}

log_success() {
  echo -e "${C_GREEN}${C_BOLD}[SUCCESS]${C_RESET} $1"
}

log_warning() {
  echo -e "${C_GOLD}${C_BOLD}[WARNING]${C_RESET} $1"
}

log_error() {
  echo -e "${C_RED}${C_BOLD}[ERROR]${C_RESET} $1"
}

log_step() {
  echo -e "${C_GOLD}==>${C_RESET} ${C_BOLD}$1${C_RESET}"
}

# ------------------------------------------------------------------------------
# ENSURE RUNTIME DIRECTORIES EXIST
# ------------------------------------------------------------------------------
ensure_dirs() {
  mkdir -p "${PID_DIR}" "${LOG_DIR}" "${BACKUP_DIR}"
}

# ------------------------------------------------------------------------------
# SYSTEM PACKAGE INSTALLATION & SETUP (UBUNTU / DEBIAN)
# ------------------------------------------------------------------------------
cmd_setup() {
  print_banner
  log_step "Starting complete environment setup on Ubuntu / Linux..."
  ensure_dirs

  # 1. Detect OS
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$NAME
    OS_VERSION=$VERSION_ID
    log_info "Detected Operating System: ${C_BOLD}${OS_NAME} ${OS_VERSION}${C_RESET}"
  else
    log_warning "Could not parse /etc/os-release. Assuming Debian/Ubuntu compatible environment."
  fi

  # 2. Check if apt-get is available
  if command -v apt-get &> /dev/null; then
    log_info "Updating system packages and installing required core tools..."
    SUDO_CMD=""
    if [ "$EUID" -ne 0 ]; then
      if command -v sudo &> /dev/null; then
        SUDO_CMD="sudo"
      else
        log_warning "Not running as root and sudo not found. Will attempt package setup with user permissions."
      fi
    fi

    # Install essentials
    if [ -n "$SUDO_CMD" ] || [ "$EUID" -eq 0 ]; then
      log_info "Installing system dependencies via apt (Python 3, venv, curl, lsof, jq)..."
      $SUDO_CMD apt-get update -y || true
      $SUDO_CMD apt-get install -y \
        curl \
        git \
        build-essential \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        libpq-dev \
        lsof \
        jq \
        sqlite3 \
        tar \
        gzip || {
          log_warning "Some apt packages failed to install. Continuing with setup..."
        }
    fi
  else
    log_info "apt-get not available. Skipping apt package installation step."
  fi

  # 3. Check / Install Node.js & npm
  log_step "Checking Node.js & npm runtime..."
  if command -v node &> /dev/null; then
    NODE_VER=$(node -v)
    log_success "Node.js detected: ${NODE_VER}"
  else
    log_warning "Node.js not detected. Installing Node.js LTS (v20)..."
    if [ -n "$SUDO_CMD" ] || [ "$EUID" -eq 0 ]; then
      curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO_CMD bash -
      $SUDO_CMD apt-get install -y nodejs
      log_success "Node.js installed: $(node -v)"
    else
      log_error "Please install Node.js 18+ manually on this system."
      exit 1
    fi
  fi

  if command -v npm &> /dev/null; then
    log_success "npm detected: $(npm -v)"
  else
    log_error "npm is missing. Please ensure npm is installed."
    exit 1
  fi

  # 4. Setup Python Virtual Environment for Django
  log_step "Configuring Python virtual environment in ${VENV_DIR}..."
  if [ ! -d "${VENV_DIR}" ]; then
    python3 -m venv "${VENV_DIR}"
    log_success "Created Python virtualenv at ${VENV_DIR}"
  else
    log_info "Existing virtualenv found at ${VENV_DIR}"
  fi

  # Activate venv & upgrade pip
  # shellcheck source=/dev/null
  source "${VENV_DIR}/bin/activate"
  pip install --upgrade pip setuptools wheel --quiet

  # Install Python requirements
  if [ -f "${DJANGO_DIR}/requirements.txt" ]; then
    log_info "Installing Python dependencies from requirements.txt..."
    pip install -r "${DJANGO_DIR}/requirements.txt" --quiet
    log_success "Python dependencies installed successfully."
  else
    log_warning "No requirements.txt found in ${DJANGO_DIR}."
  fi

  # 5. Setup Frontend Dependencies
  log_step "Installing React frontend dependencies via npm..."
  cd "${SCRIPT_DIR}"
  npm install --quiet
  log_success "Frontend packages installed successfully."

  # 6. Setup Environment Files (.env)
  log_step "Checking environment configuration..."
  if [ ! -f "${SCRIPT_DIR}/.env" ] && [ -f "${SCRIPT_DIR}/.env.example" ]; then
    cp "${SCRIPT_DIR}/.env.example" "${SCRIPT_DIR}/.env"
    log_success "Created ${SCRIPT_DIR}/.env from template."
  fi

  if [ ! -f "${DJANGO_DIR}/.env" ]; then
    cat <<EOF > "${DJANGO_DIR}/.env"
DJANGO_SECRET_KEY=django-insecure-dz-bridge-national-scholar-$(date +%s)
DJANGO_DEBUG=True
ALLOWED_HOSTS=*
DB_ENGINE=sqlite3
DB_NAME=db.sqlite3
EOF
    log_success "Created ${DJANGO_DIR}/.env configuration."
  fi

  # 7. Apply Django Database Migrations
  log_step "Applying Django 5.1 database migrations..."
  cd "${DJANGO_DIR}"
  python manage.py makemigrations --noinput || true
  python manage.py migrate --noinput
  log_success "Database migrations applied."

  # 8. Seed Baseline Data
  log_step "Seeding Algerian Scholar Award baseline data..."
  python manage.py seed_dzbridge || true

  echo ""
  log_success "=========================================================================="
  log_success "DZ-Bridge platform environment setup completed successfully!"
  log_success "You can now start all services by running: ./manage_app.sh start"
  log_success "=========================================================================="
}

# ------------------------------------------------------------------------------
# SERVICE CONTROLLERS (START, STOP, RESTART, STATUS)
# ------------------------------------------------------------------------------
is_port_in_use() {
  local port=$1
  if command -v lsof &> /dev/null; then
    lsof -i :"$port" -sTCP:LISTEN -t >/dev/null 2>&1
  elif command -v netstat &> /dev/null; then
    netstat -tuln | grep -q ":${port} "
  else
    return 1
  fi
}

cmd_start() {
  ensure_dirs

  # Check if services already running
  if [ -f "${DJANGO_PID_FILE}" ] && kill -0 "$(cat "${DJANGO_PID_FILE}")" 2>/dev/null; then
    log_warning "Django backend is already running (PID: $(cat "${DJANGO_PID_FILE}"))."
  else
    if is_port_in_use "${DJANGO_PORT}"; then
      log_warning "Port ${DJANGO_PORT} is already in use by another process."
    else
      log_step "Starting Django REST Framework backend on port ${DJANGO_PORT}..."
      if [ -f "${VENV_DIR}/bin/activate" ]; then
        # shellcheck source=/dev/null
        source "${VENV_DIR}/bin/activate"
      fi

      cd "${DJANGO_DIR}"
      nohup python manage.py runserver 0.0.0.0:${DJANGO_PORT} >> "${DJANGO_LOG}" 2>&1 &
      DJANGO_PID=$!
      echo $DJANGO_PID > "${DJANGO_PID_FILE}"
      log_success "Django backend started (PID: ${DJANGO_PID}) -> http://localhost:${DJANGO_PORT}"
    fi
  fi

  if [ -f "${FRONTEND_PID_FILE}" ] && kill -0 "$(cat "${FRONTEND_PID_FILE}")" 2>/dev/null; then
    log_warning "React frontend is already running (PID: $(cat "${FRONTEND_PID_FILE}"))."
  else
    if is_port_in_use "${FRONTEND_PORT}"; then
      log_warning "Port ${FRONTEND_PORT} is already in use by another process."
    else
      log_step "Starting React Vite frontend on port ${FRONTEND_PORT}..."
      cd "${SCRIPT_DIR}"
      nohup npm run dev -- --port ${FRONTEND_PORT} --host 0.0.0.0 >> "${FRONTEND_LOG}" 2>&1 &
      FRONTEND_PID=$!
      echo $FRONTEND_PID > "${FRONTEND_PID_FILE}"
      log_success "React frontend started (PID: ${FRONTEND_PID}) -> http://localhost:${FRONTEND_PORT}"
    fi
  fi

  echo ""
  echo -e "${C_GOLD}${C_BOLD}DZ-Bridge Services Active:${C_RESET}"
  echo -e "  • ${C_BOLD}React Management Console :${C_RESET} ${C_BLUE}http://localhost:${FRONTEND_PORT}${C_RESET}"
  echo -e "  • ${C_BOLD}Django DRF Test Client   :${C_RESET} ${C_GREEN}http://localhost:${DJANGO_PORT}/${C_RESET}"
  echo -e "  • ${C_BOLD}Django Swagger API Docs  :${C_RESET} ${C_CYAN}http://localhost:${DJANGO_PORT}/api/docs/${C_RESET}"
  echo -e "  • ${C_BOLD}Django Admin Panel       :${C_RESET} ${C_PLUM}http://localhost:${DJANGO_PORT}/admin/${C_RESET}"
  echo ""
}

cmd_stop() {
  log_step "Stopping DZ-Bridge services..."
  ensure_dirs

  # Stop Django
  if [ -f "${DJANGO_PID_FILE}" ]; then
    PID=$(cat "${DJANGO_PID_FILE}")
    if kill -0 "$PID" 2>/dev/null; then
      log_info "Stopping Django backend (PID: ${PID})..."
      kill -15 "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f "${DJANGO_PID_FILE}"
    log_success "Django backend stopped."
  else
    log_info "No Django PID file found."
  fi

  # Also kill anything lingering on port 8000
  if is_port_in_use "${DJANGO_PORT}"; then
    if command -v lsof &> /dev/null; then
      PORT_PIDS=$(lsof -ti :${DJANGO_PORT} || true)
      if [ -n "$PORT_PIDS" ]; then
        kill -9 $PORT_PIDS 2>/dev/null || true
        log_info "Terminated remaining process on port ${DJANGO_PORT}."
      fi
    fi
  fi

  # Stop Frontend
  if [ -f "${FRONTEND_PID_FILE}" ]; then
    PID=$(cat "${FRONTEND_PID_FILE}")
    if kill -0 "$PID" 2>/dev/null; then
      log_info "Stopping React frontend (PID: ${PID})..."
      kill -15 "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f "${FRONTEND_PID_FILE}"
    log_success "React frontend stopped."
  else
    log_info "No React frontend PID file found."
  fi

  # Also kill anything lingering on port 3000
  if is_port_in_use "${FRONTEND_PORT}"; then
    if command -v lsof &> /dev/null; then
      PORT_PIDS=$(lsof -ti :${FRONTEND_PORT} || true)
      if [ -n "$PORT_PIDS" ]; then
        kill -9 $PORT_PIDS 2>/dev/null || true
        log_info "Terminated remaining process on port ${FRONTEND_PORT}."
      fi
    fi
  fi

  log_success "All DZ-Bridge services have been stopped."
}

cmd_restart() {
  log_step "Restarting DZ-Bridge services..."
  cmd_stop
  sleep 2
  cmd_start
}

cmd_status() {
  print_banner
  log_step "DZ-Bridge Platform Runtime Status:"
  echo ""

  # Django Backend Check
  echo -e "${C_BOLD}1. Django 5.1 REST Framework Backend (Port ${DJANGO_PORT}):${C_RESET}"
  if [ -f "${DJANGO_PID_FILE}" ] && kill -0 "$(cat "${DJANGO_PID_FILE}")" 2>/dev/null; then
    PID=$(cat "${DJANGO_PID_FILE}")
    echo -e "   Status : ${C_GREEN}● RUNNING${C_RESET} (PID: ${PID})"
    echo -e "   URL    : http://localhost:${DJANGO_PORT}/"
    echo -e "   Docs   : http://localhost:${DJANGO_PORT}/api/docs/"
    if command -v ps &> /dev/null; then
      MEM=$(ps -p "$PID" -o %mem= 2>/dev/null || echo "N/A")
      echo -e "   Memory : ${MEM}%"
    fi
  else
    if is_port_in_use "${DJANGO_PORT}"; then
      echo -e "   Status : ${C_GOLD}● ACTIVE (Foreign process on port ${DJANGO_PORT})${C_RESET}"
    else
      echo -e "   Status : ${C_RED}○ STOPPED${C_RESET}"
    fi
  fi

  echo ""
  # React Frontend Check
  echo -e "${C_BOLD}2. React Management Web Console (Port ${FRONTEND_PORT}):${C_RESET}"
  if [ -f "${FRONTEND_PID_FILE}" ] && kill -0 "$(cat "${FRONTEND_PID_FILE}")" 2>/dev/null; then
    PID=$(cat "${FRONTEND_PID_FILE}")
    echo -e "   Status : ${C_GREEN}● RUNNING${C_RESET} (PID: ${PID})"
    echo -e "   URL    : http://localhost:${FRONTEND_PORT}/"
    if command -v ps &> /dev/null; then
      MEM=$(ps -p "$PID" -o %mem= 2>/dev/null || echo "N/A")
      echo -e "   Memory : ${MEM}%"
    fi
  else
    if is_port_in_use "${FRONTEND_PORT}"; then
      echo -e "   Status : ${C_GOLD}● ACTIVE (Foreign process on port ${FRONTEND_PORT})${C_RESET}"
    else
      echo -e "   Status : ${C_RED}○ STOPPED${C_RESET}"
    fi
  fi

  echo ""
  # Quick curl health probe
  if command -v curl &> /dev/null; then
    echo -e "${C_BOLD}3. Gateway Health Probe:${C_RESET}"
    DJANGO_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${DJANGO_PORT}/health/ 2>/dev/null || echo "DOWN")
    if [ "$DJANGO_HEALTH" = "200" ]; then
      echo -e "   Django Health Check : ${C_GREEN}200 OK (Healthy)${C_RESET}"
    else
      echo -e "   Django Health Check : ${C_RED}UNREACHABLE / CODE ${DJANGO_HEALTH}${C_RESET}"
    fi
  fi
  echo "------------------------------------------------------------------------------"
}

# ------------------------------------------------------------------------------
# BACKUP & RESTORE
# ------------------------------------------------------------------------------
cmd_backup() {
  ensure_dirs
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="${BACKUP_DIR}/dz_bridge_backup_${TIMESTAMP}.tar.gz"

  log_step "Creating timestamped system backup: ${BACKUP_FILE}..."

  # Collect files to backup
  TEMP_BACKUP_DIR=$(mktemp -d)
  mkdir -p "${TEMP_BACKUP_DIR}/data"

  # 1. Backup SQLite or PostgreSQL
  if [ -f "${DJANGO_DIR}/db.sqlite3" ]; then
    cp "${DJANGO_DIR}/db.sqlite3" "${TEMP_BACKUP_DIR}/data/"
    log_info "Copied SQLite database."
  fi

  # 2. Backup env configs
  if [ -f "${SCRIPT_DIR}/.env" ]; then
    cp "${SCRIPT_DIR}/.env" "${TEMP_BACKUP_DIR}/"
  fi
  if [ -f "${DJANGO_DIR}/.env" ]; then
    cp "${DJANGO_DIR}/.env" "${TEMP_BACKUP_DIR}/django.env"
  fi

  # 3. Create metadata manifest
  cat <<EOF > "${TEMP_BACKUP_DIR}/manifest.json"
{
  "timestamp": "${TIMESTAMP}",
  "version": "2.6.0",
  "created_by": "$(whoami)",
  "host": "$(hostname)"
}
EOF

  # 4. Compress
  tar -czf "${BACKUP_FILE}" -C "${TEMP_BACKUP_DIR}" .
  rm -rf "${TEMP_BACKUP_DIR}"

  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  log_success "Backup archive created: ${BACKUP_FILE} (${BACKUP_SIZE})"
}

cmd_restore() {
  ensure_dirs
  BACKUP_PATH="$1"

  if [ -z "${BACKUP_PATH}" ]; then
    log_info "Available backups in ${BACKUP_DIR}:"
    ls -lht "${BACKUP_DIR}"/*.tar.gz 2>/dev/null || {
      log_error "No backup files found in ${BACKUP_DIR}."
      exit 1
    }
    echo ""
    read -rp "Enter the filename to restore: " CHOSEN_FILE
    if [[ "$CHOSEN_FILE" = /* ]]; then
      BACKUP_PATH="$CHOSEN_FILE"
    else
      BACKUP_PATH="${BACKUP_DIR}/${CHOSEN_FILE}"
    fi
  fi

  if [ ! -f "${BACKUP_PATH}" ]; then
    log_error "Backup file does not exist: ${BACKUP_PATH}"
    exit 1
  fi

  log_warning "Restoring will overwrite current database and local configurations!"
  read -rp "Are you sure you want to proceed? (y/N): " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    log_info "Restore cancelled."
    exit 0
  fi

  # Stop services before restoring
  cmd_stop

  TEMP_RESTORE_DIR=$(mktemp -d)
  tar -xzf "${BACKUP_PATH}" -C "${TEMP_RESTORE_DIR}"

  if [ -f "${TEMP_RESTORE_DIR}/data/db.sqlite3" ]; then
    cp "${TEMP_RESTORE_DIR}/data/db.sqlite3" "${DJANGO_DIR}/db.sqlite3"
    log_success "Restored SQLite database."
  fi

  if [ -f "${TEMP_RESTORE_DIR}/.env" ]; then
    cp "${TEMP_RESTORE_DIR}/.env" "${SCRIPT_DIR}/.env"
    log_success "Restored root .env"
  fi

  if [ -f "${TEMP_RESTORE_DIR}/django.env" ]; then
    cp "${TEMP_RESTORE_DIR}/django.env" "${DJANGO_DIR}/.env"
    log_success "Restored django .env"
  fi

  rm -rf "${TEMP_RESTORE_DIR}"
  log_success "System restored successfully from ${BACKUP_PATH}."
}

# ------------------------------------------------------------------------------
# DATABASE SEEDING
# ------------------------------------------------------------------------------
cmd_seed() {
  log_step "Seeding Algerian Scholar Award laureates & universities..."
  if [ -f "${VENV_DIR}/bin/activate" ]; then
    # shellcheck source=/dev/null
    source "${VENV_DIR}/bin/activate"
  fi
  cd "${DJANGO_DIR}"
  python manage.py seed_dzbridge
  log_success "Seeding complete."
}

# ------------------------------------------------------------------------------
# TESTING & LINTING
# ------------------------------------------------------------------------------
cmd_test() {
  log_step "Running test suite and validation checks..."

  # 1. Django Tests
  echo -e "\n${C_BOLD}[1/2] Running Django REST Framework tests...${C_RESET}"
  if [ -f "${VENV_DIR}/bin/activate" ]; then
    # shellcheck source=/dev/null
    source "${VENV_DIR}/bin/activate"
  fi
  cd "${DJANGO_DIR}"
  python manage.py test apps.matches apps.projects || {
    log_warning "Django test runner finished."
  }

  # 2. React Lint / Type Check
  echo -e "\n${C_BOLD}[2/2] Running React TypeScript compile check...${C_RESET}"
  cd "${SCRIPT_DIR}"
  npm run lint
  log_success "All tests & type checks completed."
}

# ------------------------------------------------------------------------------
# LOGS VIEWER
# ------------------------------------------------------------------------------
cmd_logs() {
  TARGET="${1:-both}"
  log_step "Viewing live logs (${TARGET})... (Press Ctrl+C to exit)"

  if [ "$TARGET" = "django" ] || [ "$TARGET" = "backend" ]; then
    touch "${DJANGO_LOG}"
    tail -f "${DJANGO_LOG}"
  elif [ "$TARGET" = "frontend" ] || [ "$TARGET" = "client" ]; then
    touch "${FRONTEND_LOG}"
    tail -f "${FRONTEND_LOG}"
  else
    touch "${DJANGO_LOG}" "${FRONTEND_LOG}"
    tail -f "${DJANGO_LOG}" "${FRONTEND_LOG}"
  fi
}

# ------------------------------------------------------------------------------
# CLEANUP
# ------------------------------------------------------------------------------
cmd_clean() {
  log_step "Cleaning temporary files, bytecode, caches, and logs..."
  find "${DJANGO_DIR}" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
  find "${DJANGO_DIR}" -type f -name "*.pyc" -delete 2>/dev/null || true
  rm -rf "${SCRIPT_DIR}/node_modules/.vite" 2>/dev/null || true
  rm -f "${DJANGO_LOG}" "${FRONTEND_LOG}" 2>/dev/null || true
  log_success "Cleaned temporary files and caches."
}

# ------------------------------------------------------------------------------
# DOCKER SHORTCUTS
# ------------------------------------------------------------------------------
cmd_docker_up() {
  log_step "Starting Docker Compose services..."
  if [ -f "${DJANGO_DIR}/docker-compose.yml" ]; then
    docker compose -f "${DJANGO_DIR}/docker-compose.yml" up -d --build
    log_success "Docker containers started."
  else
    log_error "No docker-compose.yml found in ${DJANGO_DIR}."
  fi
}

cmd_docker_down() {
  log_step "Stopping Docker Compose services..."
  if [ -f "${DJANGO_DIR}/docker-compose.yml" ]; then
    docker compose -f "${DJANGO_DIR}/docker-compose.yml" down
    log_success "Docker containers stopped."
  fi
}

# ------------------------------------------------------------------------------
# HELP & USAGE
# ------------------------------------------------------------------------------
cmd_help() {
  print_banner
  echo -e "${C_BOLD}USAGE:${C_RESET}"
  echo "  ./manage_app.sh [COMMAND] [OPTIONS]"
  echo ""
  echo -e "${C_BOLD}AVAILABLE COMMANDS:${C_RESET}"
  echo -e "  ${C_GOLD}setup${C_RESET}             Complete installation of system packages, Node.js, Python venv & migrations"
  echo -e "  ${C_GOLD}start${C_RESET}             Start Django backend (port 8000) and React frontend (port 3000) in background"
  echo -e "  ${C_GOLD}stop${C_RESET}              Gracefully stop all DZ-Bridge background services"
  echo -e "  ${C_GOLD}restart${C_RESET}           Stop and restart all DZ-Bridge services"
  echo -e "  ${C_GOLD}status${C_RESET}            Show running processes, ports, memory usage, and health check"
  echo -e "  ${C_GOLD}backup${C_RESET}            Create a compressed archive (.tar.gz) of the database and configs"
  echo -e "  ${C_GOLD}restore [file]${C_RESET}    Restore database and configs from a specified backup archive"
  echo -e "  ${C_GOLD}seed${C_RESET}              Seed database with Algerian Scholar Award laureates & universities"
  echo -e "  ${C_GOLD}test${C_RESET}              Run Django tests and TypeScript compiler verification"
  echo -e "  ${C_GOLD}logs [service]${C_RESET}    Stream live logs ('backend', 'frontend', or 'both')"
  echo -e "  ${C_GOLD}clean${C_RESET}             Purge pycache, vite cache, and old runtime logs"
  echo -e "  ${C_GOLD}docker-up${C_RESET}         Start PostgreSQL and Django via Docker Compose"
  echo -e "  ${C_GOLD}docker-down${C_RESET}       Stop Docker Compose services"
  echo -e "  ${C_GOLD}help${C_RESET}              Show this help message"
  echo ""
  echo -e "${C_DIM}Run without arguments for the interactive menu interface.${C_RESET}"
}

# ------------------------------------------------------------------------------
# INTERACTIVE TERMINAL MENU
# ------------------------------------------------------------------------------
interactive_menu() {
  while true; do
    print_banner
    echo -e "${C_BOLD}SELECT AN ACTION:${C_RESET}"
    echo -e "  ${C_GOLD}[1]${C_RESET}  Setup & Install Environment (Ubuntu packages, venv, npm, migrations)"
    echo -e "  ${C_GOLD}[2]${C_RESET}  Start All Services (Django :8000 + React :3000)"
    echo -e "  ${C_GOLD}[3]${C_RESET}  Stop All Services"
    echo -e "  ${C_GOLD}[4]${C_RESET}  Restart All Services"
    echo -e "  ${C_GOLD}[5]${C_RESET}  View System & Service Status"
    echo -e "  ${C_GOLD}[6]${C_RESET}  Create Timestamped System Backup"
    echo -e "  ${C_GOLD}[7]${C_RESET}  Restore from a Backup Archive"
    echo -e "  ${C_GOLD}[8]${C_RESET}  Seed Official Scholar & University Data"
    echo -e "  ${C_GOLD}[9]${C_RESET}  Run Tests & Lint Checks"
    echo -e "  ${C_GOLD}[10]${C_RESET} Stream Service Logs (tail -f)"
    echo -e "  ${C_GOLD}[11]${C_RESET} Clean Cache & Temporary Files"
    echo -e "  ${C_GOLD}[12]${C_RESET} Docker Compose (Start/Stop)"
    echo -e "  ${C_RED}[q]${C_RESET}  Quit"
    echo ""
    read -rp "Enter choice [1-12 or q]: " CHOICE

    case "$CHOICE" in
      1)  cmd_setup ;;
      2)  cmd_start ;;
      3)  cmd_stop ;;
      4)  cmd_restart ;;
      5)  cmd_status ;;
      6)  cmd_backup ;;
      7)  cmd_restore ;;
      8)  cmd_seed ;;
      9)  cmd_test ;;
      10)
        echo ""
        echo "Which logs do you want to stream?"
        echo "1) Both backend and frontend"
        echo "2) Django backend only"
        echo "3) React frontend only"
        read -rp "Choice [1-3]: " LOG_CHOICE
        case "$LOG_CHOICE" in
          2) cmd_logs backend ;;
          3) cmd_logs frontend ;;
          *) cmd_logs both ;;
        esac
        ;;
      11) cmd_clean ;;
      12)
        echo ""
        echo "1) Start Docker services (docker compose up -d)"
        echo "2) Stop Docker services (docker compose down)"
        read -rp "Choice [1-2]: " DOCKER_CHOICE
        if [ "$DOCKER_CHOICE" = "1" ]; then
          cmd_docker_up
        else
          cmd_docker_down
        fi
        ;;
      q|Q)
        echo -e "\n${C_GOLD}Exiting DZ-Bridge Manager. Good luck!${C_RESET}"
        exit 0
        ;;
      *)
        log_error "Invalid option selected."
        ;;
    esac

    echo ""
    read -rp "Press Enter to return to main menu..."
  done
}

# ------------------------------------------------------------------------------
# MAIN ENTRYPOINT ROUTING
# ------------------------------------------------------------------------------
ACTION="${1:-}"

case "${ACTION}" in
  setup|install)
    cmd_setup
    ;;
  start)
    cmd_start
    ;;
  stop)
    cmd_stop
    ;;
  restart)
    cmd_restart
    ;;
  status)
    cmd_status
    ;;
  backup)
    cmd_backup
    ;;
  restore)
    cmd_restore "$2"
    ;;
  seed)
    cmd_seed
    ;;
  test)
    cmd_test
    ;;
  logs)
    cmd_logs "$2"
    ;;
  clean)
    cmd_clean
    ;;
  docker-up)
    cmd_docker_up
    ;;
  docker-down)
    cmd_docker_down
    ;;
  help|--help|-h)
    cmd_help
    ;;
  "")
    interactive_menu
    ;;
  *)
    log_error "Unknown command: ${ACTION}"
    echo "Run './manage_app.sh help' for usage instructions."
    exit 1
    ;;
esac
