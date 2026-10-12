from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.guardian_link import GuardianInviteCreate, GuardianLinkCreate, GuardianLinkUpdate, GuardianLinkResponse
from app.crud import guardian_link_crud, user_crud
from app.routers.auth import get_current_user

router = APIRouter(prefix="/guardian-links", tags=["guardian-links"])


def _require_guardian(user):
    if user.role != "GUARDIAN":
        raise HTTPException(status_code=403, detail="보호자 계정만 사용할 수 있습니다.")


def _require_user(user):
    if user.role != "USER":
        raise HTTPException(status_code=403, detail="사용자 계정만 사용할 수 있습니다.")


def _parse_invite_code(invite_code: str) -> int:
    normalized = invite_code.strip().upper()
    if normalized.startswith("RM-"):
        normalized = normalized[3:]
    if not normalized.isdigit():
        raise HTTPException(status_code=400, detail="초대코드 형식이 올바르지 않습니다.")
    return int(normalized)


def _create_pending_link(db: Session, guardian_id: int, elder_id: int):
    elder = user_crud.get_user(db, elder_id)
    if not elder or elder.role != "USER":
        raise HTTPException(status_code=404, detail="사용자 계정을 찾을 수 없습니다.")
    if guardian_id == elder_id:
        raise HTTPException(status_code=400, detail="본인 계정과는 연결할 수 없습니다.")
    if guardian_link_crud.get_active_link_by_guardian(db, guardian_id):
        raise HTTPException(status_code=400, detail="이미 연결 중인 사용자가 있습니다.")
    if guardian_link_crud.get_active_link_by_elder(db, elder_id):
        raise HTTPException(status_code=400, detail="이미 연결 중인 보호자가 있습니다.")
    if guardian_link_crud.get_active_link_by_pair(db, guardian_id, elder_id):
        raise HTTPException(status_code=400, detail="이미 연결 요청이 있습니다.")

    return guardian_link_crud.create_link(
        db,
        GuardianLinkCreate(guardian_id=guardian_id, elder_id=elder_id),
    )


@router.post("", response_model=GuardianLinkResponse, status_code=201)
def create_link(
    data: GuardianLinkCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_guardian(current_user)
    if current_user.id != data.guardian_id:
        raise HTTPException(status_code=403, detail="본인 계정으로만 연결 요청할 수 있습니다.")
    return _create_pending_link(db, data.guardian_id, data.elder_id)


@router.post("/invite", response_model=GuardianLinkResponse, status_code=201)
def create_link_by_invite(
    data: GuardianInviteCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_guardian(current_user)
    elder_id = _parse_invite_code(data.invite_code)
    return _create_pending_link(db, current_user.id, elder_id)


@router.get("/guardian/{guardian_id}", response_model=list[GuardianLinkResponse])
def get_by_guardian(
    guardian_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_guardian(current_user)
    if current_user.id != guardian_id:
        raise HTTPException(status_code=403, detail="본인의 연결 정보만 조회할 수 있습니다.")
    return guardian_link_crud.get_links_by_guardian(db, guardian_id)


@router.get("/elder/{elder_id}", response_model=list[GuardianLinkResponse])
def get_by_elder(
    elder_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_user(current_user)
    if current_user.id != elder_id:
        raise HTTPException(status_code=403, detail="본인의 연결 정보만 조회할 수 있습니다.")
    return guardian_link_crud.get_links_by_elder(db, elder_id)


@router.get("/me/requests", response_model=list[GuardianLinkResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_user(current_user)
    return [
        link
        for link in guardian_link_crud.get_links_by_elder(db, current_user.id)
        if link.status == "pending"
    ]


@router.patch("/{link_id}/status", response_model=GuardianLinkResponse)
def update_status(
    link_id: int,
    data: GuardianLinkUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_user(current_user)
    current_link = guardian_link_crud.get_link(db, link_id)
    if not current_link:
        raise HTTPException(status_code=404, detail="Link not found")
    if current_link.elder_id != current_user.id:
        raise HTTPException(status_code=403, detail="본인의 연결 요청만 변경할 수 있습니다.")
    if current_link.status != "pending":
        raise HTTPException(status_code=400, detail="대기 중인 연결 요청만 변경할 수 있습니다.")
    if data.status == "accepted":
        accepted_guardian_link = guardian_link_crud.get_accepted_link_by_guardian(db, current_link.guardian_id)
        accepted_elder_link = guardian_link_crud.get_accepted_link_by_elder(db, current_user.id)
        if accepted_guardian_link and accepted_guardian_link.id != link_id:
            raise HTTPException(status_code=400, detail="이미 연결된 사용자입니다.")
        if accepted_elder_link and accepted_elder_link.id != link_id:
            raise HTTPException(status_code=400, detail="이미 연결된 보호자입니다.")

    link = guardian_link_crud.update_status(db, link_id, data.status)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link
