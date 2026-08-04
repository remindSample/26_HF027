"""
ReMind - 질문에 대한 합성(synthetic) 답변 대량 생성 스크립트
- question 테이블에 있는 질문들을 가져와서 각 질문마다 여러 페르소나(나이/성별)로 답변 생성
- dataset_answer 테이블에 is_real=0(임의생성)으로 저장
- word_count, sentence_count 등 통계값은 GPT가 아니라 파이썬으로 직접 계산

필요 패키지:
    pip install openai python-dotenv pymysql
"""

import os
import re
import json
import time
import random
from dotenv import load_dotenv
from openai import OpenAI
import pymysql

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DB_CONFIG = dict(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    charset="utf8mb4",
)

# 답변 생성에 쓸 가상 페르소나 (나이대/나이/성별). 질문마다 이 중 일부를 로테이션해서 사용
PERSONAS = [
    {"user_group": "elderly", "age_group": "elderly", "age": 65, "gender": "M"},
    {"user_group": "elderly", "age_group": "elderly", "age": 68, "gender": "F"},
    {"user_group": "elderly", "age_group": "elderly", "age": 72, "gender": "M"},
    {"user_group": "old_elderly", "age_group": "old_elderly", "age": 80, "gender": "F"},
    {"user_group": "middle_adult", "age_group": "middle_adult", "age": 50, "gender": "M"},
]

ANSWERS_PER_QUESTION = 3  # 질문 하나당 생성할 답변 수 (페르소나 중 랜덤/순차로 사용)

# 답변 길이 티어: (문장 수 범위, 설명, 선택 가중치)
# 가중치 합은 100 기준. 길게(long)는 드물게 나오도록 낮게 설정
LENGTH_TIERS = [
    {"name": "short", "sentence_range": "1~2문장 (약 30~80자)", "weight": 35},
    {"name": "medium", "sentence_range": "3~5문장 (약 100~250자)", "weight": 55},
    {"name": "long", "sentence_range": "6~10문장 (약 300~600자)", "weight": 10},
]


def pick_length_tier() -> dict:
    weights = [t["weight"] for t in LENGTH_TIERS]
    return random.choices(LENGTH_TIERS, weights=weights, k=1)[0]

ANSWER_PROMPT = """당신은 {age}세 {gender_kr} {age_desc}입니다.
아래 질문에 대해 실제로 답변하듯이 자연스러운 한국어로 대답하세요.

[질문]: {question}

[조건]:
1. 분량: {sentence_range} 정도로 작성 (이 범위를 반드시 지킬 것)
2. 자연스러운 구어체 (일기나 인터뷰 답변 느낌)
3. 실제 경험을 이야기하듯 구체적으로 작성
4. 나이대에 맞는 말투 사용 ({age_desc}다운 어휘와 문장 길이)
5. 결과는 아래 JSON 형식으로만 출력 (설명, 마크다운 없이)

[출력 형식]
{{"answer": "답변 내용", "positive_score": 1~10 사이 정수, "negative_score": 1~10 사이 정수}}
"""

AGE_DESC = {
    "elderly": "노인",
    "old_elderly": "고령 노인",
    "middle_adult": "중년",
    "young_adult": "청년",
}

GENDER_KR = {"M": "남성", "F": "여성"}


def compute_text_stats(text: str) -> dict:
    """word_count, sentence_count 등을 텍스트 기반으로 직접 계산"""
    sentences = [s for s in re.split(r"[.!?]", text) if s.strip()]
    words = text.split()

    sentence_count = len(sentences) or 1
    word_count = len(words)
    avg_sentence_length = round(word_count / sentence_count, 2)

    unique_words = set(words)
    unique_word_ratio = round(len(unique_words) / word_count, 4) if word_count else 0

    word_freq = {}
    for w in words:
        word_freq[w] = word_freq.get(w, 0) + 1
    repeated_word_count = sum(1 for c in word_freq.values() if c > 1)

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_length": avg_sentence_length,
        "unique_word_ratio": unique_word_ratio,
        "repeated_word_count": repeated_word_count,
    }


def generate_answer(question: str, persona: dict, length_tier: dict) -> dict | None:
    prompt = ANSWER_PROMPT.format(
        age=persona["age"],
        gender_kr=GENDER_KR[persona["gender"]],
        age_desc=AGE_DESC[persona["age_group"]],
        question=question,
        sentence_range=length_tier["sentence_range"],
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=1.0,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.split("\n", 1)[-1] if raw.lower().startswith("json") else raw

    try:
        data = json.loads(raw)
        return data
    except json.JSONDecodeError:
        print(f"[WARN] JSON 파싱 실패. 원본:\n{raw}")
        return None


def get_or_create_synthetic_welfare_center(cur) -> int:
    cur.execute("SELECT id FROM welfare_center WHERE name = %s", ("합성데이터용 가상센터",))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO welfare_center (name, region, note) VALUES (%s, %s, %s)",
        ("합성데이터용 가상센터", "synthetic", "AI 생성 데이터 저장용 더미 센터"),
    )
    return cur.lastrowid


def main():
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cur:
            welfare_center_id = get_or_create_synthetic_welfare_center(cur)
            conn.commit()

            cur.execute("SELECT id, content, q_type FROM question WHERE source = 'AI_GENERATED'")
            questions = cur.fetchall()
            print(f"[INFO] 총 {len(questions)}개 질문에 답변 생성 시작")

            insert_sql = """
                INSERT INTO dataset_answer (
                    welfare_center_id, question_id, is_real, user_group,
                    age, age_group, gender, raw_answer,
                    word_count, sentence_count, avg_sentence_length,
                    unique_word_ratio, repeated_word_count,
                    positive_score, negative_score
                ) VALUES (%s, %s, 0, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

            for q_id, q_content, q_type in questions:
                for i in range(ANSWERS_PER_QUESTION):
                    persona = PERSONAS[i % len(PERSONAS)]
                    length_tier = pick_length_tier()
                    result = generate_answer(q_content, persona, length_tier)
                    if not result:
                        continue

                    answer_text = result.get("answer", "").strip()
                    if not answer_text:
                        continue

                    stats = compute_text_stats(answer_text)

                    cur.execute(insert_sql, (
                        welfare_center_id,
                        q_id,
                        persona["user_group"],
                        persona["age"],
                        persona["age_group"],
                        persona["gender"],
                        answer_text,
                        stats["word_count"],
                        stats["sentence_count"],
                        stats["avg_sentence_length"],
                        stats["unique_word_ratio"],
                        stats["repeated_word_count"],
                        result.get("positive_score"),
                        result.get("negative_score"),
                    ))
                    conn.commit()

                    time.sleep(0.5)

                print(f"[INFO] question_id={q_id} ({q_type}) 답변 {ANSWERS_PER_QUESTION}개 저장 완료")
    finally:
        conn.close()


if __name__ == "__main__":
    main()