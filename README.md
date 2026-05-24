# 우아한맛집들

위치 기반 맛집 탐색, 사용자 등록, 좋아요, 댓글을 하나의 흐름으로 연결한 풀스택 웹 서비스입니다.

- Production: https://next-eats-app.vercel.app
- Repository: https://github.com/ITb4ng/next-eats-app
- Latest release: `v1.1.0`
- Stack: Next.js Pages Router, React, TypeScript, Prisma, PostgreSQL, NextAuth, Kakao Map SDK, Tailwind CSS

## 프로젝트 요약

우아한맛집들은 사용자가 지도와 목록을 오가며 맛집을 탐색하고, 직접 맛집을 등록하며, 좋아요와 댓글로 개인화된 기록을 남길 수 있도록 만든 서비스입니다.

단순 CRUD 구현보다 실제 배포 후 발견되는 문제를 다루는 데 초점을 두었습니다. `v1.0.0`에서는 핵심 서비스 흐름을 완성했고, `v1.1.0`에서는 로딩 안정화, 지도 실패 대응, Store 목록 탐색 강화, 의존성 보안 업데이트, 릴리즈 문서화를 진행했습니다.

## 주요 기능

- Kakao Map 기반 맛집 마커 표시
- 현재 위치 기반 지도 이동
- 맛집 검색, 지역 필터, 무한 스크롤 목록
- 전국 시/도 단위 Store 필터
- 지원금 사용 가능 매장 필터와 배지
- Kakao, Google, Naver OAuth 로그인
- 데모 계정 로그인
- 맛집 등록/수정
- 좋아요, 댓글, 마이페이지
- 지도 실패 시 Store 목록으로 이어지는 fallback UX

## v1.0.0 -> v1.1.0 개선 요약

| 구분 | v1.0.0 | v1.1.0 |
|---|---|---|
| 릴리즈 성격 | 핵심 기능 첫 배포 | 운영 안정화 및 탐색 경험 개선 |
| 탐색 흐름 | 지도 중심 탐색 | 지도 실패 시 목록 탐색으로 연결 |
| Store 목록 | 검색/지역 필터 중심 | 전국 지역 필터 + 지원금 필터 추가 |
| 지원금 정보 | 없음 | `acceptsPaySupport` 필드, 배지, 상세 안내 추가 |
| UI 상태 | 기본 로딩/빈 상태 중심 | 로딩, 빈 결과, 에러, 모바일 상태 정리 |
| 성능/SEO | 초기 개선 필요 | Production 기준 Lighthouse 개선 확인 |
| 보안/의존성 | Dependabot 알림 확인 | Next 15 계열 보안 패치 및 audit 정리 |
| 문서화 | 릴리즈 기준선 정리 | 릴리즈 체크리스트, readiness, 운영 로드맵 정리 |

## 성능 개선

`v1.1.0`에서는 초기 로딩과 SEO를 주요 개선 대상으로 잡고 Production 기준 Lighthouse 측정을 기록했습니다.

| 항목 | v1.0.0 / 초기 기준 | v1.1.0 Production | 변화 |
|---|---:|---:|---:|
| Desktop Performance | 78.66 | 96 | +17.34 |
| SEO | 54 | 100 | +46 |
| LCP | 약 2.1s | 약 1.4s | 약 -0.7s |
| Accessibility | 93 | 93 | 유지 |
| Best Practices | 96 | 96 | 유지 |

측정값은 Lighthouse 수동 측정 기준이며, 네트워크와 외부 API 상태에 따라 달라질 수 있습니다. 그래서 `v1.2.x`에서는 반복 가능한 성능 측정과 운영 자동화를 후속 과제로 분리했습니다.

자세한 기록:

- [v1.0.0 대비 Production 로딩 성능 비교](./docs/performance/2026-05-19-v1-loading-comparison.md)
- [v1.1.0 LCP 원인 후보 분석](./docs/performance/2026-05-19-v1.1.0-lcp-analysis.md)

## 기술적 의사결정

### Pages Router 유지

현재 프로젝트는 `src/pages` 기반의 Pages Router 구조를 유지합니다.

