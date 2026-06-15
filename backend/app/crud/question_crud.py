from sqlalchemy.orm import Session
from app.models.question import Question
from app.schemas.question import QuestionCreate


def create(db: Session, data: QuestionCreate) -> Question:
    question = Question(**data.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def get(db: Session, question_id: int) -> Question | None:
    return db.get(Question, question_id)


def get_by_target_user(db: Session, user_id: int, q_type: str | None = None) -> list[Question]:
    q = db.query(Question).filter(Question.target_user_id == user_id)
    if q_type:
        q = q.filter(Question.q_type == q_type)
    return q.order_by(Question.created_at.desc()).all()
