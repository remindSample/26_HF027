from datetime import datetime
from typing import Literal
from pydantic import BaseModel


Q_TYPE = Literal[
    "memory_recall", "emotional_expression", "daily_life",
    "autobiographical", "social_relationship", "preference", "sensory_memory"
]


class QuestionCreate(BaseModel):
    created_by: int | None = None
    target_user_id: int | None = None
    keyword_id: int | None = None
    content: str
    q_type: Q_TYPE | None = None
    source: Literal["AI_GENERATED", "GUARDIAN_CUSTOM", "WELFARE_PRESET"] = "AI_GENERATED"
    model_source: str | None = None


class QuestionGenerateRequest(BaseModel):
    tag: Literal["family", "food", "travel", "season", "hobby", "childhood", "friend"]
    target_user_id: int | None = None
    created_by: int | None = None


class QuestionResponse(BaseModel):
    id: int
    created_by: int | None
    target_user_id: int | None
    keyword_id: int | None
    content: str
    q_type: str | None
    source: str
    model_source: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
