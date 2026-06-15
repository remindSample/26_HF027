from datetime import datetime
from sqlalchemy.orm import Session
from app.models.guardian_link import GuardianLink
from app.schemas.guardian_link import GuardianLinkCreate


def create_link(db: Session, data: GuardianLinkCreate) -> GuardianLink:
    link = GuardianLink(guardian_id=data.guardian_id, elder_id=data.elder_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def get_links_by_guardian(db: Session, guardian_id: int) -> list[GuardianLink]:
    return db.query(GuardianLink).filter(GuardianLink.guardian_id == guardian_id).all()


def get_links_by_elder(db: Session, elder_id: int) -> list[GuardianLink]:
    return db.query(GuardianLink).filter(GuardianLink.elder_id == elder_id).all()


def update_status(db: Session, link_id: int, status: str) -> GuardianLink | None:
    link = db.get(GuardianLink, link_id)
    if not link:
        return None
    link.status = status
    if status == "accepted":
        link.linked_at = datetime.utcnow()
    db.commit()
    db.refresh(link)
    return link
