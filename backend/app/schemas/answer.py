from datetime import datetime
from typing import Literal
from pydantic import BaseModel


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
    answered_at: datetime

    model_config = {"from_attributes": True}


class MonthlyAnswerReport(BaseModel):
    year: int
    month: int
    answer_count: int
    answers: list[AnswerResponse]
