from sqlalchemy.orm import Session
from app.models.keyword import Keyword
from app.schemas.keyword import KeywordCreate


def create(db: Session, data: KeywordCreate) -> Keyword:
    keyword = Keyword(**data.model_dump())
    db.add(keyword)
    db.commit()
    db.refresh(keyword)
    return keyword


def get_all(db: Session) -> list[Keyword]:
    return db.query(Keyword).order_by(Keyword.category, Keyword.name).all()
