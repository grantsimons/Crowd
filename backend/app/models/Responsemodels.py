from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Index, String, Text, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import BaseModel

from ..core.db import Base


class Idea(Base):
    __tablename__ = "ideas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), unique=True)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    votes: Mapped[list[Vote]] = relationship("Vote", back_populates="idea", cascade="all, delete-orphan")


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("ideas.id", ondelete="CASCADE"), index=True, nullable=False)
    voter: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    idea: Mapped[Idea] = relationship("Idea", back_populates="votes")

    __table_args__ = (
        # Logical uniqueness: when voter is provided, enforce one vote per voter per idea.
        # Implement as a composite unique constraint; service will prevent duplicates when voter is not null.
        UniqueConstraint("idea_id", "voter", name="uq_vote_idea_voter"),
    )

class UserRead(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    phone_number: str
    email: str
    bio: str
    age: int
    vibe: str
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)  # store hashed passwords, not plaintext

    __table_args__ = (
        UniqueConstraint("username", name="uq_user_username"),
    )


# Helpful index for ordering by creation time
Index("ix_ideas_created", Idea.created_at.desc())

