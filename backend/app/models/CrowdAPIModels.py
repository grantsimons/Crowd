from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class createUser(BaseModel):
    user_id: str = Field(min_length=3, max_length=120)
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(min_length=1, max_length=120)
    phone_number: str = Field(default=None, max_length=20)
    email: str = Field(default=None, max_length=120)
    bio: str = Field(default=None, max_length=2000)
    age: int = Field(default=0, ge=0)
    vibe: str = Field(default=None, max_length=120)

    model_config = {
        "from_attributes": True,
    }