from datetime import date, datetime
from sqlalchemy import BigInteger, SmallInteger, Enum, Date, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class CognitiveReport(Base):
    __tablename__ = "cognitive_report"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    period_type: Mapped[str] = mapped_column(Enum("weekly", "monthly"), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    vocab_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    sentence_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    expression_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    total_answers: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
