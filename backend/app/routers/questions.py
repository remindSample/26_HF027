import os
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.question import (
    QuestionCreate,
    QuestionGenerateRequest,
    QuestionResponse,
    Q_TYPE,
    GuardianQuestionCreate,
    GuardianQuestionResponse,
    GuardianUnansweredCountResponse,
)
from app.crud import question_crud
from app.crud.guardian_link_crud import has_accepted_link
from app.routers.auth import get_current_user

router = APIRouter(prefix="/questions", tags=["questions"])

TAG_PROMPTS = {
    "family": ("가족", "social_relationship"),
    "food": ("음식", "sensory_memory"),
    "travel": ("여행", "memory_recall"),
    "season": ("계절", "sensory_memory"),
    "hobby": ("취미", "preference"),
    "childhood": ("어린 시절", "autobiographical"),
    "friend": ("친구", "social_relationship"),
}


@router.post("", response_model=QuestionResponse, status_code=201)
def create(data: QuestionCreate, db: Session = Depends(get_db)):
    return question_crud.create(db, data)


@router.post("/generate", response_model=QuestionResponse, status_code=201)
def generate(data: QuestionGenerateRequest, db: Session = Depends(get_db)):
    tag_label, q_type = TAG_PROMPTS[data.tag]

    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_QUESTION_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "당신은 어르신이 매일 한 줄로 기억을 떠올릴 수 있도록 돕는 "
                        "한국어 질문 생성자입니다. 의료 진단이나 치료처럼 보이는 표현은 피하고, "
                        "따뜻하고 부담 없는 질문을 한 문장으로만 작성하세요."
                    ),
                },
                {
                    "role": "user",
                    "content": f"해시태그 '{tag_label}'에 어울리는 오늘의 질문을 하나 만들어주세요.",
                },
            ],
            temperature=0.8,
            max_tokens=120,
        )
        content = (response.choices[0].message.content or "").strip().strip('"')
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"질문 생성에 실패했습니다: {exc}")

    if not content:
        raise HTTPException(status_code=500, detail="질문 생성 결과가 비어 있습니다.")

    return question_crud.create(
        db,
        QuestionCreate(
            created_by=data.created_by,
            target_user_id=data.target_user_id,
            content=content,
            q_type=q_type,
            source="AI_GENERATED",
            model_source=os.getenv("OPENAI_QUESTION_MODEL", "gpt-4o-mini"),
        ),
    )


@router.get("/{question_id}", response_model=QuestionResponse)
def get(question_id: int, db: Session = Depends(get_db)):
    question = question_crud.get(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.get("/user/{user_id}", response_model=list[QuestionResponse])
def get_by_user(user_id: int, q_type: Q_TYPE | None = None, db: Session = Depends(get_db)):
    return question_crud.get_by_target_user(db, user_id, q_type)


def _require_question_viewer(db: Session, current_user, user_id: int):
    if current_user.role == "USER" and current_user.id == user_id:
        return
    if current_user.role == "GUARDIAN" and has_accepted_link(db, current_user.id, user_id):
        return
    raise HTTPException(status_code=403, detail="본인 또는 연결된 보호자만 조회할 수 있습니다.")


def _get_guardian_questions(db: Session, user_id: int) -> list[GuardianQuestionResponse]:
    return [
        GuardianQuestionResponse(
            **QuestionResponse.model_validate(question).model_dump(),
            answered=answered_at is not None,
            answered_at=answered_at,
            guardian_name=guardian_name,
        )
        for question, answered_at, guardian_name in question_crud.get_guardian_questions(db, user_id)
    ]


@router.post("/guardian", response_model=QuestionResponse, status_code=201)
def create_guardian_question(
    data: GuardianQuestionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if current_user.role != "GUARDIAN":
        raise HTTPException(status_code=403, detail="보호자 계정만 사용할 수 있습니다.")
    if not has_accepted_link(db, current_user.id, data.target_user_id):
        raise HTTPException(status_code=403, detail="연결된 사용자에게만 질문을 보낼 수 있습니다.")

    content = data.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="질문 내용을 입력해주세요.")

    return question_crud.create(
        db,
        QuestionCreate(
            created_by=current_user.id,
            target_user_id=data.target_user_id,
            content=content,
            source="GUARDIAN_CUSTOM",
        ),
    )


@router.get("/user/{user_id}/guardian", response_model=list[GuardianQuestionResponse])
def get_guardian_questions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_question_viewer(db, current_user, user_id)
    return _get_guardian_questions(db, user_id)


@router.get("/user/{user_id}/guardian/unanswered-count", response_model=GuardianUnansweredCountResponse)
def get_guardian_unanswered_count(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    _require_question_viewer(db, current_user, user_id)
    questions = _get_guardian_questions(db, user_id)
    return GuardianUnansweredCountResponse(
        count=sum(1 for question in questions if not question.answered)
    )
