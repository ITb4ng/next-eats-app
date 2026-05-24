# Secret Audit

작성일: 2026-05-19

작업 브랜치: `chore/security-audit-hardcoded-secrets`

## 배경

루트에서 과거 Supabase Postgres connection string이 하드코딩된 DB 연결 테스트 코드가 발견되었다. 사용자는 감사 전 Supabase DB password reset을 직접 수행했고, Vercel 및 로컬 env 값을 다시 적용했다.

이번 감사는 이후 현재 저장소와 Git history에 민감값 후보가 남아 있는지 확인하고, 필요한 파일을 정리하기 위해 진행했다. 실제 secret 값은 이 문서에 기록하지 않으며, 필요한 경우 `[REDACTED]`, `[DATABASE_URL]`, `[SUPABASE_DB_PASSWORD]`, `[API_SECRET]` 같은 placeholder로만 표기한다.

## 사용자가 이미 완료한 조치

- Supabase DB password reset
- Vercel Production env 재적용
- Vercel Preview env 재적용
- 로컬 env 재적용
- 최신 `DATABASE_URL` 적용 후 Vercel Production redeploy 정상 확인

## 점검 범위

- 현재 작업 트리
- 루트 및 `scripts` 폴더의 로컬 DB 테스트 파일
- `.gitignore`
- Git history
- README/docs 내 민감값 노출 여부

검색 제외 대상은 `.git`, `node_modules`, `.next`, `dist`, `build`, `.vercel`, 캐시 폴더로 제한했다.

## 발견된 문제

### 실제 secret 후보

| 분류 | 파일 | 위치 | 판단 |
|---|---|---:|---|
| 하드코딩 DB 연결 문자열 | `test-db.js` | line 4 | 실제 Supabase Postgres connection string 형태의 값이 하드코딩된 것으로 확인됨. 값은 기록하지 않음. |

`test-db.js`는 Git tracked 파일이었고, 로컬 DB 연결 확인용 임시 스크립트로 보였다. 실제 connection string은 `[DATABASE_URL]`로만 취급하며 이 문서에 기록하지 않는다.

### placeholder 또는 정상 env 참조

| 파일 | 위치 | 판단 |
|---|---:|---|
| `.env.example` | 여러 줄 | placeholder 예시 파일로 분류. 실제 secret 값은 확인하지 않음. |
| `prisma/seed.ts` | line 4 | `process.env.DATABASE_URL` 참조. 하드코딩 값 아님. |
| `src/db/index.ts` | line 10 | `process.env.DATABASE_URL` 참조. 하드코딩 값 아님. |
| `scripts/local-db-test.example.js` | line 3 | `process.env.DATABASE_URL` 참조. example 파일이며 실제 값 없음. |
| README/docs | 여러 줄 | env 변수명 또는 보안 점검 목적의 문서 언급. 실제 값 없음. |

### 로컬 env 파일

| 파일 | 상태 | 판단 |
|---|---|---|
| `.env` | Git ignored | 실제 로컬 값 포함 가능. Git에 올리지 않는 파일로 유지. |
| `.env.local` | Git ignored | 실제 로컬 값 포함 가능. Git에 올리지 않는 파일로 유지. |

현재 로컬 env 파일에는 실제 값이 들어 있을 수 있으나, Git tracked 상태가 아니며 `.gitignore`에서 보호되도록 확인했다. 실제 값은 문서화하지 않았다.

### false positive 또는 확인 제외

| 파일 | 위치 | 판단 |
|---|---:|---|
| `yarn.lock` | line 1818 | `anon` 키워드 단순 문자열 후보. secret 값으로 판단하지 않음. |
| `src/generated/prisma/**` | 여러 줄 | Prisma generated 파일의 `secret` 문자열 후보. `.gitignore` 대상이며 Git tracked 아님. |

## 조치 내용

### 삭제한 파일

- `test-db.js`

삭제 이유:

- Git tracked 파일이었다.
- Supabase Postgres connection string 형태의 값이 하드코딩되어 있었다.
- 로컬 DB 연결 테스트 목적의 임시 파일로 보였고, 실제 값 없이 유지할 이유가 낮았다.

### 수정한 파일

- `.gitignore`

보강 내용:

- `.env`
- `.env.local`
- `.env.*.local`
- `db-test.js`
- `test-db.js`
- `connect-db.js`
- `local-db-test.js`
- `scripts/local-db-test.js`

기존 `.env*. local` 형태의 오타성 패턴은 제거하고, Next/Vercel에서 자주 쓰는 `.env.*.local` 패턴을 명시했다.

### 추가한 example 파일

- `scripts/local-db-test.example.js`

설명:

- 실제 connection string을 하드코딩하지 않는다.
- `process.env.DATABASE_URL`만 참조한다.
- 로컬에서 DB 연결 확인이 필요할 때는 실제 실행용 파일을 별도로 만들고 Git에 올리지 않는다.

