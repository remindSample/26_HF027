from datetime import datetime
from sqlalchemy import BigInteger, SmallInteger, Text, Enum, DateTime, String, Boolean, Numeric, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Answer(Base):
    __tablename__ = "answer"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("question.id", ondelete="CASCADE"), nullable=False)
    input_type: Mapped[str] = mapped_column(Enum("text", "handwriting"), nullable=False, default="text")
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_private: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    word_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    sentence_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    avg_sentence_length: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    unique_word_ratio: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    repeated_word_count: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    positive_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    negative_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    answered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
