from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.answer_favorite import AnswerFavorite
from app.schemas.answer_favorite import AnswerFavoriteCreate


def _get(db: Session, answer_id: int, user_id: int) -> AnswerFavorite | None:
    return (
        db.query(AnswerFavorite)
        .filter(AnswerFavorite.answer_id == answer_id, AnswerFavorite.user_id == user_id)
        .first()
    )


def create(db: Session, data: AnswerFavoriteCreate) -> AnswerFavorite:
    existing = _get(db, data.answer_id, data.user_id)
    if existing:
        return existing

    fav = AnswerFavorite(answer_id=data.answer_id, user_id=data.user_id)
    db.add(fav)
    try:
        db.commit()
    except IntegrityError:
        # 동시에 들어온 중복 요청이 먼저 저장된 경우 그 행을 반환합니다.
        db.rollback()
        existing = _get(db, data.answer_id, data.user_id)
        if existing:
            return existing
        raise
    db.refresh(fav)
    return fav


def delete(db: Session, answer_id: int, user_id: int) -> bool:
    fav = (
        db.query(AnswerFavorite)
        .filter(AnswerFavorite.answer_id == answer_id, AnswerFavorite.user_id == user_id)
        .first()
    )
    if not fav:
        return False
    db.delete(fav)
    db.commit()
    return True


def get_by_user(db: Session, user_id: int) -> list[AnswerFavorite]:
    return db.query(AnswerFavorite).filter(AnswerFavorite.user_id == user_id).all()
