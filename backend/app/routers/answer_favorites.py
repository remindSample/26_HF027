from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.answer_favorite import AnswerFavoriteCreate, AnswerFavoriteResponse
from app.crud import answer_favorite_crud

router = APIRouter(prefix="/answer-favorites", tags=["answer-favorites"])


@router.post("", response_model=AnswerFavoriteResponse, status_code=201)
def add_favorite(data: AnswerFavoriteCreate, db: Session = Depends(get_db)):
    return answer_favorite_crud.create(db, data)


@router.delete("/{answer_id}/user/{user_id}", status_code=204)
def remove_favorite(answer_id: int, user_id: int, db: Session = Depends(get_db)):
    if not answer_favorite_crud.delete(db, answer_id, user_id):
        raise HTTPException(status_code=404, detail="Favorite not found")


@router.get("/user/{user_id}", response_model=list[AnswerFavoriteResponse])
def get_by_user(user_id: int, db: Session = Depends(get_db)):
    return answer_favorite_crud.get_by_user(db, user_id)