- NextAuth v4와 Pages API Routes 조합이 단순합니다.
- Kakao Map SDK와 Daum Postcode는 클라이언트 의존도가 높아 Pages Router 구조와 잘 맞습니다.
- `v1.1.0` 목표는 App Router 전환보다 안정화와 릴리즈 품질 개선입니다.
- App Router 전환은 데이터 흐름과 등록 UX를 함께 재설계할 `v2.0.0` 후보로 분리했습니다.

문서:

- [Pages Router 적합성 및 운영 자동화 로드맵](./docs/architecture/page-router-assessment.md)

### 운영 안정화

`v1.1.0`에서는 Next.js를 16으로 올리지 않고 Pages Router 안정성을 우선해 Next.js 15 계열 안정 패치 버전으로 업데이트했습니다.

- Next.js `15.5.18`
- React `19.2.6`
- Prisma `7.8.0`
- 운영 의존성 audit 0건 확인
- Supabase 유휴 상태와 Dependabot 알림 대응은 `v1.2.x` 운영 자동화 과제로 문서화

문서:

- [v1.1.0 의존성 업데이트 기록](./docs/release/v1.1.0-dependency-update.md)
- [v1.1.0 릴리즈 준비 문서](./docs/release/v1.1.0-release-readiness.md)

## 프로젝트 구조

```txt
.
├─ docs/                  # 릴리즈, 성능, 보안, 작업 로그 문서
├─ prisma/                # Prisma schema, migrations, seed, fixture
├─ public/                # favicon, marker image, font 등 정적 리소스
├─ scripts/               # 성능 점검, fixture seed, 로컬 점검 스크립트
├─ src/
│  ├─ components/         # 공통 UI와 Store 관련 컴포넌트
│  ├─ data/               # 지역/Store 정적 데이터
│  ├─ db/                 # Prisma client 연결
│  ├─ hooks/              # 지도 SDK, intersection observer 등 hooks
│  ├─ lib/                # debug, fallback, formatting helper
│  ├─ pages/              # Pages Router 화면과 API routes
│  ├─ styles/             # 전역 스타일
│  ├─ types/              # 외부 SDK 타입 선언
│  └─ zustand/            # 전역 UI/query 상태
├─ next.config.ts
├─ package.json
└─ yarn.lock
```

## 실행 방법

```bash
yarn install
npm run dev
```

PowerShell 실행 정책으로 `yarn.ps1` 실행이 막히는 환경에서는 package script를 `npm run ...`으로 실행합니다.

## 검증

```bash
npm run lint
npm run build
yarn audit --groups dependencies
```

`v1.1.0` 릴리즈 후보 기준 검증 결과:

- lint 통과
- build 통과
- 운영 의존성 audit 0건
- 로컬 브라우저에서 `/`, `/stores` 확인

## 릴리즈 히스토리

### v1.1.0

Store 탐색 안정화와 운영 품질 개선 릴리즈입니다.

- 지도 실패와 Store API/DB 실패 상태 분리
- 지도 실패 시 `/stores` 이동 fallback 흐름 정리
- Store 지원금 사용 가능 여부 필드 추가
- 전국 시/도 지역 필터 확장
- 지원금 필터와 배지 추가
- Store 목록, 상세, 등록/수정, 찜, 댓글 UI 상태 정리
- Next.js 15 계열 보안 패치와 주요 의존성 업데이트
- 릴리즈 체크리스트와 운영 자동화 로드맵 문서화

### v1.0.0

첫 정식 릴리즈입니다.

- Kakao Map 기반 맛집 탐색
- 맛집 등록/수정
- 검색, 지역 필터, 무한 스크롤
- OAuth 로그인
- 데모 계정
- 좋아요, 댓글, 마이페이지

## 후속 개선

`v1.2.x`에서는 운영 자동화에 집중합니다.

- Dependabot/보안 알림 대응 자동화
- 현재 구조를 유지하는 patch/minor 업데이트 점검 스크립트
- Supabase 유휴 상태 wake-up workflow
- 릴리즈 smoke test 자동화
- ESLint CLI 전환
- 반복 가능한 성능 측정 기준 정리

`v2.0.0`에서는 구조 개선을 검토합니다.

- App Router 전환 여부 재검토
- `@tanstack/react-query` 전환 검토
- 지도 중심 구조와 목록 중심 구조의 역할 재설계
- 맛집 등록 플로우 전면 개선

