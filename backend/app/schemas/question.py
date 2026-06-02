from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class QuestionCreate(BaseModel):
    created_by: int | None = None
    target_user_id: int | None = None
    welfare_center_id: int | None = None
    keyword_id: int | None = None
    content: str
    source: Literal["AI_GENERATED", "GUARDIAN_CUSTOM", "WELFARE_PRESET"] = "AI_GENERATED"


class QuestionResponse(BaseModel):
    id: int
    created_by: int | None
    target_user_id: int | None
    welfare_center_id: int | None
    keyword_id: int | None
    content: str
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}
