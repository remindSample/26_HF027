"""
ReMind - 카테고리(q_type) x 하위 키워드 기반 질문 대량 생성 스크립트
- .env 에서 OPENAI_API_KEY, DB 접속 정보 로드
- question 테이블: id, keyword_id, content, q_type, source, created_at 등 (v4 스키마 기준)
- keyword 테이블: id, name, category  (category 자리에 q_type을 넣어 소속 표시)

동작 순서:
1) q_type별 하위 keyword 목록을 keyword 테이블에 upsert
2) 각 keyword마다 GPT 호출 -> 질문 5~6개 생성 (소재가 한쪽으로 쏠리지 않도록)
3) question 테이블에 q_type + keyword_id + content(source=AI_GENERATED)로 저장

필요 패키지:
    pip install openai python-dotenv pymysql
"""

import os
import json
import time
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

# q_type 설명 (프롬프트에 목적을 명확히 알려주기 위함)
QTYPE_DESCRIPTIONS = {
    "memory_recall": "과거의 특정 기억(장소, 물건, 사람, 사건 등 무엇이든)을 구체적으로 떠올리게 하는 질문",
    "emotional_expression": "최근 느낀 감정이나 기분을 표현하도록 유도하는 질문",
    "daily_life": "오늘 또는 어제 있었던 일을 자연스럽게 서술하도록 유도하는 질문",
    "autobiographical": "인생의 특정 시기나 사건에 대한 경험을 회고하도록 하는 질문",
    "social_relationship": "특정 사람과의 관계나 추억을 회상하도록 하는 질문",
    "preference": "좋아하는 것과 그 이유를 이야기하도록 유도하는 질문",
    "sensory_memory": "냄새, 소리, 맛, 촉감 등 감각과 연결된 기억을 떠올리게 하는 질문",
}

# q_type별 하위 keyword (소재 다양성 확보용). 필요시 자유롭게 추가/수정
KEYWORD_MAP = {
    "memory_recall": ["어릴 적 살던 동네", "아끼던 물건", "학교생활", "명절 풍경", "어릴 적 옷차림", "어릴 적 놀이"],
    "emotional_expression": ["최근 행복했던 순간", "최근 걱정거리", "자랑스러웠던 일", "감사했던 일", "그리운 사람"],
    "daily_life": ["아침 일과", "식사", "만난 사람", "날씨", "하루 중 활동"],
    "autobiographical": ["학창 시절", "직장생활", "결혼 생활", "자녀 양육", "인생의 전환점"],
    "social_relationship": ["가장 친한 친구", "배우자", "자녀", "이웃", "직장 동료"],
    "preference": ["좋아하는 음식", "좋아하는 계절", "좋아하는 색깔", "좋아하는 노래", "좋아하는 취미"],
    "sensory_memory": ["기억나는 냄새", "기억나는 소리", "기억나는 맛", "기억나는 촉감", "기억나는 풍경"],
}

QUESTIONS_PER_KEYWORD = 6  # keyword 하나당 생성 개수 (q_type당 총 30~36개 정도가 됨)

PROMPT_TEMPLATE = """당신은 노인 인지훈련 앱을 위한 질문지를 작성하는 전문가입니다.
아래 조건에 맞는 질문 {n}개를 생성하세요.

[질문 목적]: {qtype_desc}
[세부 소재]: {keyword}
[대상]: 60대 이상 노인, 손글씨로 답변 작성

[조건]:
1. 존댓말, 한 문장 20~40자 내외의 짧고 명확한 질문
2. 예/아니오로 끝나지 않는 개방형 질문
3. "{keyword}"라는 소재 안에서도 시기/상황을 다르게 하여 서로 겹치지 않게 작성
4. 지나치게 추상적이거나 철학적인 질문은 피하고 구체적 경험을 묻는 질문 위주로 작성
5. 결과는 반드시 아래 JSON 배열 형식으로만 출력 (설명, 마크다운, 번호 없이)

[출력 형식]
["질문1", "질문2", ..., "질문{n}"]
"""


def get_or_create_keyword_id(cur, name: str, category: str) -> int:
    cur.execute("SELECT id FROM keyword WHERE name = %s", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute("INSERT INTO keyword (name, category) VALUES (%s, %s)", (name, category))
    return cur.lastrowid


def generate_questions(q_type: str, keyword: str, n: int) -> list:
    prompt = PROMPT_TEMPLATE.format(
        n=n, qtype_desc=QTYPE_DESCRIPTIONS[q_type], keyword=keyword
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # 필요시 다른 모델로 교체
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.split("\n", 1)[-1] if raw.lower().startswith("json") else raw

    try:
        questions = json.loads(raw)
    except json.JSONDecodeError:
        print(f"[WARN] JSON 파싱 실패 - {q_type}/{keyword}. 원본 응답:\n{raw}")
        return []

    return list(dict.fromkeys(q.strip() for q in questions if q.strip()))


MODEL_SOURCE_LABEL = "gpt-4o-mini"


def save_questions(cur, q_type: str, keyword_id: int, questions: list):
    sql = """
        INSERT INTO question (keyword_id, content, q_type, source, model_source)
        VALUES (%s, %s, %s, 'AI_GENERATED', %s)
    """
    cur.executemany(sql, [(keyword_id, q, q_type, MODEL_SOURCE_LABEL) for q in questions])


def main():
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cur:
            for q_type, keywords in KEYWORD_MAP.items():
                for keyword in keywords:
                    print(f"[INFO] {q_type} / {keyword} 질문 생성 중...")
                    keyword_id = get_or_create_keyword_id(cur, keyword, q_type)
                    questions = generate_questions(q_type, keyword, QUESTIONS_PER_KEYWORD)
                    print(f"  -> {len(questions)}개 생성됨")

                    if questions:
                        save_questions(cur, q_type, keyword_id, questions)
                        conn.commit()

                    time.sleep(1)  # rate limit 여유
    finally:
        conn.close()


if __name__ == "__main__":
    main()
