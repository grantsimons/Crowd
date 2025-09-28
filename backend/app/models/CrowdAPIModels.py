from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class createUser(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    phone_number: str
    email: str
    bio: str 
    age: int
    vibe: str

    model_config = {
        "from_attributes": True,
    }