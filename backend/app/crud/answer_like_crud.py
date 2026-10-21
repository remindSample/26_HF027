from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.answer_like import AnswerLike
from app.schemas.answer_like import AnswerLikeCreate


def _get(db: Session, answer_id: int, guardian_id: int) -> AnswerLike | None:
    return (
        db.query(AnswerLike)
        .filter(AnswerLike.answer_id == answer_id, AnswerLike.guardian_id == guardian_id)
        .first()
    )


def create(db: Session, data: AnswerLikeCreate) -> AnswerLike:
    existing = _get(db, data.answer_id, data.guardian_id)
    if existing:
        return existing

    like = AnswerLike(answer_id=data.answer_id, guardian_id=data.guardian_id)
    db.add(like)
    try:
        db.commit()
    except IntegrityError:
        # 동시에 들어온 중복 요청이 먼저 저장된 경우 그 행을 반환합니다.
        db.rollback()
        existing = _get(db, data.answer_id, data.guardian_id)
        if existing:
            return existing
        raise
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


def get_by_guardian(db: Session, guardian_id: int) -> list[AnswerLike]:
    return db.query(AnswerLike).filter(AnswerLike.guardian_id == guardian_id).all()
