from __future__ import annotations

from typing import Iterable, Optional

from sqlalchemy import Select, asc, desc, func, select
from sqlalchemy.orm import Session

from ..models import Idea, Vote


class IdeaRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, title: str, description: str) -> Idea:
        idea = Idea(title=title, description=description)
        self.db.add(idea)
        self.db.flush()
        return idea

    def get(self, idea_id: int) -> Optional[Idea]:
        return self.db.get(Idea, idea_id)

    def get_by_title(self, title: str) -> Optional[Idea]:
        stmt = select(Idea).where(Idea.title == title)
        return self.db.scalar(stmt)

    def update(self, idea: Idea, *, title: Optional[str] = None, description: Optional[str] = None) -> Idea:
        if title is not None:
            idea.title = title
        if description is not None:
            idea.description = description
        self.db.flush()
        return idea

    def delete(self, idea: Idea) -> None:
        self.db.delete(idea)

    def votes_count(self, idea_id: int) -> int:
        stmt = select(func.count(Vote.id)).where(Vote.idea_id == idea_id)
        return int(self.db.scalar(stmt) or 0)

    def list_paginated(
        self,
        *,
        page: int,
        size: int,
        q: Optional[str] = None,
        sort: str = "created_at",
        order: str = "desc",
    ) -> tuple[list[Idea], int]:
        page = max(page, 1)
        size = max(min(size, 100), 1)

        votes_ct = select(func.count(Vote.id)).where(Vote.idea_id == Idea.id).correlate(Idea).scalar_subquery()

        stmt: Select = select(Idea, votes_ct.label("votes_count"))

        if q:
            like = f"%{q}%"
            stmt = stmt.where((Idea.title.ilike(like)) | (Idea.description.ilike(like)))

        total_stmt = select(func.count()).select_from(stmt.subquery())
        total = int(self.db.scalar(total_stmt) or 0)

        if sort == "votes":
            order_clause = desc("votes_count") if order == "desc" else asc("votes_count")
        else:
            col = Idea.created_at
            order_clause = desc(col) if order == "desc" else asc(col)

        stmt = stmt.order_by(order_clause).offset((page - 1) * size).limit(size)

        rows = self.db.execute(stmt).all()
        items = [row[0] for row in rows]
        # attach a transient attribute for votes_count to map into schema
        for row, item in zip(rows, items):
            setattr(item, "votes_count", int(row[1]))
        return items, total

    def top(self, *, page: int, size: int) -> list[Idea]:
        page = max(page, 1)
        size = max(min(size, 100), 1)
        votes_ct = select(func.count(Vote.id)).where(Vote.idea_id == Idea.id).correlate(Idea).scalar_subquery()
        stmt = (
            select(Idea, votes_ct.label("votes_count"))
            .order_by(desc("votes_count"))
            .offset((page - 1) * size)
            .limit(size)
        )
        rows = self.db.execute(stmt).all()
        items = [row[0] for row in rows]
        for row, item in zip(rows, items):
            setattr(item, "votes_count", int(row[1]))
        return items


class VoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, idea_id: int, voter: Optional[str]) -> Vote:
        vote = Vote(idea_id=idea_id, voter=voter)
        self.db.add(vote)
        self.db.flush()
        return vote

    def exists_for_voter(self, idea_id: int, voter: str) -> bool:
        stmt = select(Vote.id).where(Vote.idea_id == idea_id, Vote.voter == voter)
        return self.db.scalar(stmt) is not None

