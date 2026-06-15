from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class DatasetAnswerCreate(BaseModel):
    welfare_center_id: int
    question_id: int | None = None
    user_id: int | None = None
    is_real: bool = False
    user_group: str | None = None
    age: int | None = None
    age_group: Literal["young_adult", "middle_adult", "elderly", "old_elderly"] | None = None
    gender: Literal["M", "F"] | None = None
    image_url: str | None = None
    ocr_text: str | None = None
    raw_answer: str | None = None
    word_count: int | None = None
    sentence_count: int | None = None
    avg_sentence_length: float | None = None
    unique_word_ratio: float | None = None
    repeated_word_count: int | None = None
    positive_score: int | None = None
    negative_score: int | None = None


class DatasetAnswerResponse(BaseModel):
    id: int
    welfare_center_id: int
    question_id: int | None
    user_id: int | None
    is_real: bool
    user_group: str | None
    age: int | None
    age_group: str | None
    gender: str | None
    image_url: str | None
    ocr_text: str | None
    raw_answer: str | None
    word_count: int | None
    sentence_count: int | None
    avg_sentence_length: float | None
    unique_word_ratio: float | None
    repeated_word_count: int | None
    positive_score: int | None
    negative_score: int | None
    collected_at: datetime

    model_config = {"from_attributes": True}
