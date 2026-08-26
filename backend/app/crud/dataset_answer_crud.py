from sqlalchemy.orm import Session
from app.models.dataset_answer import DatasetAnswer
from app.schemas.dataset_answer import DatasetAnswerCreate


def create(db: Session, data: DatasetAnswerCreate) -> DatasetAnswer:
    record = DatasetAnswer(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
