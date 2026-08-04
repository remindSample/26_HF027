from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.keyword import KeywordCreate, KeywordResponse
from app.crud import keyword_crud

router = APIRouter(prefix="/keywords", tags=["keywords"])


@router.post("", response_model=KeywordResponse, status_code=201)
def create(data: KeywordCreate, db: Session = Depends(get_db)):
    return keyword_crud.create(db, data)


@router.get("", response_model=list[KeywordResponse])
def get_all(db: Session = Depends(get_db)):
    return keyword_crud.get_all(db)
