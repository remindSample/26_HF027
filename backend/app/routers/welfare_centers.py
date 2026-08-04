from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.welfare_center import WelfareCenterCreate, WelfareCenterResponse
from app.crud import welfare_center_crud

router = APIRouter(prefix="/welfare-centers", tags=["welfare-centers"])


@router.post("", response_model=WelfareCenterResponse, status_code=201)
def create(data: WelfareCenterCreate, db: Session = Depends(get_db)):
    return welfare_center_crud.create(db, data)


@router.get("", response_model=list[WelfareCenterResponse])
def get_all(db: Session = Depends(get_db)):
    return welfare_center_crud.get_all(db)


@router.get("/{center_id}", response_model=WelfareCenterResponse)
def get(center_id: int, db: Session = Depends(get_db)):
    center = welfare_center_crud.get(db, center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Welfare center not found")
    return center
