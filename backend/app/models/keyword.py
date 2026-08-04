from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Keyword(Base):
    __tablename__ = "keyword"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
