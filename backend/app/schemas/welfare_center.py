from datetime import datetime
from pydantic import BaseModel


class WelfareCenterCreate(BaseModel):
    name: str
    region: str
    email: str | None = None
    address: str | None = None
    note: str | None = None


class WelfareCenterResponse(BaseModel):
    id: int
    name: str
    region: str
    email: str | None
    address: str | None
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
