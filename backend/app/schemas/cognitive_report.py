from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel


class CognitiveReportCreate(BaseModel):
    user_id: int
    period_type: Literal["weekly", "monthly"]
    period_start: date
    period_end: date
    vocab_score: int | None = None
    sentence_score: int | None = None
    expression_score: int | None = None
    total_answers: int = 0
    summary: str | None = None


class CognitiveReportResponse(BaseModel):
    id: int
    user_id: int
    period_type: str
    period_start: date
    period_end: date
    vocab_score: int | None
    sentence_score: int | None
    expression_score: int | None
    total_answers: int
    summary: str | None
    generated_at: datetime

    model_config = {"from_attributes": True}
