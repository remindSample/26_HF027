import base64
import os
from datetime import datetime
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from openai import OpenAI
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse, MonthlyAnswerReport, RecentAnswerResponse
from app.crud.answer_crud import create_answer, get_answers_by_month, get_recent_answers
from app.crud.question_crud import get as get_question
from app.routers.auth import get_current_user

router = APIRouter(prefix="/answers", tags=["answers"])


def _pct_diff(curr: float, prev: float) -> float | None:
    """prev가 0이면 퍼센트 변화를 정의할 수 없으므로 None."""
    if prev == 0:
        return None
    return round((curr - prev) / prev * 100, 1)


def _avg_unique_word_ratio(answers: list) -> float:
    ratios = [a.unique_word_ratio for a in answers if a.unique_word_ratio is not None]
    return round(sum(ratios) / len(ratios), 4) if ratios else 0.0


@router.post("", response_model=AnswerResponse, status_code=201)
def submit_answer(data: AnswerCreate, db: Session = Depends(get_db)):
    return create_answer(db, data)


@router.get("/recent", response_model=list[RecentAnswerResponse])
def get_recent_answer_list(
    user_id: int | None = None,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    limited_count = min(max(limit, 1), 5)
    rows = get_recent_answers(db, user_id, limited_count)
    return [
        RecentAnswerResponse(
            **AnswerResponse.model_validate(answer).model_dump(),
            question_content=question_content,
        )
        for answer, question_content in rows
    ]


@router.post("/upload-image", response_model=AnswerResponse, status_code=201)
async def upload_image_answer(
    image: UploadFile = File(...),
    question_id: int = Form(...),
    is_private: bool = Form(False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not get_question(db, question_id):
        raise HTTPException(status_code=404, detail="존재하지 않는 질문입니다.")

    image_bytes = await image.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    content_type = image.content_type or "image/jpeg"

    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{content_type};base64,{image_b64}"},
                        },
                        {
                            "type": "text",
                            "text": "이 이미지 속 손글씨 텍스트를 그대로 추출해서 반환해주세요. 다른 설명이나 마크다운 없이 텍스트만 출력하세요.",
                        },
                    ],
                }
            ],
            max_tokens=1000,
        )
        ocr_text = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR 처리 중 오류가 발생했습니다: {str(e)}")

    return create_answer(
        db,
        AnswerCreate(
            user_id=current_user.id,
            question_id=question_id,
            input_type="handwriting",
            ocr_text=ocr_text,
            content_text=None,
            image_url=None,
            is_private=is_private,
        ),
    )


@router.get("/report", response_model=MonthlyAnswerReport)
def get_monthly_report(
    year: int | None = None,
    month: int | None = None,
    user_id: int | None = None,
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
            avg_unique_word_ratio=0.0,
            sentiment_summary={"positive": 0, "neutral": 0, "negative": 0},
            has_last_month_data=False,
            word_count_diff_pct=None,
            unique_word_ratio_diff_pct=None,
            positive_score_diff_pct=None,
            ai_comment="아직 이번 달 답변이 없습니다. 오늘의 질문에 답변해보세요!",
        )

    n = len(answers)
    avg_wc = round(sum(a.word_count or 0 for a in answers) / n, 1)
    avg_sc = round(sum(a.sentence_count or 0 for a in answers) / n, 1)
    avg_cx = round(sum(a.avg_sentence_length or 0 for a in answers) / n, 1)
    avg_uwr = _avg_unique_word_ratio(answers)
    avg_pos = round(sum(a.positive_score or 0 for a in answers) / n, 1)
    avg_neg = round(sum(a.negative_score or 0 for a in answers) / n, 1)
    avg_neu = max(0.0, round(100 - avg_pos - avg_neg, 1))

    last_month = month - 1
    last_year = year
    if last_month == 0:
        last_month = 12
        last_year = year - 1
    last_month_answers = get_answers_by_month(db, user_id, last_year, last_month)

    has_last_month_data = bool(last_month_answers)
    word_count_diff_pct: float | None = None
    unique_word_ratio_diff_pct: float | None = None
    positive_score_diff_pct: float | None = None

    if has_last_month_data:
        lm_n = len(last_month_answers)
        lm_avg_wc = round(sum(a.word_count or 0 for a in last_month_answers) / lm_n, 1)
        lm_avg_uwr = _avg_unique_word_ratio(last_month_answers)
        lm_avg_pos = round(sum(a.positive_score or 0 for a in last_month_answers) / lm_n, 1)

        word_count_diff_pct = _pct_diff(avg_wc, lm_avg_wc)
        unique_word_ratio_diff_pct = _pct_diff(avg_uwr, lm_avg_uwr)
        positive_score_diff_pct = _pct_diff(avg_pos, lm_avg_pos)

        comment_parts = []
        if word_count_diff_pct is not None and word_count_diff_pct > 0:
            comment_parts.append(f"지난달보다 답변에 사용한 단어 수가 {abs(word_count_diff_pct)}% 늘었어요.")
        elif word_count_diff_pct is not None and word_count_diff_pct < 0:
            comment_parts.append(f"지난달보다 단어 수가 {abs(word_count_diff_pct)}% 줄었어요.")

        if unique_word_ratio_diff_pct is not None and unique_word_ratio_diff_pct > 0:
            comment_parts.append(f"어휘 다양성이 {abs(unique_word_ratio_diff_pct)}% 늘었어요.")
        elif unique_word_ratio_diff_pct is not None and unique_word_ratio_diff_pct < 0:
            comment_parts.append(f"어휘 다양성이 {abs(unique_word_ratio_diff_pct)}% 줄었어요.")

        ai_comment = " ".join(comment_parts) if comment_parts else "꾸준히 답변해주고 계세요!"
    else:
        ai_comment = "아직 비교할 지난달 기록이 없습니다."

    return MonthlyAnswerReport(
        year=year,
        month=month,
        answer_count=n,
        answers=[AnswerResponse.model_validate(a) for a in answers],
        avg_word_count=avg_wc,
        avg_sentence_count=avg_sc,
        avg_complexity_score=avg_cx,
        avg_unique_word_ratio=avg_uwr,
        sentiment_summary={"positive": avg_pos, "neutral": avg_neu, "negative": avg_neg},
        has_last_month_data=has_last_month_data,
        word_count_diff_pct=word_count_diff_pct,
        unique_word_ratio_diff_pct=unique_word_ratio_diff_pct,
        positive_score_diff_pct=positive_score_diff_pct,
        ai_comment=ai_comment,
    )
