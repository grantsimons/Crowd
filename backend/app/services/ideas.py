from __future__ import annotations

from typing import Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models import Idea
from ..repositories.ideas import IdeaRepository, VoteRepository


class IdeaAlreadyExistsError(Exception):
    pass


class DuplicateVoteError(Exception):
    pass


class IdeaNotFoundError(Exception):
    pass


class IdeaService:
    def __init__(self, db: Session):
        self.db = db
        self.ideas = IdeaRepository(db)
        self.votes = VoteRepository(db)

    def create_idea(self, *, title: str, description: str) -> Idea:
        if self.ideas.get_by_title(title):
            raise IdeaAlreadyExistsError
        idea = self.ideas.create(title=title, description=description)
        self.db.commit()
        self.db.refresh(idea)
        return idea

    def update_idea(self, idea_id: int, *, title: Optional[str], description: Optional[str]) -> Idea:
        idea = self.ideas.get(idea_id)
        if not idea:
            raise IdeaNotFoundError
        if title and self.ideas.get_by_title(title) and idea.title != title:
            raise IdeaAlreadyExistsError
        self.ideas.update(idea, title=title, description=description)
        self.db.commit()
        self.db.refresh(idea)
        return idea

    def delete_idea(self, idea_id: int) -> None:
        idea = self.ideas.get(idea_id)
        if not idea:
            raise IdeaNotFoundError
        self.ideas.delete(idea)
        self.db.commit()

    def list_ideas(self, *, page: int, size: int, q: Optional[str], sort: str, order: str):
        return self.ideas.list_paginated(page=page, size=size, q=q, sort=sort, order=order)

    def get_idea(self, idea_id: int) -> Idea:
        idea = self.ideas.get(idea_id)
        if not idea:
            raise IdeaNotFoundError
        # attach votes_count for response convenience
        setattr(idea, "votes_count", self.ideas.votes_count(idea_id))
        return idea

    def vote(self, idea_id: int, *, voter: Optional[str]) -> None:
        if not self.ideas.get(idea_id):
            raise IdeaNotFoundError
        if voter:
            if self.votes.exists_for_voter(idea_id, voter):
                raise DuplicateVoteError
        self.votes.create(idea_id=idea_id, voter=voter)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            # fallback if DB constraint triggered
            raise DuplicateVoteError

    def votes_count(self, idea_id: int) -> int:
        if not self.ideas.get(idea_id):
            raise IdeaNotFoundError
        return self.ideas.votes_count(idea_id)

    def top_ideas(self, *, page: int, size: int):
        return self.ideas.top(page=page, size=size)

