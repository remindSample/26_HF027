from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        name=data.name,
        phone=data.phone,
        email=data.email,
        password_hash=data.password,  # TODO: bcrypt 해시 적용
        role=data.role,
        birth_date=data.birth_date,
        profile_url=data.profile_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_phone(db: Session, phone: str) -> User | None:
    return db.query(User).filter(User.phone == phone).first()
