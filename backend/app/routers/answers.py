from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse, MonthlyAnswerReport
from app.crud.answer_crud import create_answer, get_answers_by_month

COMMENT_TEMPLATES = [
    "{name}님의 이번 달 답변은 평균보다 단어 수가 {word_diff}개 {word_dir}습니다. 꾸준한 활동이 도움이 되고 있어요!",
    "이번 달은 문장 표현이 {sent_dir} 풍부해졌습니다. 기억을 글로 표현하는 연습이 인지 건강에 매우 좋습니다.",
    "답변 활동에 성실히 참여해 주셨습니다. 앞으로도 꾸준히 이어가 주세요!",
]

router = APIRouter(prefix="/answers", tags=["answers"])


@router.post("", response_model=AnswerResponse, status_code=201)
def submit_answer(data: AnswerCreate, db: Session = Depends(get_db)):
    return create_answer(db, data)


@router.get("/report", response_model=MonthlyAnswerReport)
def get_monthly_report(
    year: int | None = None,
    month: int | None = None,
    user_id: int | None = None,
    name: str = "사용자",
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month
    answers = get_answers_by_month(db, user_id, year, month)
    if not answers:
        return MonthlyAnswerReport(
            year=year,
            month=month,
            answer_count=0,
            answers=[],
            avg_word_count=0.0,
            avg_sentence_count=0.0,
            avg_complexity_score=0.0,
            sentiment_summary={"positive": 0, "neutral": 0, "negative": 0},
            ai_comment="아직 이번 달 답변이 없습니다. 오늘의 질문에 답변해보세요!",
        )
    n = len(answers)
    avg_wc = round(sum(a.word_count or 0 for a in answers) / n, 1)
    avg_sc = round(sum(a.sentence_count or 0 for a in answers) / n, 1)
    avg_cx = round(sum(a.avg_sentence_length or 0 for a in answers) / n, 1)
    avg_pos = round(sum(a.positive_score or 0 for a in answers) / n, 1)
    avg_neg = round(sum(a.negative_score or 0 for a in answers) / n, 1)
    avg_neu = round(10 - avg_pos - avg_neg, 1)
    word_diff = round(avg_wc - 20)
    word_dir = "많" if word_diff >= 0 else "적"
    sent_dir = "더" if avg_sc >= 3.2 else "조금"
    ai_comment = " ".join([
        COMMENT_TEMPLATES[0].format(name=name, word_diff=abs(word_diff), word_dir=word_dir),
        COMMENT_TEMPLATES[1].format(sent_dir=sent_dir),
        COMMENT_TEMPLATES[2],
    ])
    return MonthlyAnswerReport(
        year=year,
        month=month,
        answer_count=n,
        answers=[AnswerResponse.model_validate(a) for a in answers],
        avg_word_count=avg_wc,
        avg_sentence_count=avg_sc,
        avg_complexity_score=avg_cx,
        sentiment_summary={"positive": avg_pos, "neutral": avg_neu, "negative": avg_neg},
        ai_comment=ai_comment,
    )
