from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from pydantic import BaseModel
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud import user_crud
import os

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="존재하지 않는 사용자입니다.")
    return user

SECRET_KEY = os.getenv("SECRET_KEY", "remind-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


class LoginRequest(BaseModel):
    identifier: str  # 전화번호 또는 이메일
    password: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if data.phone and user_crud.get_user_by_phone(db, data.phone):
        raise HTTPException(status_code=400, detail="이미 가입된 전화번호입니다.")
    if data.email and user_crud.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")
    return user_crud.create_user(db, data)


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_phone(db, data.identifier) or \
           user_crud.get_user_by_email(db, data.identifier)
    if not user or not user_crud.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 틀렸습니다.")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role,
        },
    }
