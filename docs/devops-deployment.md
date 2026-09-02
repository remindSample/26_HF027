# ReMind DevOps 1단계 적용 가이드

## 목표

ReMind 백엔드에 DevOps를 한 번에 크게 붙이지 않고, FastAPI 백엔드부터 Docker와 GitHub Actions CI를 적용한다.

이번 1단계 범위는 다음과 같다.

```text
FastAPI 백엔드 Docker 이미지 생성
Docker build 검증
GitHub Actions CI 추가
현재 EC2/RDS 배포 구조 문서화
```

아직 자동 배포, Kubernetes, EKS, Terraform은 적용하지 않는다.

## 현재 구조

```text
Expo React Native 앱
→ FastAPI 백엔드
→ AWS RDS MySQL
```

백엔드는 `backend/app/main.py`에서 FastAPI 앱을 생성한다.

```text
backend/app/main.py
```

DB 연결은 `backend/app/database.py`에서 환경변수로 구성한다.

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

프론트엔드는 `frontend/lib/api.ts`에서 `EXPO_PUBLIC_API_URL`을 읽어 FastAPI 서버로 요청한다.

## Docker 적용 방식

Docker 적용 대상은 FastAPI 백엔드다. RDS는 AWS 관리형 DB이므로 Docker로 띄우지 않는다.

추가된 파일:

```text
backend/Dockerfile
backend/.dockerignore
```

백엔드 Docker 이미지는 다음 방식으로 실행된다.

```text
python:3.12-slim
→ requirements.txt 설치
→ app 디렉터리 복사
→ uvicorn app.main:app 실행
```

로컬 검증 명령:

```bash
cd backend
docker build -t remind-backend .
docker run --env-file .env -p 8000:8000 remind-backend
```

다른 터미널에서 헬스체크:

```bash
curl http://localhost:8000/health
```

정상 응답:

```json
{"status":"healthy"}
```

## GitHub Actions CI

추가된 파일:

```text
.github/workflows/backend-ci.yml
```

CI는 다음 상황에서 실행된다.

```text
feature/haneul 브랜치에 backend 변경 push
develop 브랜치에 backend 변경 push
develop 대상 PR에서 backend 변경 발생
```

CI에서 확인하는 내용:

```text
Python 3.12 설치
backend/requirements.txt 의존성 설치
FastAPI 앱 import 확인
Docker image build 확인
```

아직 EC2에 자동 배포하지 않는다. 이 단계는 기존 서비스에 영향을 주지 않고, 코드가 최소한 빌드 가능한지 확인하는 안전장치다.

## AWS EC2 배포 확장 방향

1단계가 안정화되면 다음 단계에서 EC2 자동 배포를 추가한다.

추천 구조:

```text
GitHub push to develop
→ GitHub Actions
→ Docker image build
→ GHCR 또는 Docker Hub push
→ EC2 SSH 접속
→ docker pull
→ FastAPI 컨테이너 재시작
→ /health 확인
```

처음에는 무중단 배포를 적용하지 않는다. 컨테이너 재시작 중 짧은 다운타임을 감수하고, 구조를 단순하게 유지한다.

## 환경변수와 Secret 관리

로컬 개발:

```text
backend/.env
```

EC2 운영:

```text
/home/ubuntu/remind/.env
```

GitHub Actions:

```text
GitHub Repository Secrets
```

운영 Secret 후보:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
SECRET_KEY
OPENAI_API_KEY
```

주의사항:

```text
.env는 GitHub에 올리지 않는다.
Docker image 안에 .env를 복사하지 않는다.
EXPO_PUBLIC_으로 시작하는 값에는 비밀값을 넣지 않는다.
```

현재 `.dockerignore`는 `.env`와 `.env.*`를 제외하므로, Docker image에 민감정보가 들어가는 실수를 줄인다.

## CloudWatch 적용 방향

초기에는 EC2 기본 지표부터 확인한다.

```text
CPU 사용률
Network In/Out
Status Check
```

다음 단계에서 CloudWatch Logs를 붙일 수 있다.

단순한 방법:

```text
Docker awslogs logging driver 사용
```

또는:

```text
CloudWatch Agent 설치
Docker 로그 파일 수집
```

추천 알람:

```text
EC2 CPU 80% 이상
EC2 Status Check Failed
디스크 사용량 80% 이상
FastAPI /health 실패
```

로그 보존 기간은 비용 방지를 위해 14일 또는 30일로 설정한다.

## 기존 서비스 영향

이번 1단계 변경은 새 파일 추가 중심이다.

```text
Dockerfile 추가
.dockerignore 추가
GitHub Actions CI 추가
문서 추가
```

EC2에서 실행 중인 기존 FastAPI 프로세스는 건드리지 않는다. 따라서 1단계 자체는 운영 서비스에 직접 영향을 주지 않는다.

## 다음 단계

1단계 이후 추천 순서:

```text
1. EC2에 Docker 설치
2. EC2에서 backend Docker image 수동 실행
3. RDS 연결 확인
4. GitHub Actions CD workflow 추가
5. EC2 deploy script 추가
6. CloudWatch Logs 연결
7. Nginx와 HTTPS 적용
8. S3 이미지 저장 기능 추가
9. Lambda 이미지 후처리 또는 통계 배치 추가
```

## 주의할 위험요소

```text
RDS 보안그룹이 EC2에서만 접근 가능해야 한다.
SECRET_KEY 기본값을 운영에서 그대로 쓰면 안 된다.
OPENAI_API_KEY는 GitHub에 커밋하면 안 된다.
CORS 제한은 프론트 배포 주소가 확정된 뒤 적용한다.
자동 배포 전에는 EC2 수동 Docker 실행을 먼저 검증한다.
```
