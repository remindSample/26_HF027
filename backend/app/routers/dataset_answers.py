from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dataset_answer import DatasetAnswerCreate, DatasetAnswerResponse
from app.crud import dataset_answer_crud

router = APIRouter(prefix="/dataset-answers", tags=["dataset-answers"])


@router.post("", response_model=DatasetAnswerResponse, status_code=201)
def create(data: DatasetAnswerCreate, db: Session = Depends(get_db)):
    return dataset_answer_crud.create(db, data)
