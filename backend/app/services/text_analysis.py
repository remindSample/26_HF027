import re
import csv
import os
from collections import defaultdict
from pathlib import Path

BASELINE_PATH = Path(__file__).parent.parent / "data" / "baseline.csv"

POSITIVE_KEYWORDS = [
    "행복", "기쁘", "좋았", "즐거", "반갑", "감사", "설레", "웃음", "편안",
    "사랑", "그리웠", "보람", "다행", "기분좋", "흐뭇", "뿌듯", "신났",
    "만족", "활기", "따뜻", "기대", "즐겁", "좋아", "기뻤",
]
NEGATIVE_KEYWORDS = [
    "힘들", "슬프", "외롭", "무서", "걱정", "아프", "피곤", "불안",
    "어렵", "울었", "괴로", "싫", "두렵", "고통", "힘겨", "외로",
]


def _load_baseline() -> dict:
    """CSV에서 Q_type별 평균값 계산"""
    if not BASELINE_PATH.exists():
        return {}

    records: dict[str, list] = defaultdict(list)
    with open(BASELINE_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                records[row["Q_type"]].append({
                    "word_count": int(row["word_count"]),
                    "sentence_count": int(row["sentence_count"]),
                    "avg_sentence_length": float(row["avg_sentence_length"]),
                })
            except (ValueError, KeyError):
                continue

    def _avg(rows: list[dict]) -> dict:
        n = len(rows)
        return {
            "word_count": round(sum(r["word_count"] for r in rows) / n, 1),
            "sentence_count": round(sum(r["sentence_count"] for r in rows) / n, 1),
            "avg_sentence_length": round(sum(r["avg_sentence_length"] for r in rows) / n, 2),
        }

    averages = {q_type: _avg(rows) for q_type, rows in records.items()}
    # 전체 평균 (q_type 없을 때 fallback)
    averages["_overall"] = _avg([r for rows in records.values() for r in rows])
    return averages


# 앱 시작 시 1회만 로드
_BASELINE = _load_baseline()


def analyze(text: str, q_type: str | None = None) -> dict:
    """텍스트를 분석해서 지표 반환"""
    words = text.split()
    word_count = len(words)

    sentences = [s.strip() for s in re.split(r"[.!?。\n]", text) if s.strip()]
    sentence_count = max(len(sentences), 1)
    avg_sentence_length = round(word_count / sentence_count, 2)

    unique_words = set(words)
    unique_word_ratio = round(len(unique_words) / word_count, 3) if word_count > 0 else 0

    positive_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in text)
    negative_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text)
    total_sentiment = positive_count + negative_count
    if total_sentiment == 0:
        positive_pct, negative_pct, neutral_pct = 10, 10, 80
    else:
        positive_pct = round(positive_count / total_sentiment * 100)
        negative_pct = round(negative_count / total_sentiment * 100)
        neutral_pct = 100 - positive_pct - negative_pct

    baseline = _BASELINE.get(q_type or "_overall", _BASELINE.get("_overall", {}))
    avg_wc = baseline.get("word_count", 20.0)
    avg_sc = baseline.get("sentence_count", 3.2)
    avg_sl = baseline.get("avg_sentence_length", 6.2)

    # 복잡도 점수 (avg_sentence_length 기반, 100점 만점)
    complexity_score = min(100, round(avg_sentence_length / 10 * 100))

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_length": avg_sentence_length,
        "unique_word_ratio": unique_word_ratio,
        "unique_word_count": len(unique_words),
        "complexity_score": complexity_score,
        "sentiment": {
            "positive": positive_pct,
            "neutral": neutral_pct,
            "negative": negative_pct,
        },
        "vs_baseline": {
            "word_count_diff": round(word_count - avg_wc, 1),
            "sentence_count_diff": round(sentence_count - avg_sc, 1),
            "avg_sentence_length_diff": round(avg_sentence_length - avg_sl, 2),
        },
    }
