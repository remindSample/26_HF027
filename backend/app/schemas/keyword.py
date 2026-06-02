from pydantic import BaseModel


class KeywordCreate(BaseModel):
    name: str
    category: str | None = None


class KeywordResponse(BaseModel):
    id: int
    name: str
    category: str | None

    model_config = {"from_attributes": True}
