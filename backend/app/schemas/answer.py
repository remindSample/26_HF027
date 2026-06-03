from typing import Literal, List, Optional
from pydantic import BaseModel
from datetime import datetime

class AnswerCreate(BaseModel):
    user_id: int
    question_id: int
    input_type: Literal["text", "handwriting"] = "text"
    content_text: str | None = None
    image_url: str | None = None
    ocr_text: str | None = None
    is_private: bool = False

class AnswerResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    input_type: str
    content_text: str | None
    image_url: str | None
    ocr_text: str | None
    is_private: bool
    word_count: int | None
    sentence_count: int | None
    avg_sentence_length: float | None
    unique_word_ratio: float | None
    repeated_word_count: int | None
    positive_score: int | None
    negative_score: int | None
    answered_at: datetime
    model_config = {"from_attributes": True}

class MonthlyAnswerReport(BaseModel):
    year: int
    month: int
    answer_count: int
    answers: list[AnswerResponse]
    avg_word_count: float
    avg_sentence_count: float
    avg_complexity_score: float
    sentiment_summary: dict
    ai_comment: str
