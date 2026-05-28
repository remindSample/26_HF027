from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.answer import Answer
from app.schemas.answer import AnswerCreate
from app.services.text_analysis import analyze


def create_answer(db: Session, data: AnswerCreate) -> Answer:
    metrics = analyze(data.answer_text, data.q_type)
    answer = Answer(
        user_id=data.user_id,
        question_id=data.question_id,
        q_type=data.q_type,
        question_text=data.question_text,
        answer_text=data.answer_text,
        input_type=data.input_type,
        word_count=metrics["word_count"],
        sentence_count=metrics["sentence_count"],
        avg_sentence_length=metrics["avg_sentence_length"],
        unique_word_ratio=metrics["unique_word_ratio"],
        complexity_score=metrics["complexity_score"],
        sentiment=metrics["sentiment"],
        vs_baseline=metrics["vs_baseline"],
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_answers_by_month(
    db: Session, user_id: int | None, year: int, month: int
) -> list[Answer]:
    q = db.query(Answer).filter(
        extract("year", Answer.created_at) == year,
        extract("month", Answer.created_at) == month,
    )
    if user_id is not None:
        q = q.filter(Answer.user_id == user_id)
    return q.order_by(Answer.created_at).all()
