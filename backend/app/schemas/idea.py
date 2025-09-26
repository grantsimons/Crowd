from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IdeaBase(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=2000)

    model_config = {
        "from_attributes": True,
    }


class IdeaCreate(IdeaBase):
    pass


class IdeaUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=120)
    description: Optional[str] = Field(default=None, max_length=2000)


class IdeaRead(IdeaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    votes_count: int = 0


class VoteCreate(BaseModel):
    voter: Optional[str] = Field(default=None, max_length=120)


class VoteCount(BaseModel):
    idea_id: int
    votes_count: int


class PaginatedIdeas(BaseModel):
    items: list[IdeaRead]
    total: int
    page: int
    size: int

