from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.cognitive_report import CognitiveReportCreate, CognitiveReportResponse
from app.crud import cognitive_report_crud

router = APIRouter(prefix="/cognitive-reports", tags=["cognitive-reports"])


@router.post("", response_model=CognitiveReportResponse, status_code=201)
def create(data: CognitiveReportCreate, db: Session = Depends(get_db)):
    return cognitive_report_crud.create(db, data)


@router.get("/user/{user_id}", response_model=list[CognitiveReportResponse])
def get_by_user(user_id: int, db: Session = Depends(get_db)):
    return cognitive_report_crud.get_by_user(db, user_id)


@router.get("/{report_id}", response_model=CognitiveReportResponse)
def get(report_id: int, db: Session = Depends(get_db)):
    report = cognitive_report_crud.get(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
