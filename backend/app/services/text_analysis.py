import re
import csv
import os
import json
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

BASELINE_PATH = Path(__file__).parent.parent / "data" / "baseline.csv"

_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
SENTIMENT_MODEL = "gpt-4o-mini"


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


def _score_sentiment(text: str) -> dict:
    """OpenAI로 긍정/부정 점수(0~100)를 판단한다. 실패 시 (0, 0)."""
    if not text or len(text.strip()) < 2:
        return {"positive_score": 0, "negative_score": 0}

    prompt = (
        "다음은 한 어르신이 작성한 답변입니다. 이 답변에 담긴 감정을 분석해서 "
        "긍정 점수와 부정 점수를 각각 0~100 사이 정수로 매겨주세요. "
        "두 점수가 반드시 합쳐서 100일 필요는 없습니다 (예: 담담한 답변은 둘 다 낮을 수 있음).\n"
        "반드시 아래 JSON 형식으로만 답하세요. 다른 설명은 붙이지 마세요.\n"
        '{"positive_score": 정수, "negative_score": 정수}\n\n'
        f"답변: {text}"
    )

    try:
        resp = _client.chat.completions.create(
            model=SENTIMENT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=50,
            response_format={"type": "json_object"},
        )
        result = json.loads(resp.choices[0].message.content)
        positive_score = max(0, min(100, int(result.get("positive_score", 0))))
        negative_score = max(0, min(100, int(result.get("negative_score", 0))))
        return {"positive_score": positive_score, "negative_score": negative_score}
    except Exception as e:
        print(f"[text_analysis] 감정분석 실패, 0/0으로 대체: {e}")
        return {"positive_score": 0, "negative_score": 0}


def analyze(text: str, q_type: str | None = None) -> dict:
    """텍스트를 분석해서 지표 반환"""
    words = text.split()
    word_count = len(words)

    sentences = [s.strip() for s in re.split(r"[.!?。\n]", text) if s.strip()]
    sentence_count = max(len(sentences), 1)
    avg_sentence_length = round(word_count / sentence_count, 2)

    unique_words = set(words)
    unique_word_ratio = round(len(unique_words) / word_count, 3) if word_count > 0 else 0
    repeated_word_count = word_count - len(unique_words)

    sentiment_scores = _score_sentiment(text)

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
        "repeated_word_count": repeated_word_count,
        "complexity_score": complexity_score,
        "positive_score": sentiment_scores["positive_score"],
        "negative_score": sentiment_scores["negative_score"],
        "vs_baseline": {
            "word_count_diff": round(word_count - avg_wc, 1),
            "sentence_count_diff": round(sentence_count - avg_sc, 1),
            "avg_sentence_length_diff": round(avg_sentence_length - avg_sl, 2),
        },
    }
