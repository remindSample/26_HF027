from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.question import QuestionCreate, QuestionResponse
from app.crud import question_crud

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("", response_model=QuestionResponse, status_code=201)
def create(data: QuestionCreate, db: Session = Depends(get_db)):
    return question_crud.create(db, data)


@router.get("/{question_id}", response_model=QuestionResponse)
def get(question_id: int, db: Session = Depends(get_db)):
    question = question_crud.get(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.get("/user/{user_id}", response_model=list[QuestionResponse])
def get_by_user(user_id: int, db: Session = Depends(get_db)):
    return question_crud.get_by_target_user(db, user_id)
