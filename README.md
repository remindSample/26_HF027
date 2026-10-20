2026 덕성여대 컴퓨터공학전공 캡스톤 프로젝트입니다. 

# ReMind 
# 프로젝트 이름: ReMind
소개: Re:Mind는 스마트 글러브를 이용한 손동작 게임과 일상 회상 기록을 통해 노년층의 꾸준한 인지 활동을 돕는 서비스입니다. 사용자는 자신의 기억을 기록하고, 보호자는 연결된 사용자의 활동 기록과 인지 변화 리포트를 확인할 수 있습니다.

<img width="723" height="517" alt="image" src="https://github.com/user-attachments/assets/b86abc28-aad1-41c9-a42d-ee27d0e3a07c" />


## 팀 소개
참여자: 이하늘, 한원희, 박수정

저희는 하드웨어와 소프트웨어를 연결해 노년층과 보호자가 함께 사용할 수 있는 서비스를 만드는 팀입니다. 스마트 글러브 제작부터 모바일 앱, 백엔드, 데이터 분석까지 각 분야를 나누어 개발하며, 노년층이 일상에서 쉽게 참여하고 보호자가 함께 관심을 이어갈 수 있는 경험을 목표로 합니다.

## 프로젝트 개요

### 제작 배경
2025년, 대한민국은 65세 이상이 전체 인구의 20.3%를 넘어 초고령사회에 들어섰습니다. 이에 따라 자연스레 기억과 인지 기능을 지키려는 수요가 빠르게 커지고 있습니다. 
노년층이 인지 활동을 꾸준히 이어가려면 접근하기 쉬운 방식과 지속적인 참여 동기가 필요합니다. 보호자 역시 사용자의 일상과 활동 변화를 함께 살펴볼 수 있는 수단이 필요합니다.
이에, Re:Mind는 손을 움직이는 게임과 과거의 경험을 떠올리는 회상 질문을 하나의 앱으로 연결하고, 활동 기록을 보호자와 공유할 수 있도록 기획했습니다.

### 프로젝트 목표

- 스마트 글러브 기반 손동작 게임으로 흥미롭게 참여할 수 있는 인지 활동 제공
- 회상 질문과 답변을 통해 개인의 경험과 기억을 기록
- 누적된 기록을 바탕으로 활동 현황과 언어 사용 지표의 변화를 제공
- 사용자와 보호자를 연결해 지속적인 관심과 소통 지원

### 대상 사용자

- 손동작 게임과 회상 기록을 통해 꾸준한 인지 활동에 참여하려는 노년층
- 사용자의 답변과 활동 현황을 함께 확인하려는 가족 및 보호자

## 주요 기능

### 1. 스마트 글러브 기반 손동작 게임

- 플렉스 센서로 손가락의 굽힘을 측정하고 BLE로 앱과 연결
- 화면에 제시되는 주먹·보자기·가위 동작을 양손으로 따라 하는 게임 제공
- 난이도에 따른 게임 진행과 점수·정확도·연속 성공 기록 확인
- 게임 수행 기록을 저장해 활동 리포트에 활용

### 2. 회상 질문과 답변 기록

- 개인의 경험과 일상을 떠올릴 수 있는 질문 제공
- 사용자가 작성한 답변을 날짜별로 저장
- 보호자가 새로운 질문을 추가할 수 있는 질문 관리 기능 제공

### 3. 기억 앨범

- 누적된 질문과 답변을 목록·월간 달력·주간 화면으로 조회
- 기록을 펼쳐 당시의 질문과 답변 내용 확인
- 홈 화면에서 최근 답변을 빠르게 확인

### 4. 활동 및 인지 변화 리포트

- 답변 기록과 게임 수행 결과를 바탕으로 활동 현황 제공
- 답변의 단어 수, 어휘 다양성 등 언어 사용 지표 확인
- 월별 지표와 이전 기간 비교를 통해 기록상의 변화 확인

### 5. 사용자·보호자 계정 연결

- 사용자와 보호자에게 구분된 홈·설정 화면 제공
- 초대코드 입력과 사용자 수락을 통한 1:1 계정 연결
- 보호자가 연결된 사용자의 기억 앨범과 리포트 조회
- 최근 답변일과 오늘의 답변 현황 확인

> Re:Mind의 리포트는 활동 기록을 살펴보기 위한 참고 정보이며, 의료적 진단이나 인지 기능 개선 효과를 보장하지 않습니다.

## 전체 시스템 구조도

1. SW 구성도
<img width="726" height="522" alt="image" src="https://github.com/user-attachments/assets/dfe9f5ec-e9a7-45dd-afdf-bdc7c2587b7e" />

2. HW 구성도
<img width="666" height="336" alt="image" src="https://github.com/user-attachments/assets/6b162ea0-52b0-48b0-bd11-07d611657a30" />

## 서비스 흐름도
<img width="653" height="467" alt="image" src="https://github.com/user-attachments/assets/37f467a5-ecee-483a-99f7-262ab297b725" />


## 프로젝트 공모전 영상
https://youtu.be/Q2yzImwrLnc?si=OfbfO3b3bYGZggcH

## 실제 구현 화면 
1. 메인 홈화면 (사용자)
<img width="1056" height="702" alt="image" src="https://github.com/user-attachments/assets/51134989-f6e4-4ce0-b8d3-98e45fdc2ef3" />

2. 인지변화보고서
<img width="1056" height="692" alt="image" src="https://github.com/user-attachments/assets/7b402b14-067b-4c6c-a094-991c07bf029a" />

3. 오늘의 질문
<img width="1056" height="683" alt="image" src="https://github.com/user-attachments/assets/c3c12637-62bc-4d65-b94c-f582194336ff" />

4. 기억 앨범
<img width="1137" height="595" alt="image" src="https://github.com/user-attachments/assets/46be8091-7f32-435c-927e-11f4125897d9" />

5. 보호자 화면
<img width="1107" height="622" alt="image" src="https://github.com/user-attachments/assets/7bb694de-8c5a-47ce-af9d-1d6d5976ce1c" />


6. 인지훈련 게임
<img width="1101" height="585" alt="image" src="https://github.com/user-attachments/assets/7c275aaf-8757-4ba1-b4fd-df091743e1b0" />

7. HW (스마트 글로브 화면)
<img width="1085" height="513" alt="image" src="https://github.com/user-attachments/assets/17ce26fc-f7a4-4856-b62f-bc1605b6fde4" />
