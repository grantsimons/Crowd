# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip wheel --wheel-dir /wheels -r /tmp/requirements.txt

FROM base AS runtime
ENV DATABASE_URL=sqlite:///./app.db
RUN useradd -m appuser
USER appuser
COPY --from=builder /wheels /wheels
RUN pip install --no-index --find-links=/wheels -r /wheels/..data/requirements.txt || pip install --no-index --find-links=/wheels fastapi uvicorn[standard] pydantic pydantic-settings SQLAlchemy alembic psycopg[binary] python-dotenv pytest pytest-cov httpx
COPY backend /app
WORKDIR /app

EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request, os, json; r = urllib.request.urlopen(os.environ.get('HEALTH_URL', 'http://localhost:8000/api/v1/health'), timeout=2); data = json.loads(r.read().decode()); assert data.get('status') == 'ok'"

ENTRYPOINT ["/bin/sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

