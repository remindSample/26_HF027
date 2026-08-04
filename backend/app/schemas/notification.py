from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    receiver_id: int
    sender_id: int | None
    type: str
    ref_id: int | None
    message: str | None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
