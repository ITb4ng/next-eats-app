# 우아한맛집들

지도 기반으로 맛집을 탐색하고, 직접 등록하고, 좋아요와 댓글로 기록을 남길 수 있는 풀스택 웹 서비스입니다.  
단순 CRUD를 넘어서 `지도 탐색`, `개인화`, `상태 관리`, `인증`, `DB 연동`을 하나의 사용자 흐름으로 연결하는 데 집중했습니다.

## 프로젝트 한눈에 보기

- **프로젝트 기간**: 2024.12 ~ 2025.05
- **유지보수**: 2026.04 프리뷰 배포 안정화 및 보안 패치 반영
- **형태**: 개인 프로젝트
- **핵심 개발 집중 구간**: 2025.03 ~ 2025.05
- **목표**: 사용자가 위치 기반으로 맛집을 찾고, 저장하고, 직접 데이터를 확장할 수 있는 서비스를 구현
- **강점 키워드**: 지도 UI, OAuth 인증, Prisma 모델링, 무한 스크롤, Zustand 리팩터링, 사용자 경험 개선

## 현재 상태

- `main` 브랜치는 기능 개발 이후 안정화와 문서 정리를 거쳐 배포한 기준 브랜치입니다.
- 핵심 사용자 흐름인 `지도 탐색`, `검색 / 필터`, `맛집 상세`, `등록`, `좋아요`, `댓글`, `로그인`은 실제 동작 기준으로 연결되어 있습니다.
- 이후 별도 브랜치에서 `무한 스크롤 최적화`, `배포 안정화`, `보안 패치`, `프리뷰 환경 지도 이슈 수정`을 추가로 진행했습니다.
- 따라서 이 저장소는 단순 프로토타입보다 `작동 가능한 서비스 버전`에 가까우며, 이후 개선을 위한 기준선이 이미 마련된 상태입니다.

## 왜 이 프로젝트를 만들었는가

기존 맛집 서비스는 검색 결과가 리스트 중심으로 보이거나, 지도를 보더라도 개인화 기능이 약한 경우가 많았습니다.  
이 프로젝트에서는 사용자가 `지도로 빠르게 탐색`하고, `관심 맛집을 저장`하고, `후기와 댓글을 남기고`, `직접 장소를 등록`할 수 있도록 흐름을 설계했습니다.

## 주요 기능

### 1. 지도 기반 맛집 탐색
- Kakao Map 위에 맛집 마커를 표시
- 마커 클릭 시 오버레이와 상세 정보 확인
- 현재 위치 기반으로 지도 이동

### 2. 검색 + 지역 필터 + 무한 스크롤
- 키워드 검색과 지역 필터를 함께 적용
- `React Query`와 `Intersection Observer`를 활용해 무한 스크롤 구현
- URL 쿼리와 전역 상태를 연결해 뒤로가기와 새로고침 이후에도 검색 조건 복원

### 3. OAuth 로그인 기반 개인화
- `NextAuth`와 `Prisma Adapter`로 인증 구성
- Kakao, Google, Naver 로그인 지원
- 로그인 사용자 기준으로 좋아요, 댓글, 마이페이지 기능 분기 처리

### 4. 맛집 등록 / 수정 / 삭제
- `React Hook Form` 기반 폼 검증
- 주소 입력 후 Kakao Local API로 좌표를 변환해 저장
- 등록한 데이터가 지도와 리스트에 자연스럽게 반영되도록 API 흐름 구성

### 5. 좋아요 / 댓글 / 마이페이지
- 사용자별 좋아요 토글 및 좋아요 목록 조회
- 맛집 상세 페이지 댓글 작성과 삭제
- 마이페이지에서 작성한 댓글을 페이지네이션으로 관리

