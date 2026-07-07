from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    password: str
    role: Literal["USER", "GUARDIAN"]
    birth_date: date | None = None
    profile_url: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None
    role: str
    birth_date: date | None
    profile_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
