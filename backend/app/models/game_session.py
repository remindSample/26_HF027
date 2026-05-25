from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("playing", "finished"), default="playing", nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    total_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    success_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
