from datetime import datetime
from pydantic import BaseModel


class AnswerLikeCreate(BaseModel):
    answer_id: int
    guardian_id: int


class AnswerLikeResponse(BaseModel):
    id: int
    answer_id: int
    guardian_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
