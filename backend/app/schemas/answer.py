from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class AnswerCreate(BaseModel):
    user_id: int | None = None
    question_id: int | None = None
    q_type: str | None = None
    question_text: str | None = None
    answer_text: str
    input_type: Literal["text", "image"] = "text"


class AnswerResponse(BaseModel):
    id: int
    user_id: int | None
    question_text: str | None
    answer_text: str
    word_count: int | None
    sentence_count: int | None
    avg_sentence_length: float | None
    unique_word_ratio: float | None
    complexity_score: int | None
    sentiment: dict | None
    vs_baseline: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MonthlyReport(BaseModel):
    year: int
    month: int
    answer_count: int
    avg_word_count: float
    avg_sentence_count: float
    avg_complexity_score: float
    sentiment_summary: dict
    ai_comment: str
    answers: list[AnswerResponse]
