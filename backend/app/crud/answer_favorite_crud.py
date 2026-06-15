from sqlalchemy.orm import Session
from app.models.answer_favorite import AnswerFavorite
from app.schemas.answer_favorite import AnswerFavoriteCreate


def create(db: Session, data: AnswerFavoriteCreate) -> AnswerFavorite:
    fav = AnswerFavorite(answer_id=data.answer_id, user_id=data.user_id)
    db.add(fav)
    db.commit()
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
