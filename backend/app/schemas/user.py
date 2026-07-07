from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, model_validator


class UserCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    password: str
    role: Literal["USER", "GUARDIAN"]
    birth_date: date | None = None
    profile_url: str | None = None

    @model_validator(mode="after")
    def require_phone_or_email(self):
        if not self.phone and not self.email:
            raise ValueError("전화번호 또는 이메일 중 하나는 필수입니다.")
        return self


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str | None
    email: str | None
    role: str
    birth_date: date | None
    profile_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
