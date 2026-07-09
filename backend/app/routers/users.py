from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud import user_crud

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if data.phone and user_crud.get_user_by_phone(db, data.phone):
        raise HTTPException(status_code=400, detail="Phone already registered")
    if data.email and user_crud.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_crud.create_user(db, data)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
