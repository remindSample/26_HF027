from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.answer import Answer
from app.schemas.answer import AnswerCreate


def create_answer(db: Session, data: AnswerCreate) -> Answer:
    answer = Answer(
        user_id=data.user_id,
        question_id=data.question_id,
        input_type=data.input_type,
        content_text=data.content_text,
        image_url=data.image_url,
        ocr_text=data.ocr_text,
        is_private=data.is_private,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_answers_by_month(
    db: Session, user_id: int | None, year: int, month: int
) -> list[Answer]:
    q = db.query(Answer).filter(
        extract("year", Answer.answered_at) == year,
        extract("month", Answer.answered_at) == month,
    )
    if user_id is not None:
        q = q.filter(Answer.user_id == user_id)
    return q.order_by(Answer.answered_at).all()
