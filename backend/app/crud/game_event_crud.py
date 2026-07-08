from sqlalchemy.orm import Session
from app.models.game_event import GameEvent
from app.schemas.game_event import EventCreate


def create_event(db: Session, data: EventCreate) -> GameEvent:
    event = GameEvent(
        session_id=data.session_id,
        hand_side=data.hand_side,
        target_gesture=data.target_gesture,
        user_input=data.user_input,
        is_correct=data.is_correct,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_events_by_session(db: Session, session_id: int) -> list[GameEvent]:
    return (
        db.query(GameEvent)
        .filter(GameEvent.session_id == session_id)
        .order_by(GameEvent.created_at)
        .all()
    )
