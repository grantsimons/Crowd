from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class createUser(BaseModel):
    user_id: str
    first_name: str = "First"
    last_name: str = "Last"
    phone_number: str = "0000000000"
    email: str = "stock@crowd.com"
    bio: str = "A crowd User"
    age: int = -1
    vibe: str = "Stock"

    model_config = {
        "from_attributes": True,
    }