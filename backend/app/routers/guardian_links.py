from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.guardian_link import GuardianLinkCreate, GuardianLinkUpdate, GuardianLinkResponse
from app.crud import guardian_link_crud

router = APIRouter(prefix="/guardian-links", tags=["guardian-links"])


@router.post("", response_model=GuardianLinkResponse, status_code=201)
def create_link(data: GuardianLinkCreate, db: Session = Depends(get_db)):
    return guardian_link_crud.create_link(db, data)


@router.get("/guardian/{guardian_id}", response_model=list[GuardianLinkResponse])
def get_by_guardian(guardian_id: int, db: Session = Depends(get_db)):
    return guardian_link_crud.get_links_by_guardian(db, guardian_id)


@router.get("/elder/{elder_id}", response_model=list[GuardianLinkResponse])
def get_by_elder(elder_id: int, db: Session = Depends(get_db)):
    return guardian_link_crud.get_links_by_elder(db, elder_id)


@router.patch("/{link_id}/status", response_model=GuardianLinkResponse)
def update_status(link_id: int, data: GuardianLinkUpdate, db: Session = Depends(get_db)):
    link = guardian_link_crud.update_status(db, link_id, data.status)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link
