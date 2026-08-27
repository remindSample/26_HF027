from datetime import datetime
from sqlalchemy import BigInteger, SmallInteger, String, Text, Enum, DateTime, Boolean, Numeric, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class DatasetAnswer(Base):
    __tablename__ = "dataset_answer"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    question_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("question.id", ondelete="SET NULL"), nullable=True)
    respondent_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_real: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    user_group: Mapped[str | None] = mapped_column(String(50), nullable=True)
    age: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    age_group: Mapped[str | None] = mapped_column(Enum("young_adult", "middle_adult", "elderly", "old_elderly"), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    word_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    sentence_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    avg_sentence_length: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    unique_word_ratio: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    repeated_word_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    positive_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    negative_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    collected_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
