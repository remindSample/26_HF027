from datetime import datetime
from pydantic import BaseModel


class SessionCreate(BaseModel):
    user_id: int | None = None
    game_type: str | None = None
    level: int | None = None


class SessionResponse(BaseModel):
    id: int
    user_id: int | None
    game_type: str | None
    level: int | None
    status: str
    started_at: datetime

    model_config = {"from_attributes": True}


class SessionFinish(BaseModel):
    success_count: int
    total_count: int


class SessionResult(BaseModel):
    id: int
    game_type: str | None
    level: int | None
    total_score: int | None
    success_count: int | None
    total_count: int | None
    accuracy: float | None
    started_at: datetime
    ended_at: datetime | None

    model_config = {"from_attributes": True}
