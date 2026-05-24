# Pages Router 적합성 및 운영 자동화 로드맵

작성일: 2026-05-25

기준 브랜치: `release/v1.1.0`

## 결론

현재 프로젝트는 v1.1.0 기준으로 Pages Router 유지가 적합하다.

Next.js 문서에서 Pages Router는 여전히 지원되는 라우터이며, 현재 프로젝트의 화면/API 구조, 인증 방식, 클라이언트 지도 SDK 연동 방식은 Pages Router와 잘 맞는다. v1.1.0 릴리즈의 목적은 구조 전환이 아니라 안정화와 릴리즈 준비이므로 App Router 전환은 이번 범위에서 제외한다.

v1.2.x에서는 구조 전환보다 운영 자동화 역량을 키우는 방향이 적합하다. 특히 시간이 지나 Dependabot, GitHub 보안 알림, Supabase 유휴 상태 문제가 다시 발생했을 때 프로젝트 구조를 유지하면서 안전하게 점검하고 복구할 수 있는 자동화 체계를 만든다.

## 현재 구조

- 화면 라우트: `src/pages`
- API routes: `src/pages/api`
- 전역 앱 설정: `src/pages/_app.tsx`
- 문서 HTML 설정: `src/pages/_document.tsx`
- 인증: `src/pages/api/auth/[...nextauth].ts`
- 클라이언트 상태: `react-query`, `zustand`
- 지도 연동: Kakao Map SDK 클라이언트 로딩
- 데이터베이스: Supabase PostgreSQL, Prisma 7, `@prisma/adapter-pg`

## Pages Router가 적합한 이유

- `NextAuth v4`와 Pages API routes 조합이 단순하게 유지된다.
- Kakao Map SDK, Daum Postcode, 지도 marker 렌더링은 클라이언트 의존도가 높아 서버 컴포넌트 전환 이점이 작다.
- `/stores`, 상세, 등록, 수정, 찜, 댓글 흐름이 이미 Pages Router 기준으로 안정화되어 있다.
- v1.1.0 릴리즈에서는 의존성 보안 패치, README, 릴리즈 문서, 수동 검증 흐름이 더 중요하다.
- App Router 전환은 데이터 fetch/cache 전략과 layout 구조를 같이 재설계해야 하므로 별도 major 작업으로 보는 것이 적절하다.

## 현재 부족한 부분

- `next lint`는 Next 16에서 제거될 예정이므로, v1.2 이후 ESLint CLI 전환이 필요하다.
- `react-query v3`는 React 19 peer dependency 경고가 남는다. 동작과 build는 통과했지만, 장기적으로 `@tanstack/react-query` 전환이 필요하다.
- Pages Router 유지 중에도 page 단위 data fetching, error state, loading state 기준을 문서화하면 회귀 방지에 도움이 된다.
- 지도 성공/실패 상태와 Store API 실패 상태를 자동화 테스트로 고정할 필요가 있다.
- Supabase Free 프로젝트가 유휴 상태로 pause될 경우 개발/검증 흐름이 끊길 수 있으므로, 주기적인 wake-up과 실패 알림 기준이 필요하다.
- Dependabot 알림을 받을 때마다 수동으로 최신 버전과 major 변경 여부를 판단하고 있어, 반복 가능한 점검 스크립트가 필요하다.

## v1.2.x 운영 자동화 목표

v1.2.x의 목표는 기능 추가가 아니라 운영 관점의 반복 작업을 자동화하는 것이다.

- 현재 프로젝트의 Pages Router 구조를 유지한다.
- Next.js는 15 계열 안정 패치 범위에서 우선 관리한다.
- Dependabot 또는 보안 알림이 발생했을 때 현재 버전, 패치 가능 버전, major 변경 여부를 자동으로 점검한다.
- major migration이 필요한 항목은 자동 적용하지 않고 별도 문서/이슈로 분리한다.
- 자동 업데이트 후보 적용 후 lint, build, audit, smoke test를 실행한다.
- Supabase 유휴 상태를 줄이기 위해 주기적으로 헬스 체크 API를 호출한다.
- Supabase wake-up 실패, DB 연결 실패, API 실패를 운영 로그로 남기고 알림 대상으로 분리한다.

## v1.2.x 자동화 후보

### 1. 의존성 보안 점검 자동화

후보 파일:

- `scripts/check-dependency-health.mjs`
- `docs/ops/dependency-update-policy.md`
- `.github/dependabot.yml`
- `.github/workflows/dependency-health.yml`

점검 기준:

