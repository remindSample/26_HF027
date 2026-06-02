from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.emotion_log import EmotionLogCreate, EmotionLogResponse
from app.crud import emotion_log_crud

router = APIRouter(prefix="/emotion-logs", tags=["emotion-logs"])


@router.post("", response_model=EmotionLogResponse, status_code=201)
def create(data: EmotionLogCreate, db: Session = Depends(get_db)):
    return emotion_log_crud.create_emotion_log(db, data)


@router.get("/answer/{answer_id}", response_model=EmotionLogResponse)
def get_by_answer(answer_id: int, db: Session = Depends(get_db)):
    log = emotion_log_crud.get_emotion_log_by_answer(db, answer_id)
    if not log:
        raise HTTPException(status_code=404, detail="Emotion log not found")
    return log
