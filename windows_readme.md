# Crowd Ideas – Windows README (FastAPI + React)

This repository contains a production-ready, containerized full-stack application for collecting and voting on ideas. It includes a **FastAPI** backend (Python 3.11+, SQLAlchemy 2.x, Alembic) and a **Vite + React + TypeScript** frontend with **Tailwind CSS v4**, comprehensive unit tests on both sides, and Dockerized deployment via **docker-compose** (nginx front-proxy to the backend).

> This guide uses **Windows PowerShell** (recommended). Where helpful, **cmd.exe** equivalents are shown.

---

## 🚀 Quick Start (Local Development on Windows)

### Prerequisites

* **Python 3.11+**

  * PowerShell `py -3.11 --version` (or `python --version` if you aliased Python)
* **Node.js 20+**

  * Enable Corepack once: `corepack enable` (lets you use `pnpm`)
  * Or install pnpm: `npm i -g pnpm`
* **Git**
* *(Optional)* **Docker Desktop for Windows** (for the Dockerized option)

### 1) Clone and enter the project

```powershell
git clone <repository-url>
cd Crowd
```

### 2) Start Backend (PowerShell, in a new tab)

```powershell
cd backend

# Create and activate venv (PowerShell)
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Upgrade pip & install deps
python -m pip install --upgrade pip
pip install -r requirements.txt

# Env vars (current session)
$env:DATABASE_URL = "sqlite:///./app.db"
$env:PYTHONPATH   = (Resolve-Path .)  # or set your absolute path to Crowd\backend

# Run DB migrations
alembic upgrade head

# Start API (dev)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**cmd.exe equivalents**:

```cmd
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
set DATABASE_URL=sqlite:///./app.db
set PYTHONPATH=%cd%
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> To persist env vars across sessions on Windows, you can use `setx NAME VALUE` (re-open shells after).

### 3) Start Frontend (PowerShell, another tab)

```powershell
cd frontend
pnpm install
pnpm dev
```

### 4) Open the app

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
* **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐳 Alternative: Docker Setup (Windows)

Ensure **Docker Desktop** is running.

```powershell
docker compose up --build
```

* Frontend via nginx: **[http://localhost:8080](http://localhost:8080)**
* Backend proxied at **/api/** (nginx → `backend:8000`)

Create/Run migrations inside the backend container:

```powershell
docker compose run --rm backend alembic revision --autogenerate -m "change"
docker compose run --rm backend alembic upgrade head
```

---

## Project Spec

* **Domain summary**: Users submit ideas; others upvote them. List/search/sort ideas; view details; create/update/delete ideas; vote; view vote counts and top ideas.
* **Core entities**:

  * **Idea**: `id` (int, PK), `title` (str, 3..120, unique), `description` (str, 0..2000), `created_at` (datetime), `updated_at` (datetime), `votes_count` (int, computed in queries).
  * **Vote**: `id` (int, PK), `idea_id` (FK to Idea, cascade delete), `voter` (str, optional identifier to dedupe), `created_at` (datetime). Unique constraint on (`idea_id`, `voter`) when `voter` is provided.
* **API endpoints (v1)**:

  * `GET /api/v1/health`
  * `GET /api/v1/ideas` (pagination, `q` search, sort by `created_at` or `votes`, asc/desc)
  * `POST /api/v1/ideas`
  * `GET /api/v1/ideas/{id}`
  * `PUT /api/v1/ideas/{id}`
  * `DELETE /api/v1/ideas/{id}`
  * `POST /api/v1/ideas/{id}/vote` (optional `voter`)
  * `GET /api/v1/ideas/{id}/votes_count`
  * `GET /api/v1/ideas/top` (paginated)
* **Frontend pages/flows**:

  * List with search/sort/pagination, empty/loading/error states
  * Create/update form with validation (title 3..120; description ≤2000)
  * Detail page with vote button and live count
  * Delete with confirmation
* **Non-functional**:

  * No auth (demo). Dev CORS allows `http://localhost:5173`.
  * Pagination defaults `page=1`, `size=10` (max 100). Sort: `created_at` or `votes`.
  * Rate limits: none (add at proxy if desired). Validation via Pydantic v2. Normalized errors.

---

## Tech Requirements

* **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.x ORM, Alembic, SQLite by default with `DATABASE_URL` override (Postgres-ready), pytest + pytest-cov.
* **Frontend**: Vite, React, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), React Testing Library, Vitest, jsdom, MSW, coverage via `@vitest/coverage-v8`.
* **Quality**: Modular architecture, typing, **≥80%** line coverage enforced.
* **Containerization**: Multi-stage Dockerfiles & docker-compose (nginx fronting backend); SQLite volume by default; Postgres via env switch.

---

## Repository Layout

```
backend/
  app/{core,models,schemas,repositories,services,api}/
  alembic/{versions}/ + alembic.ini
  tests/
frontend/
  src/{api,components,pages,styles,test}/
  vite.config.ts
  test_setup.ts
infra/
  docker/
    backend.Dockerfile
    frontend.Dockerfile
    nginx.conf
docker-compose.yml
README.md
```

---

## Quickstart Commands (Windows)

> **Prefer the steps in the Quick Start above.** These are the condensed commands.

**Backend (PowerShell):**

```powershell
cd backend
py -3.11 -m venv .venv; .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
$env:DATABASE_URL = "sqlite:///./app.db"
$env:PYTHONPATH   = (Resolve-Path .)
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend (PowerShell):**

```powershell
cd frontend
pnpm install
pnpm dev
```

Backend: `http://localhost:8000` • Frontend: `http://localhost:5173`
Ensure your dev CORS origin includes the frontend URL.

---

## Tests & Coverage (Windows)

**Backend**

```powershell
cd backend
pytest -q --cov=app --cov-report=term-missing:skip-covered --cov-report=html --cov-fail-under=80
```

**Frontend**

```powershell
cd frontend
pnpm test
pnpm test:cov
```

---

## Database Migrations

```powershell
cd backend
alembic revision --autogenerate -m "change"
alembic upgrade head
```

**Switch to Postgres** by setting:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://user:pass@host:5432/db"
pip install "psycopg[binary]"
```

---

## Dockerized Deployment (Windows)

```powershell
docker compose up --build
```

* **Frontend** via nginx: `http://localhost:8080`
* **Backend** via nginx: `/api/` → `backend:8000`

Create migrations in container:

```powershell
docker compose run --rm backend alembic revision --autogenerate -m "change"
docker compose run --rm backend alembic upgrade head
```

---

## Environment Variables

* **Backend**

  * `DATABASE_URL` (default `sqlite:///./app.db`)
  * `PYTHONPATH` (set to your `Crowd\backend` path for local imports)
* **Frontend**

  * `VITE_API_URL` (default `http://localhost:8000` in dev; `/api` in Docker)
  * On Windows, for per-project settings, create `frontend\.env.local`:

    ```
    VITE_API_URL=http://localhost:8000
    ```

---

## License

MIT
