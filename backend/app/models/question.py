from datetime import datetime
from sqlalchemy import BigInteger, Text, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Question(Base):
    __tablename__ = "question"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    created_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    target_user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    welfare_center_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("welfare_center.id", ondelete="SET NULL"), nullable=True)
    keyword_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("keyword.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    q_type: Mapped[str | None] = mapped_column(
        Enum("memory_recall", "emotional_expression", "daily_life", "autobiographical", "social_relationship", "preference", "sensory_memory"),
        nullable=True,
    )
    source: Mapped[str] = mapped_column(Enum("AI_GENERATED", "GUARDIAN_CUSTOM", "WELFARE_PRESET"), nullable=False, default="AI_GENERATED")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
