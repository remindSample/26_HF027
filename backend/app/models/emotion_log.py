from datetime import datetime
from sqlalchemy import BigInteger, SmallInteger, String, Numeric, JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class EmotionLog(Base):
    __tablename__ = "emotion_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    answer_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("answers.id", ondelete="CASCADE"), nullable=False, unique=True)
    dominant_emotion: Mapped[str | None] = mapped_column(String(30), nullable=True)
    depression_risk: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    cognitive_decline_risk: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    detail_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    word_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    sentence_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    avg_sentence_length: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    unique_word_ratio: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    repeated_word_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    positive_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    negative_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
