from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.game_session import SessionCreate, SessionResponse, SessionFinish, SessionResult
from app.crud import game_session_crud

router = APIRouter(prefix="/game/sessions", tags=["game-sessions"])


@router.post("", response_model=SessionResponse, status_code=201)
def start_session(data: SessionCreate, db: Session = Depends(get_db)):
    return game_session_crud.create_session(db, data)


@router.post("/{session_id}/finish", response_model=SessionResult)
def finish_session(
    session_id: int, data: SessionFinish, db: Session = Depends(get_db)
):
    session = game_session_crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "finished":
        raise HTTPException(status_code=400, detail="Session already finished")

    return game_session_crud.finish_session(
        db, session, data.success_count, data.total_count
    )


@router.get("/{session_id}/result", response_model=SessionResult)
def get_result(session_id: int, db: Session = Depends(get_db)):
    session = game_session_crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "finished":
        raise HTTPException(status_code=400, detail="Session not finished yet")
    return session
