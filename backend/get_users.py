from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.models import User
from app.core.db import SessionLocal, get_db
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(self, username: str) -> User:
        stmt = select(User).where(User.username == username)
        return self.db.scalar(stmt)

    def create(self, username: str, password: str) -> User:
        new_user = User(username=username, password=password)
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    username: str
    password: str

@router.post("", name="create_user")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    # Check if user already exists
    existing_user = repo.get_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new user
    new_user = repo.create(user_data.username, user_data.password)
    return new_user

@router.get("/{username}", name="get_user")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Add this to actually use it and pull from app.db
if __name__ == "__main__":
    import os
    os.environ["DATABASE_URL"] = "sqlite:///./app.db"
    
    with SessionLocal() as db:
        repo = UserRepository(db)

