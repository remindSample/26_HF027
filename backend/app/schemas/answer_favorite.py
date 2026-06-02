from datetime import datetime
from pydantic import BaseModel


class AnswerFavoriteCreate(BaseModel):
    answer_id: int
    user_id: int


class AnswerFavoriteResponse(BaseModel):
    id: int
    answer_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
