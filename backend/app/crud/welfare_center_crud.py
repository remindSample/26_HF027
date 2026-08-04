from sqlalchemy.orm import Session
from app.models.welfare_center import WelfareCenter
from app.schemas.welfare_center import WelfareCenterCreate


def create(db: Session, data: WelfareCenterCreate) -> WelfareCenter:
    center = WelfareCenter(**data.model_dump())
    db.add(center)
    db.commit()
    db.refresh(center)
    return center


def get_all(db: Session) -> list[WelfareCenter]:
    return db.query(WelfareCenter).order_by(WelfareCenter.name).all()


def get(db: Session, center_id: int) -> WelfareCenter | None:
    return db.get(WelfareCenter, center_id)