## Git history 점검 결과

Git history에서 실제 secret 값은 출력하지 않고, commit/source/file 경로만 확인했다.

### 과거 노출 이력 있음

| 키워드 | commit/source | 파일 |
|---|---|---|
| `postgresql://` | `ba1e5f7` / `refs/heads/hotfix/release-issue` | `test-db.js` |
| `supabase.co` | `ba1e5f7` / `refs/heads/hotfix/release-issue` | `test-db.js` |
| `connectionString` | `ba1e5f7` / `refs/heads/hotfix/release-issue` | `test-db.js` |

위 이력은 과거에 Supabase Postgres connection string 형태의 값이 Git history에 포함되었음을 의미한다. 실제 값은 기록하지 않는다. 사용자가 이미 Supabase DB password reset과 env 재적용을 완료했으므로, 현재 DB password 기준으로는 기존 노출 값을 폐기한 상태로 본다.

### 검색 기준상 실제 값 노출로 판단하지 않은 이력

| 키워드 | 파일 | 판단 |
|---|---|---|
| `DATABASE_URL` | README, `.env.example`, Prisma config/schema, `prisma/seed.ts`, `src/db/index.ts` | env 변수명 또는 placeholder/환경변수 참조 |
| `NEXTAUTH_SECRET` | README, `.env.example` | env 변수명 또는 placeholder |
| `KAKAO_CLIENT_SECRET` | README, `.env.example`, auth route | env 변수명 또는 `process.env` 참조 |
| `GOOGLE_CLIENT_SECRET` | README, `.env.example`, auth route | env 변수명 또는 `process.env` 참조 |
| `NAVER_CLIENT_SECRET` | README, `.env.example`, auth route | env 변수명 또는 `process.env` 참조 |
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | README, `.env.example`, Kakao Map SDK hook | env 변수명 또는 `process.env` 참조 |
| `client_secret` | 없음 | 검색 기준상 확인되지 않음 |
| `service_role` | 없음 | 검색 기준상 Git history에서 확인되지 않음 |
| `private_key` | 없음 | 검색 기준상 Git history에서 확인되지 않음 |
| `api_key` | 없음 | 검색 기준상 Git history에서 확인되지 않음 |

## 현재 저장소 상태

현재 작업 트리 기준으로 tracked 파일에 실제 secret 값이 남아 있다고 판단되는 항목은 확인되지 않았다.

남아 있는 후보는 다음처럼 분류한다.

| 파일 | 위치 | 상태 |
|---|---:|---|
| `.env` | 여러 줄 | Git ignored. 실제 로컬 값 포함 가능. Git에 올리지 않음. |
| `.env.local` | 여러 줄 | Git ignored. 실제 로컬 값 포함 가능. Git에 올리지 않음. |
| `prisma/seed.ts` | line 4 | `process.env.DATABASE_URL` 참조. 문제 없음. |
| `src/db/index.ts` | line 10 | `process.env.DATABASE_URL` 참조. 문제 없음. |
| `scripts/local-db-test.example.js` | line 3 | example 파일의 `process.env.DATABASE_URL` 참조. 문제 없음. |

Vercel Production은 최신 `[DATABASE_URL]` 반영 후 redeploy가 정상 완료된 것으로 확인했다. 이 문서는 실제 env 값을 기록하지 않는다.

## 추가 수동 확인 필요 항목

1. GitHub Secret Scanning alerts 확인
2. Vercel Preview Environment Variables 값이 최신 Supabase password 기준인지 확인
3. 로컬 `.env.local`이 최신 Supabase password 기준인지 확인
4. 필요 시 Supabase logs 확인
5. 과거 GCP 과금 사고와 관련된 다른 cloud/API key 노출 여부 별도 확인

## GCP 과금 사고와의 관계

Supabase DB connection string만으로 GCP 과금 사고의 직접 원인이라고 단정할 수는 없다.

다만 저장소에 하드코딩 secret이 있었다면 당시 secret 관리에 문제가 있었던 위험 신호로 볼 수 있다. GCP 과금 사고와의 직접 연관성은 당시 노출된 GCP credentials 또는 외부 API key 존재 여부를 별도로 확인해야 한다.

## 후속 조치

- secret 후보 검색을 주기적으로 수행한다.
- 민감값은 `.env.local`과 Vercel Environment Variables에서만 관리한다.
- 실제 값이 필요한 로컬 테스트 파일은 Git에 올리지 않는다.
- example 파일은 placeholder 또는 환경변수 참조만 사용한다.
- 보안 관련 변경은 별도 PR로 관리한다.
- Git history에 이미 남은 민감값 이력이 있으므로, credential reset을 완료한 상태를 유지하고 필요 시 GitHub secret scanning 결과를 함께 확인한다.
