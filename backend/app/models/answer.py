from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    question_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    q_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    question_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    input_type: Mapped[str] = mapped_column(String(20), default="text")  # text | image

    # 분석 결과
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sentence_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    avg_sentence_length: Mapped[float | None] = mapped_column(Float, nullable=True)
    unique_word_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    complexity_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sentiment: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    vs_baseline: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
