from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class EventCreate(BaseModel):
    session_id: int
    hand_side: Literal["LEFT", "RIGHT"]
    target_gesture: Literal["FIST", "PALM"]
    user_input: Literal["FIST", "PALM"] | None = None
    is_correct: bool


class EventResponse(BaseModel):
    id: int
    session_id: int
    hand_side: str
    target_gesture: str
    user_input: str | None
    is_correct: bool
    created_at: datetime

    model_config = {"from_attributes": True}
