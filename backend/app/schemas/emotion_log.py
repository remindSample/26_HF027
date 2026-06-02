from datetime import datetime
from pydantic import BaseModel, Field


class EmotionLogCreate(BaseModel):
    answer_id: int
    dominant_emotion: str | None = None
    depression_risk: float | None = None
    cognitive_decline_risk: float | None = None
    detail_json: dict | None = None
    word_count: int | None = None
    sentence_count: int | None = None
    avg_sentence_length: float | None = None
    unique_word_ratio: float | None = None
    repeated_word_count: int | None = None
    positive_score: int | None = Field(default=None, ge=1, le=10)
    negative_score: int | None = Field(default=None, ge=1, le=10)


class EmotionLogResponse(BaseModel):
    id: int
    answer_id: int
    dominant_emotion: str | None
    depression_risk: float | None
    cognitive_decline_risk: float | None
    detail_json: dict | None
    word_count: int | None
    sentence_count: int | None
    avg_sentence_length: float | None
    unique_word_ratio: float | None
    repeated_word_count: int | None
    positive_score: int | None
    negative_score: int | None
    analyzed_at: datetime

    model_config = {"from_attributes": True}
