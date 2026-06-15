from datetime import datetime
from sqlalchemy import BigInteger, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Notification(Base):
    __tablename__ = "notification"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    receiver_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    ref_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    message: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
