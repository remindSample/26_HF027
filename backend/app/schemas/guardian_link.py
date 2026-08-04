from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class GuardianLinkCreate(BaseModel):
    guardian_id: int
    elder_id: int


class GuardianLinkUpdate(BaseModel):
    status: Literal["accepted", "rejected"]


class GuardianLinkResponse(BaseModel):
    id: int
    guardian_id: int
    elder_id: int
    status: str
    linked_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
