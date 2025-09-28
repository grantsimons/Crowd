from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Index, String, Text, ForeignKey, UniqueConstraint, func, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import Base


class DBTableUser(Base):
    __tablename__ = "users"

    entry_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(120), nullable=False)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=False)
    vibe: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)