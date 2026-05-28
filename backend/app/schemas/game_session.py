from datetime import datetime
from pydantic import BaseModel


class SessionCreate(BaseModel):
    user_id: int | None = None
    level: int


class SessionResponse(BaseModel):
    id: int
    user_id: int | None
    level: int
    status: str
    started_at: datetime

    model_config = {"from_attributes": True}


class SessionResult(BaseModel):
    id: int
    level: int
    total_score: int
    success_count: int
    total_count: int
    accuracy: float
    started_at: datetime
    ended_at: datetime | None

    model_config = {"from_attributes": True}


class SessionFinish(BaseModel):
    success_count: int
    total_count: int
