from sqlalchemy.orm import Session
from app.models.dataset_answer import DatasetAnswer
from app.schemas.dataset_answer import DatasetAnswerCreate


def create(db: Session, data: DatasetAnswerCreate) -> DatasetAnswer:
    record = DatasetAnswer(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_by_welfare_center(db: Session, welfare_center_id: int) -> list[DatasetAnswer]:
    return (
        db.query(DatasetAnswer)
        .filter(DatasetAnswer.welfare_center_id == welfare_center_id)
        .order_by(DatasetAnswer.collected_at.desc())
        .all()
    )