## 기술 스택

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### State / Data
![Zustand](https://img.shields.io/badge/Zustand-4A3F35?style=for-the-badge)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Form / Auth
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth-111111?style=for-the-badge)
![Kakao](https://img.shields.io/badge/Kakao_Login-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000000)
![Google](https://img.shields.io/badge/Google_Login-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Naver](https://img.shields.io/badge/Naver_Login-03C75A?style=for-the-badge&logo=naver&logoColor=white)

### Backend / Database
![Next.js API Routes](https://img.shields.io/badge/Next.js_API_Routes-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### External API / Deploy
![Kakao Map](https://img.shields.io/badge/Kakao_Map_API-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000000)
![Kakao Local API](https://img.shields.io/badge/Kakao_Local_API-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000000)
![Daum Postcode](https://img.shields.io/badge/Daum_Postcode-0052CC?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 이 프로젝트에서 보여주고 싶은 역량

### 사용자 경험을 고려한 프론트엔드 구현
- 모바일 네비게이션, 로딩 상태, 포커스 처리, 에러 페이지 등 실제 사용 흐름을 세심하게 다듬었습니다.
- 검색 필터 값이 사라지지 않도록 상태와 라우팅을 함께 설계했습니다.

### 단순 UI를 넘어선 풀스택 연결 경험
- 인증, 데이터베이스 모델링, API 설계, 프론트 상태 갱신까지 직접 연결했습니다.
- `User - Store - Like - Comment` 관계를 Prisma 스키마로 구성하고 기능 단위 API로 분리했습니다.

### 기술 선택과 리팩터링 근거를 설명할 수 있는 개발 경험
- Recoil 사용 중 호환성 이슈를 겪은 뒤 Zustand로 상태 관리를 전환했습니다.
- 단순 기능 추가보다 왜 바꿨는지와 바꾼 뒤 무엇이 안정화됐는지 설명할 수 있는 프로젝트입니다.

## 트러블슈팅 / 개선 경험

### 1. Recoil에서 Zustand로 상태 관리 전환
- Next 15 / React 19 환경에서 Recoil 유지 비용과 호환성 부담을 줄이기 위해 Zustand로 전환했습니다.
- 검색 상태와 지도 상태를 분리해 더 단순한 구조로 재정비했습니다.

### 2. 무한 스크롤 안정화
- 스크롤 끝 감지 시 중복 호출이 발생하지 않도록 `Intersection Observer`와 `fetchNextPage` 호출 타이밍을 조정했습니다.
- 검색 조건이 바뀔 때도 자연스럽게 새 목록을 받아오도록 쿼리 키를 구성했습니다.

### 3. Hook 순서 오류와 로딩 상태 정리
- `Rendered more hooks than during the previous render` 문제를 수정하며 조건부 렌더링 구조를 점검했습니다.
- `status === "loading"` 처리와 로더 분기를 보완해 잘못된 초기 렌더를 줄였습니다.

### 4. 모바일 UI 및 접근성 개선
- 모바일 메뉴 동작, 포커스 스타일, 버튼 상호작용을 개선했습니다.
- 시각적인 정리뿐 아니라 키보드 포커스 흐름까지 고려해 사용성을 높였습니다.

## 주요 폴더 구조

```bash
src
├─ components      # 지도, 마커, 댓글, 검색 필터, 네비게이션 등 공통 UI
├─ pages           # 페이지 및 API Routes
├─ data            # 카테고리 / 지역 등 정적 데이터
├─ db              # Prisma Client 연결
├─ hooks           # Intersection Observer 커스텀 훅
├─ interface       # 공통 타입 정의
└─ zustand         # 검색 / 지도 / 선택 상태 관리

prisma
├─ schema.prisma   # User, Store, Like, Comment 모델
└─ migrations      # DB 마이그레이션 이력
```

## 실행 방법

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local`에 아래 값을 설정합니다.

```bash
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_MAP_CLIENT_ID=
```

### 3. Prisma 반영

```bash
npx prisma migrate deploy
npx prisma generate
```

개발 환경에서 빠르게 스키마를 맞출 때는 아래 방식도 사용할 수 있습니다.

```bash
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 데이터 모델

### User
- 소셜 로그인 사용자 정보 관리
- 좋아요 / 댓글과 연결

### Store
- 맛집 기본 정보, 주소, 좌표, 카테고리 저장
- 좋아요 / 댓글과 연결

### Like
- 사용자별 관심 맛집 저장

### Comment
- 사용자별 리뷰 / 댓글 기록

## 주요 개선 이력

- Kakao Map 기반 메인 지도와 마커 인터랙션 구현
- 검색 / 지역 상태를 전역 관리하도록 구조 개선
- 맛집 등록 폼과 주소 검색 연동 구현
- 좋아요 기능 및 찜 목록 페이지 추가
- 댓글 작성 / 조회 / 삭제 기능 추가
- 모바일 네비게이션 UI 및 접근성 개선
- 무한 스크롤 동작 안정화 및 최적화
- 배포 이슈 수정과 Prisma 관련 오류 대응

## 작업 진행 방식

### 1. 탐색 경험을 먼저 완성
- 프로젝트 초반에는 Kakao Map 연동, 데이터 추출, 상세보기 UI처럼 서비스의 중심 경험이 되는 화면을 먼저 구현했습니다.
- 이 단계에서는 “맛집 정보를 지도 위에서 탐색한다”는 핵심 가치를 빠르게 검증하는 데 집중했습니다.

### 2. 기능 확장보다 흐름 연결을 우선
- 이후 검색, 정렬, 등록 폼, CRUD, 좋아요, 댓글, 마이페이지를 순차적으로 붙이며 사용자의 전체 흐름을 완성했습니다.
- 각 기능을 개별적으로 추가하기보다 `탐색 -> 상세 확인 -> 저장 -> 기록`의 흐름이 끊기지 않도록 연결성을 우선했습니다.

### 3. 상태 관리와 구조를 중간에 재정비
- 기능이 늘어난 시점에 Recoil에서 Zustand로 전환하고, 검색 상태와 지도 상태를 다시 정리했습니다.
- 단기적으로는 수정 비용이 들었지만, 이후 검색 필터 복원과 뒤로가기 이슈를 줄이는 데 효과가 있었습니다.

### 4. 배포 가능한 상태까지 안정화
- 개발 막바지에는 새 기능 추가보다 Lint, 빌드, Prisma, 정적 파일, 배포 환경 문제를 우선 정리했습니다.
- 메인 브랜치는 이 안정화 과정을 거쳐 배포 가능한 기준선으로 정리했고, 이후 브랜치에서는 무한 스크롤 최적화와 프리뷰 배포 안정화 작업을 이어갔습니다.

## 추후 전략

### 1. 데이터 신뢰도와 운영성 강화
- 현재는 사용자가 직접 등록한 데이터를 중심으로 동작하므로, 중복 데이터 검증과 품질 관리 로직을 보강할 필요가 있습니다.
- 운영 관점에서는 관리자 검수, 신고, 수정 요청 같은 관리 기능이 다음 단계 과제입니다.

### 2. 검색 경험 고도화
- 현재 검색은 키워드와 지역 필터 중심이므로, 카테고리 조합 검색과 정렬 기준 확장이 가능해 보입니다.
- 지도와 리스트 간 선택 상태를 더 정교하게 연결하면 탐색 효율도 높일 수 있습니다.

### 3. 사용자 활동 기록 강화
- 좋아요와 댓글은 구현되어 있으므로, 이후에는 최근 본 맛집, 개인 컬렉션, 활동 요약 같은 개인화 기능으로 확장할 수 있습니다.
- 이 방향은 단발성 조회 서비스보다 재방문성을 높이는 데 유리합니다.

### 4. 배포 안정성과 유지보수 체계 보강
- 배포 과정에서 확인된 이슈들을 기준으로 환경 변수 검증, 빌드 체크, 마이그레이션 흐름을 더 자동화할 수 있습니다.
- 장기적으로는 테스트 코드와 배포 체크리스트를 보강해 유지보수 비용을 낮추는 방향이 적절합니다.

## 회고

이 프로젝트는 화면만 만드는 데 그치지 않고, 실제 사용 흐름을 갖춘 서비스를 끝까지 연결해본 경험에 가깝습니다.  
특히 상태 관리 전환, 인증과 DB 연동, 지도 기반 UI, 무한 스크롤, 개인화 기능을 직접 설계하고 수정하면서 프론트엔드 개발자가 서비스 전체를 어떻게 바라봐야 하는지 많이 배웠습니다.

채용 관점에서는 아래 역량을 함께 보여줄 수 있다고 생각합니다.

- 사용자 경험을 고려해 기능을 설계하고 UI를 개선하는 능력
- 프론트엔드와 백엔드 경계를 넘나들며 문제를 해결하는 능력
- 기술 선택 이유와 리팩터링 배경을 설명할 수 있는 개발 태도
