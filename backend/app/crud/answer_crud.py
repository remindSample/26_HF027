from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.answer import Answer
from app.models.question import Question
from app.schemas.answer import AnswerCreate
from app.services.text_analysis import analyze


def create_answer(db: Session, data: AnswerCreate) -> Answer:
    # 직접 입력 텍스트 또는 OCR 변환 텍스트 분석
    text_to_analyze = data.content_text or data.ocr_text
    metrics: dict = {}
    if text_to_analyze:
        metrics = analyze(text_to_analyze)

    word_count = metrics.get("word_count", 0)

    answer = Answer(
        user_id=data.user_id,
        question_id=data.question_id,
        input_type=data.input_type,
        content_text=data.content_text,
        image_url=data.image_url,
        ocr_text=data.ocr_text,
        is_private=data.is_private,
        word_count=word_count or None,
        sentence_count=metrics.get("sentence_count") or None,
        avg_sentence_length=metrics.get("avg_sentence_length") or None,
        unique_word_ratio=metrics.get("unique_word_ratio") or None,
        repeated_word_count=metrics.get("repeated_word_count"),
        positive_score=metrics.get("positive_score"),
        negative_score=metrics.get("negative_score"),
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_answers_by_month(
    db: Session, user_id: int | None, year: int, month: int
) -> list[Answer]:
    q = db.query(Answer).filter(
        extract("year", Answer.answered_at) == year,
        extract("month", Answer.answered_at) == month,
    )
    if user_id is not None:
        q = q.filter(Answer.user_id == user_id)
    return q.order_by(Answer.answered_at).all()


def get_recent_answers(db: Session, user_id: int | None, limit: int = 5):
    q = db.query(Answer, Question.content.label("question_content")).join(
        Question,
        Answer.question_id == Question.id,
    )
    if user_id is not None:
        q = q.filter(Answer.user_id == user_id)
    return q.order_by(Answer.answered_at.desc()).limit(limit).all()
