from datetime import datetime
from sqlalchemy import Integer, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class GameEvent(Base):
    __tablename__ = "game_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("game_sessions.id"), nullable=False
    )
    hand_side: Mapped[str] = mapped_column(Enum("LEFT", "RIGHT"), nullable=False)
    target_gesture: Mapped[str] = mapped_column(Enum("FIST", "PALM"), nullable=False)
    user_input: Mapped[str | None] = mapped_column(
        Enum("FIST", "PALM"), nullable=True
    )
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
