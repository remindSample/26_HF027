from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse, MonthlyAnswerReport
from app.crud.answer_crud import create_answer, get_answers_by_month

router = APIRouter(prefix="/answers", tags=["answers"])


@router.post("", response_model=AnswerResponse, status_code=201)
def submit_answer(data: AnswerCreate, db: Session = Depends(get_db)):
    return create_answer(db, data)


@router.get("/report", response_model=MonthlyAnswerReport)
def get_monthly_report(
    year: int | None = None,
    month: int | None = None,
    user_id: int | None = None,
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month

    answers = get_answers_by_month(db, user_id, year, month)

    return MonthlyAnswerReport(
        year=year,
        month=month,
        answer_count=len(answers),
        answers=[AnswerResponse.model_validate(a) for a in answers],
    )
