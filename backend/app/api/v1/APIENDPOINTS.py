from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ...core.db import get_db
from ...schemas import IdeaCreate, IdeaUpdate, IdeaRead, PaginatedIdeas, VoteCreate, VoteCount
from ...services.ideas import (
    IdeaAlreadyExistsError,
    IdeaNotFoundError,
    DuplicateVoteError,
    IdeaService,
)
from ...models.crowdDBModels import DBTableUser
from ...models.CrowdAPIModels import createUser
from ...models.Responsemodels import UserRead
from fastapi import FastAPI
from fastapi import APIRouter, Depends, Query
# Create FastAPI instance

router = APIRouter()
alchemyengineUsers = create_engine("../../DBS/user_entries.db")

@router.post("userCreate")
def create_user(user: createUser):
    userObject = DBTableUser(
        user_id=user.user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        email=user.email,
        bio=user.bio,
        age=user.age,
        vibe=user.vibe
    )

    session = sessionmaker(bind=alchemyengineUsers)
    session.add(userObject)
    session.commit() 
    session.close()
    return {"message": "User created successfully"}

@router.get("/user/{user_id}", response_model=UserRead)
def get_user(user_id: int):
    session = sessionmaker(bind=alchemyengineUsers)()
    user = session.query(DBTableUser).filter(DBTableUser.user_id == user_id).first()
    session.close()
    if user:
        return {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "email": user.email,
            "bio": user.bio,
            "age": user.age,
            "vibe": user.vibe
        }
    else:
        return {"message": "User not found"}
