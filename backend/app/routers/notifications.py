from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.notification import NotificationResponse
from app.crud import notification_crud

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/user/{receiver_id}", response_model=list[NotificationResponse])
def get_by_receiver(receiver_id: int, db: Session = Depends(get_db)):
    return notification_crud.get_by_receiver(db, receiver_id)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    noti = notification_crud.mark_read(db, notification_id)
    if not noti:
        raise HTTPException(status_code=404, detail="Notification not found")
    return noti
