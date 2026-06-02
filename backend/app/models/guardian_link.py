from datetime import datetime
from sqlalchemy import BigInteger, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class GuardianLink(Base):
    __tablename__ = "guardian_link"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    guardian_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    elder_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(Enum("pending", "accepted", "rejected"), nullable=False, default="pending")
    linked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
