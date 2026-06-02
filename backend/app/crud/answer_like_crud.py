from sqlalchemy.orm import Session
from app.models.answer_like import AnswerLike
from app.schemas.answer_like import AnswerLikeCreate


def create(db: Session, data: AnswerLikeCreate) -> AnswerLike:
    like = AnswerLike(answer_id=data.answer_id, guardian_id=data.guardian_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


def delete(db: Session, answer_id: int, guardian_id: int) -> bool:
    like = (
        db.query(AnswerLike)
        .filter(AnswerLike.answer_id == answer_id, AnswerLike.guardian_id == guardian_id)
        .first()
    )
    if not like:
        return False
    db.delete(like)
    db.commit()
    return True
