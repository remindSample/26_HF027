from sqlalchemy.orm import Session
from app.models.notification import Notification


def get_by_receiver(db: Session, receiver_id: int) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.receiver_id == receiver_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def mark_read(db: Session, notification_id: int) -> Notification | None:
    noti = db.get(Notification, notification_id)
    if not noti:
        return None
    noti.is_read = True
    db.commit()
    db.refresh(noti)
    return noti
