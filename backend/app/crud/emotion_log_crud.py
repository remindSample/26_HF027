from sqlalchemy.orm import Session
from app.models.emotion_log import EmotionLog
from app.schemas.emotion_log import EmotionLogCreate


def create_emotion_log(db: Session, data: EmotionLogCreate) -> EmotionLog:
    log = EmotionLog(
        answer_id=data.answer_id,
        dominant_emotion=data.dominant_emotion,
        depression_risk=data.depression_risk,
        cognitive_decline_risk=data.cognitive_decline_risk,
        detail_json=data.detail_json,
        word_count=data.word_count,
        sentence_count=data.sentence_count,
        avg_sentence_length=data.avg_sentence_length,
        unique_word_ratio=data.unique_word_ratio,
        repeated_word_count=data.repeated_word_count,
        positive_score=data.positive_score,
        negative_score=data.negative_score,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_emotion_log_by_answer(db: Session, answer_id: int) -> EmotionLog | None:
    return db.query(EmotionLog).filter(EmotionLog.answer_id == answer_id).first()
