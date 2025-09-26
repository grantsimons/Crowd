from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.db import get_db
from ...schemas import IdeaCreate, IdeaUpdate, IdeaRead, PaginatedIdeas, VoteCreate, VoteCount
from ...services.ideas import (
    IdeaAlreadyExistsError,
    IdeaNotFoundError,
    DuplicateVoteError,
    IdeaService,
)


router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.get("", response_model=PaginatedIdeas)
def list_ideas(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    q: str | None = None,
    sort: str = Query("created_at", pattern="^(created_at|votes)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    service = IdeaService(db)
    items, total = service.list_ideas(page=page, size=size, q=q, sort=sort, order=order)
    # Map to schema, include attached votes_count
    data = [IdeaRead.model_validate(i) for i in items]
    return {"items": data, "total": total, "page": page, "size": size}


@router.post("", response_model=IdeaRead, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)):
    service = IdeaService(db)
    try:
        idea = service.create_idea(title=payload.title, description=payload.description)
    except IdeaAlreadyExistsError:
        raise HTTPException(status_code=409, detail="Idea with this title already exists")
    return IdeaRead.model_validate(idea)


@router.get("/{idea_id}", response_model=IdeaRead)
def get_idea(idea_id: int, db: Session = Depends(get_db)):
    service = IdeaService(db)
    try:
        idea = service.get_idea(idea_id)
    except IdeaNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    return IdeaRead.model_validate(idea)


@router.put("/{idea_id}", response_model=IdeaRead)
def update_idea(idea_id: int, payload: IdeaUpdate, db: Session = Depends(get_db)):
    service = IdeaService(db)
    try:
        idea = service.update_idea(idea_id, title=payload.title, description=payload.description)
    except IdeaNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    except IdeaAlreadyExistsError:
        raise HTTPException(status_code=409, detail="Idea with this title already exists")
    return IdeaRead.model_validate(idea)


@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(idea_id: int, db: Session = Depends(get_db)):
    service = IdeaService(db)
    try:
        service.delete_idea(idea_id)
    except IdeaNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    return None


@router.post("/{idea_id}/vote", status_code=status.HTTP_204_NO_CONTENT)
def vote(idea_id: int, payload: VoteCreate, db: Session = Depends(get_db)):
    service = IdeaService(db)
    try:
        service.vote(idea_id, voter=payload.voter)
    except IdeaNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    except DuplicateVoteError:
        raise HTTPException(status_code=409, detail="Duplicate vote")
    return None


@router.get("/{idea_id}/votes_count", response_model=VoteCount)
def votes_count(idea_id: int, db: Session = Depends(get_db)):
    service = IdeaService(db)
    try:
        count = service.votes_count(idea_id)
    except IdeaNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    return {"idea_id": idea_id, "votes_count": count}


@router.get("/top", response_model=list[IdeaRead])
def top(page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    service = IdeaService(db)
    items = service.top_ideas(page=page, size=size)
    return [IdeaRead.model_validate(i) for i in items]

