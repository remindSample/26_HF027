from datetime import datetime
from sqlalchemy import extract
from sqlalchemy.orm import Session
from app.models.game_session import GameSession
from app.schemas.game_session import SessionCreate


def create_session(db: Session, data: SessionCreate) -> GameSession:
    session = GameSession(user_id=data.user_id, level=data.level)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session(db: Session, session_id: int) -> GameSession | None:
    return db.get(GameSession, session_id)


def get_finished_sessions_by_month(
    db: Session, user_id: int | None, year: int, month: int
) -> list[GameSession]:
    query = db.query(GameSession).filter(
        GameSession.status == "finished",
        GameSession.ended_at.isnot(None),
        extract("year", GameSession.ended_at) == year,
        extract("month", GameSession.ended_at) == month,
    )
    if user_id is not None:
        query = query.filter(GameSession.user_id == user_id)
    return query.order_by(GameSession.ended_at.desc()).all()


def finish_session(
    db: Session,
    session: GameSession,
    success_count: int,
    total_count: int,
) -> GameSession:
    accuracy = round(success_count / total_count * 100, 1) if total_count > 0 else 0.0
    score_per_success = 10 * session.level
    total_score = success_count * score_per_success

    session.status = "finished"
    session.ended_at = datetime.utcnow()
    session.success_count = success_count
    session.total_count = total_count
    session.accuracy = accuracy
    session.total_score = total_score

    db.commit()
    db.refresh(session)
    return session
