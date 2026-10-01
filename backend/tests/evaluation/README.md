# ReMind Analysis Evaluation Plan

이 폴더는 논문 성능평가용 테스트 파일만 담는다. 기존 서비스 코드는 수정하지 않는다.

## 안전 조건

- 운영 RDS를 사용하지 않는다.
- `docker-compose.eval.yml`은 로컬 MySQL 컨테이너 `eval-mysql`과 평가용 백엔드 `eval-backend`만 실행한다.
- 평가 스크립트와 정리 스크립트는 `EVAL_DB_HOST`가 `127.0.0.1` 또는 `localhost`가 아니면 즉시 중단한다.
- 평가 스크립트는 실행 전에 `docker compose ... config` 최종 설정을 확인하고, 평가 백엔드 DB가 `eval-mysql`인지 검사한다.
- API Key와 DB 비밀번호는 파일에 하드코딩하지 않고 환경변수로만 주입한다.
- 루트 `compose.yml`은 `backend/.env`를 읽으므로 평가에 사용하지 않는다.

## 현재 구현 기준 요약

논문에는 아래처럼 표현한다.

- 규칙 기반 지표: `word_count`, `sentence_count`, `avg_sentence_length`, `unique_word_ratio`, `repeated_word_count`
- LLM 기반 지표: `positive_score`, `negative_score`
- 사용 모델: `gpt-4o-mini`
- temperature: `0.3`
- LLM 출력: JSON 형식으로 요청한 뒤 `json.loads`와 `int` 변환을 수행하고 서버 코드에서 점수 범위 및 합계를 보정
- 오류 처리: 재요청하지 않고 정서 점수를 0으로 대체
- 의료 제한 안내: 앱 온보딩에서 의료 진단 및 치료 목적이 아닌 기록 보조 도구라고 안내

`repeated_word_count`는 의미상 반복 표현 탐지가 아니라 `전체 단어 수 - 고유 단어 수`로 계산한 규칙 기반 반복 단어 수다.

## 생성 파일

- `remind_eval_dataset.csv`: 가상 회상 답변 30개와 수작업 정답
- `validate_dataset.py`: CSV 정답 컬럼을 서비스 코드 import 없이 재계산해 검토
- `docker-compose.eval.yml`: 로컬 MySQL 및 평가용 FastAPI 실행
- `run_report_eval.py`: 파일럿/전체 평가 실행 스크립트
- `cleanup_eval_data.py`: 평가용 user/question/answer 삭제
- `.env.eval.example`: 필요한 환경변수 이름 예시
- `.gitignore`: 비밀값과 평가 결과 CSV 커밋 방지

## 평가 항목

| 평가 항목 | 계산식 |
|---|---|
| 단어 수 일치율 | `word_count`가 수작업 정답과 일치한 샘플 수 / 전체 샘플 수 * 100 |
| 문장 수 일치율 | `sentence_count`가 수작업 정답과 일치한 샘플 수 / 전체 샘플 수 * 100 |
| 평균 문장 길이 MAE | `abs(expected_avg_sentence_length - actual_avg_sentence_length)`의 평균 |
| 고유 단어 비율 MAE | `abs(expected_unique_word_ratio - actual_unique_word_ratio)`의 평균 |
| 반복 단어 수 일치율 | `repeated_word_count`가 수작업 정답과 일치한 샘플 수 / 전체 샘플 수 * 100 |
| 정서 분류 정확도 | 논문 평가용 후처리 기준으로 분류한 정서와 정답 정서가 일치한 샘플 수 / 전체 샘플 수 * 100 |
| API 응답시간 평균 | 30회 `/answers` 요청 응답시간 평균 |
| API 응답시간 표준편차 | 30회 `/answers` 요청 응답시간의 모집단 표준편차 |
| LLM fallback 의심 횟수 | 현재 API는 파싱 실패 여부를 직접 노출하지 않으므로 `positive_score=0` 및 `negative_score=0`인 성공 응답을 fallback 의심 사례로 별도 집계 |

## 정서 평가 절차

중립 임계값은 임의로 정하지 않는다.

1. 먼저 고정 파일럿 5개만 실행한다: `S03`, `M05`, `L03`, `L08`, `M09`.
2. `pilot_sentiment_scores.csv`에서 `positive_score`, `negative_score` 분포와 차이를 확인한다.
3. `pilot_threshold_candidates.csv`에서 후보 조합별 예측 결과를 확인한다.
4. 그 결과를 근거로 `--sentiment-margin`, `--sentiment-min-score`를 정한다.
5. 이 기준은 서비스 기능이 아니라 논문 평가용 후처리 기준으로만 사용한다.
6. 그 뒤 전체 평가 모드를 실행하면 파일럿 5개는 재호출하지 않고 나머지 25개만 호출한 뒤 30개 결과를 합친다.

## 실행 명령

PowerShell 예시:

```powershell
cd C:\Users\safra\ReMind
Copy-Item backend\tests\evaluation\.env.eval.example backend\tests\evaluation\.env.eval
```

`.env.eval`에 실제 값은 직접 입력하되, Git에 커밋하지 않는다.

```powershell
$env:OPENAI_API_KEY = "직접 입력"
$env:REMIND_EVAL_DB_PASSWORD = "직접 입력"
$env:EVAL_DB_PASSWORD = $env:REMIND_EVAL_DB_PASSWORD
$env:EVAL_DB_HOST = "127.0.0.1"
$env:EVAL_DB_PORT = "3307"
$env:EVAL_DB_USER = "remind_eval"
$env:EVAL_DB_NAME = "remind_eval"
$env:EVAL_API_BASE_URL = "http://localhost:8011"
```

로컬 평가 DB와 평가용 백엔드 실행:

```powershell
docker compose --env-file backend\tests\evaluation\.env.eval -f backend\tests\evaluation\docker-compose.eval.yml config
docker compose --env-file backend\tests\evaluation\.env.eval -f backend\tests\evaluation\docker-compose.eval.yml up -d --build
```

CSV 정답 검토:

```powershell
cd backend
python tests\evaluation\validate_dataset.py
```

파일럿 5개 실행:

```powershell
python tests\evaluation\run_report_eval.py --mode pilot --limit 5
```

파일럿 결과 확인 및 임계값 승인 후 나머지 25개 추가 실행:

```powershell
python tests\evaluation\run_report_eval.py --mode full --sentiment-margin <파일럿 후 결정> --sentiment-min-score <파일럿 후 결정>
```

정리:

```powershell
python tests\evaluation\cleanup_eval_data.py
cd C:\Users\safra\ReMind
docker compose --env-file backend\tests\evaluation\.env.eval -f backend\tests\evaluation\docker-compose.eval.yml down
```
