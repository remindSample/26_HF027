from sqlalchemy.orm import Session
from app.models.cognitive_report import CognitiveReport
from app.schemas.cognitive_report import CognitiveReportCreate


def create(db: Session, data: CognitiveReportCreate) -> CognitiveReport:
    report = CognitiveReport(**data.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_by_user(db: Session, user_id: int) -> list[CognitiveReport]:
    return (
        db.query(CognitiveReport)
        .filter(CognitiveReport.user_id == user_id)
        .order_by(CognitiveReport.period_start.desc())
        .all()
    )


def get(db: Session, report_id: int) -> CognitiveReport | None:
    return db.get(CognitiveReport, report_id)
