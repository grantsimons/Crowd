from __future__ import annotations

# Configure logging from alembic.ini (if present)
from logging.config import fileConfig

import sys, os
from pathlib import Path

# Ensure the project root is on sys.path so "app" package can be imported
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# SQLAlchemy and Alembic utilities
from sqlalchemy import engine_from_config, pool
from alembic import context

# Import app settings and the declarative Base used by the app
from app.core.settings import get_settings
from app.core.db import Base

# Ensure models are imported so tables are registered on Base.metadata.
# Alembic's autogenerate inspects Base.metadata to know what migrations to create.
from app import models as _models  # noqa: F401

# Alembic Config object, loaded from alembic.ini
config = context.config

# If alembic.ini points to a logging config, apply it
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Expose the SQLAlchemy MetaData object Alembic will use to compare DB vs models
target_metadata = Base.metadata


def get_url() -> str:
    settings = get_settings()
    return settings.DATABASE_URL


def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        {"sqlalchemy.url": get_url()},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

