from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.game_session import (
    MonthlyGameReport,
    SessionCreate,
    SessionResponse,
    SessionFinish,
    SessionResult,
)
from app.crud import game_session_crud

router = APIRouter(prefix="/game/sessions", tags=["game-sessions"])


def _pct_diff(curr: float, prev: float) -> float | None:
    if prev == 0:
        return None
    return round((curr - prev) / prev * 100, 1)


def _summarize_sessions(sessions: list) -> tuple[int, int, float | None, int]:
    success_count = sum(session.success_count or 0 for session in sessions)
    total_count = sum(session.total_count or 0 for session in sessions)
    accuracy = round(success_count / total_count * 100, 1) if total_count > 0 else None
    total_score = sum(session.total_score or 0 for session in sessions)
    return success_count, total_count, accuracy, total_score


@router.post("", response_model=SessionResponse, status_code=201)
def start_session(data: SessionCreate, db: Session = Depends(get_db)):
    return game_session_crud.create_session(db, data)


@router.get("/report", response_model=MonthlyGameReport)
def get_monthly_game_report(
    year: int,
    month: int,
    user_id: int | None = None,
    db: Session = Depends(get_db),
):
    sessions = game_session_crud.get_finished_sessions_by_month(db, user_id, year, month)
    success_count, total_count, accuracy, total_score = _summarize_sessions(sessions)

    last_month = month - 1
    last_year = year
    if last_month == 0:
        last_month = 12
        last_year = year - 1

    last_month_sessions = game_session_crud.get_finished_sessions_by_month(
        db, user_id, last_year, last_month
    )
    _, _, last_month_accuracy, _ = _summarize_sessions(last_month_sessions)

    accuracy_diff_pct = (
        _pct_diff(accuracy, last_month_accuracy)
        if accuracy is not None and last_month_accuracy is not None
        else None
    )

    return MonthlyGameReport(
        year=year,
        month=month,
        session_count=len(sessions),
        success_count=success_count,
        total_count=total_count,
        accuracy=accuracy,
        accuracy_diff_pct=accuracy_diff_pct,
        total_score=total_score,
        has_last_month_data=bool(last_month_sessions),
    )


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
