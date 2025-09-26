## Crowd Ideas – Full-Stack App (FastAPI + React)

This repository contains a production-ready, containerized full‑stack application for collecting and voting on ideas. It includes a FastAPI backend (Python 3.11+, SQLAlchemy 2.x, Alembic) and a Vite + React + TypeScript frontend with Tailwind CSS v4, comprehensive unit tests on both sides, and Dockerized deployment via docker-compose (nginx frontend proxy to the backend).

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.11+** (with `python3` command available)
- **Node.js 20+** (with `pnpm` package manager)
- **Git** (to clone the repository)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Crowd
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
export DATABASE_URL="sqlite:///./app.db"
export PYTHONPATH=/path/to/Crowd/backend
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend (Terminal 2)
```bash
cd frontend
pnpm install
pnpm dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1/
- **API Documentation**: http://localhost:8000/docs

### 🐳 Alternative: Docker Setup
If you prefer Docker, see the [Dockerized Deployment](#dockerized-deployment) section below.

---

### Project Spec

- **Domain summary**: Users submit ideas; others upvote them. List/search/sort ideas; view details; create/update/delete ideas; vote; view vote counts and top ideas.
- **Core entities**:
  - **Idea**: `id` (int, PK), `title` (str, 3..120, unique), `description` (str, 0..2000), `created_at` (datetime), `updated_at` (datetime), `votes_count` (int, computed in queries).
  - **Vote**: `id` (int, PK), `idea_id` (FK to Idea, cascade delete), `voter` (str, optional identifier to dedupe), `created_at` (datetime). Unique constraint on (`idea_id`, `voter`) when `voter` is provided.
- **API endpoints (v1)**:
  - `GET /api/v1/health`: health check
  - `GET /api/v1/ideas`: list with pagination, search by `q` (title/description), sort by `created_at` or `votes` (asc/desc)
  - `POST /api/v1/ideas`: create
  - `GET /api/v1/ideas/{id}`: retrieve
  - `PUT /api/v1/ideas/{id}`: update
  - `DELETE /api/v1/ideas/{id}`: delete
  - `POST /api/v1/ideas/{id}/vote`: add a vote (optional `voter` string)
  - `GET /api/v1/ideas/{id}/votes_count`: get vote count
  - `GET /api/v1/ideas/top`: list top ideas by votes (paginated)
- **Frontend pages/flows**:
  - List with search/sort/pagination, empty/loading/error states
  - Create/update form with validation (title length 3..120; description <=2000)
  - Detail page with vote button and live count
  - Delete flow with confirmation
- **Non-functional notes**:
  - No auth (demo app). CORS allows `http://localhost:5173` in dev. 
  - Pagination defaults: `page=1`, `size=10` (max 100). Sorting by `created_at` or `votes`.
  - Rate limits: none (can be added at proxy level). Input validation via Pydantic v2. Errors normalized.

### Tech Requirements

- Backend: FastAPI, Pydantic v2, SQLAlchemy 2.x ORM, Alembic, SQLite by default with `DATABASE_URL` override for Postgres, pytest + pytest-cov.
- Frontend: Vite, React, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), React Testing Library, Vitest, jsdom, MSW, coverage via `@vitest/coverage-v8`.
- Quality: Modular architecture, typing, and ≥80% line coverage enforced.
- Containerization: Multi-stage Dockerfiles and docker-compose to run the stack behind nginx; SQLite volume by default; Postgres-ready via env switch.

### Repository Layout

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

### Quickstart (Local Dev)

> **📝 For the easiest setup, see the [Quick Start section above](#-quick-start-local-development)**

**Backend (Python 3.11+):**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
export DATABASE_URL="sqlite:///./app.db"
export PYTHONPATH=/path/to/Crowd/backend
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend (Node 20+):**
```bash
cd frontend
pnpm install
pnpm dev
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:5173`. Ensure CORS origin matches.

### Tests & Coverage

- Backend:

```bash
cd backend
pytest -q --cov=app --cov-report=term-missing:skip-covered --cov-report=html --cov-fail-under=80
```

- Frontend:

```bash
cd frontend
pnpm test
pnpm test:cov
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "change"
alembic upgrade head
```

Switch to Postgres by setting `DATABASE_URL="postgresql+psycopg://user:pass@host:5432/db"` and adding `psycopg[binary]` to `requirements.txt`.

### Dockerized Deployment

```bash
docker compose up --build
```

- Frontend served by nginx on host `http://localhost:8080`
- Backend available via nginx at `/api/` (proxied to `backend:8000`)

Create migrations in container:

```bash
docker compose run --rm backend alembic revision --autogenerate -m "change"
docker compose run --rm backend alembic upgrade head
```

### Environment Variables

- Backend:
  - `DATABASE_URL` (default `sqlite:///./app.db`)
- Frontend:
  - `VITE_API_URL` (default `http://localhost:8000` for dev; `/api` in Docker)

### License

MIT

