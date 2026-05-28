from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.game_event import EventCreate, EventResponse
from app.crud import game_session_crud, game_event_crud

router = APIRouter(prefix="/game/events", tags=["game-events"])


@router.post("", response_model=EventResponse, status_code=201)
def save_event(data: EventCreate, db: Session = Depends(get_db)):
    session = game_session_crud.get_session(db, data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "finished":
        raise HTTPException(status_code=400, detail="Session already finished")

    return game_event_crud.create_event(db, data)


@router.get("/{session_id}", response_model=list[EventResponse])
def get_events(session_id: int, db: Session = Depends(get_db)):
    return game_event_crud.get_events_by_session(db, session_id)