- `package.json`과 lockfile 기준 현재 설치 버전 확인
- `yarn outdated` 결과를 direct dependency 중심으로 요약
- `yarn audit --groups dependencies` 결과 확인
- patch/minor 후보와 major 후보 분리
- Next.js는 v1.x 운영 정책에 따라 15 계열을 우선 유지
- major 업데이트가 필요한 경우 자동 적용하지 않고 수동 검토 대상으로 기록

자동 검증:

- `npm run lint`
- `npm run build`
- `yarn audit --groups dependencies`
- `/`, `/stores`, `/api/stores` smoke check

운영 관점 기대 효과:

- Dependabot 알림이 왔을 때 어떤 패키지를 어디까지 올릴 수 있는지 빠르게 판단할 수 있다.
- 구조를 깨는 major 업데이트와 보안 패치 업데이트를 분리할 수 있다.
- 보안 업데이트 후 최소 검증 루틴을 매번 동일하게 수행할 수 있다.

### 2. Supabase wake-up 자동화

후보 파일:

- `scripts/supabase-wakeup.mjs`
- `.github/workflows/supabase-wakeup.yml`
- `docs/ops/supabase-runtime-policy.md`

동작 방식:

- GitHub Actions `schedule`로 하루 1~2회 실행한다.
- 프로젝트의 공개 헬스 체크 엔드포인트를 호출한다.
- 1차 후보는 `/api/ping`, 2차 후보는 `/api/stores?take=1` 같은 읽기 전용 API다.
- DB 연결이 필요한 wake-up은 쓰기 작업 없이 최소 read query만 수행한다.
- 응답 상태, 응답 시간, 실패 메시지를 로그로 남긴다.
- 연속 실패 시 GitHub Actions 실패 상태로 남겨 알림을 받는다.

주의:

- Supabase pause 정책과 Free 프로젝트 restore 정책은 시간이 지나며 달라질 수 있으므로 공식 문서를 주기적으로 확인한다.
- wake-up 자동화는 운영 편의 장치이지 데이터 백업을 대체하지 않는다.
- 데이터가 중요한 단계로 넘어가면 Supabase 백업/복구 정책 또는 유료 플랜 전환을 별도로 검토한다.
- GitHub Actions scheduled workflow는 UTC 기준 cron으로 실행되며, 실행 시점이 지연될 수 있으므로 정확한 모니터링 시스템처럼 의존하지 않는다.

### 3. 릴리즈 smoke test 자동화

후보 파일:

- `scripts/release-smoke-test.mjs`
- `.github/workflows/release-candidate.yml`

검증 대상:

- `/`
- `/stores`
- `/api/ping`
- `/api/stores`
- 지원금 필터 query
- 지역 필터 query

검증 기준:

- HTTP 200 응답
- 핵심 텍스트 포함 여부
- API 응답 shape 최소 확인
- DB 연결 실패와 지도 SDK 실패를 분리해서 기록

### 4. 운영 로그 템플릿

후보 파일:

- `docs/ops/dependency-health-log-template.md`
- `docs/ops/supabase-wakeup-log-template.md`

기록 항목:

- 점검 일시
- 실행 브랜치
- Node/Yarn/Next/React/Prisma 버전
- audit 결과
- outdated 결과 요약
- 적용한 업데이트
- major migration 보류 항목
- Supabase wake-up 응답 결과
- 후속 조치

## 후속 버전 제안

- v1.1.x
  - Pages Router 유지
  - Next 15 계열 보안 패치 유지
  - 릴리즈 문서와 수동 검증 기준 안정화
- v1.2.x
  - ESLint CLI 전환
  - Dependabot/보안 알림 대응 자동화
  - 의존성 health check 스크립트 작성
  - Supabase wake-up scheduled workflow 작성
  - 릴리즈 smoke test 스크립트 작성
  - 운영 로그 템플릿 작성
- v2.0.0
  - App Router 전환 여부 재검토
  - `@tanstack/react-query` 전환 검토
  - 등록/지도/목록 데이터 흐름 재설계
  - Supabase 운영 정책 재검토

## 참고 문헌 및 참고 사이트

- Next.js Pages Router 공식 문서: https://nextjs.org/docs/pages
- Next.js 16 Upgrade Guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- GitHub Docs, Dependabot security updates: https://docs.github.com/en/code-security/concepts/supply-chain-security/about-dependabot-security-updates
- GitHub Docs, Workflow syntax for GitHub Actions `on.schedule`: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule
- Supabase Docs, Billing FAQ: https://supabase.com/docs/guides/platform/billing-faq
- Supabase Changelog, Paused Free Plan projects are restorable for 90 days: https://supabase.com/changelog/27497-paused-free-plan-projects-are-restorable-for-90-days
- Supabase Management API Reference: https://supabase.com/docs/reference/api/introduction
- npm CLI audit documentation: https://docs.npmjs.com/cli/commands/npm-audit

