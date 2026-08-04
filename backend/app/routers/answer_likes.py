from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.answer_like import AnswerLikeCreate, AnswerLikeResponse
from app.crud import answer_like_crud

router = APIRouter(prefix="/answer-likes", tags=["answer-likes"])


@router.post("", response_model=AnswerLikeResponse, status_code=201)
def add_like(data: AnswerLikeCreate, db: Session = Depends(get_db)):
    return answer_like_crud.create(db, data)


@router.delete("/{answer_id}/guardian/{guardian_id}", status_code=204)
def remove_like(answer_id: int, guardian_id: int, db: Session = Depends(get_db)):
    if not answer_like_crud.delete(db, answer_id, guardian_id):
        raise HTTPException(status_code=404, detail="Like not found")
