# 2026-05-19 Dev 작업 기록

작성일: 2026-05-20

기준 브랜치: `origin/dev`

## 요약

2026-05-19 작업은 `v1.1.0` 로딩 안정화 범위를 dev에 반영하고, 성능/보안/운영 진단 기준을 문서와 코드로 정리하는 데 집중되었다. 첫 화면 안정화 구현을 기준으로 LCP/SEO 측정, 하드코딩 secret 감사, 운영 로그 기반, Production 성능 결과 문서화까지 이어졌다.

핵심 변경 축:

- 첫 로딩 화면 안정성과 Kakao Map fallback UX 반영
- 성능 baseline, LCP 분석, Production 측정 결과 문서화
- 하드코딩 secret 감사와 루트 설정 파일 정리
- 정적 리소스와 marker 이미지 최적화
- `[ops:...]` 운영 로그 기반 추가
- SEO 메타 정보와 런타임 성능 점검 스크립트 추가

## 커밋별 작업 기록

### `361ffe2` feat: 첫 로딩 화면 안정성 강화 및 fallback UX 개선

5월 18일 구현 범위를 dev 흐름에 반영하면서 커밋 메시지에 작업 의도를 더 명확히 남긴 커밋이다.

주요 내용:

- 첫 로딩 화면 안정성을 강화했다.
- Kakao Map 로딩 전 fallback UX를 개선했다.
- 최소 store 데이터 표시 흐름을 보완했다.
- 환경 변수 예시 파일을 정리했다.

작업 메모:

- 지도 실패, store loading/success/error, marker empty/error 상태가 서로 맞물리기 시작한 지점이다.
- 이후 fallback UI를 더 고도화할 때는 이 커밋의 `src/pages/index.tsx`, `src/components/Map.tsx`, `src/components/Markers.tsx`, `src/hooks/useKakaoMapSdk.ts` 변경 흐름을 먼저 확인하면 된다.

### `43408d0` docs: v1.1.0 로딩 안정화 기준 문서화 (#7)

`v1.1.0` 로딩 안정화 작업의 기준과 배경을 문서화했다.

주요 내용:

- `docs/performance/2026-05-19-v1-loading-comparison.md`를 추가했다.
- README에 Production 성능 baseline과 로딩 안정화 범위를 반영했다.
- `v1.0.0` Known Issues와 `v1.1.0` Loading Stability Scope를 정리했다.
- `v2.0.0`에서 다룰 구조적 개선 후보를 정리했다.

작업 메모:

- 코드 변경의 목적과 성능 기준을 설명하는 기준 문서다.
- 이후 성능이나 fallback UI 관련 PR을 검토할 때 이 문서가 "왜 이 작업을 했는지"를 설명하는 배경 자료가 된다.

### `894ec9d` chore: 하드코딩 DB secret 감사 및 루트 파일 정리 (#8)

보안 감사와 루트 설정 파일 정리를 진행했다.

주요 내용:

- 하드코딩된 DB secret 사용 여부를 감사하고 관련 내용을 `docs/security/2026-05-19-secret-audit.md`에 기록했다.
- `docs/performance/2026-05-19-v1.1.0-lcp-analysis.md`를 추가해 LCP 분석 기준을 문서화했다.
- `.vscode/settings.json`, `postcss.config.mjs`, `tailwind.config.js`, `test-db.js` 등 불필요하거나 중복된 루트 파일을 제거했다.
- `scripts/local-db-test.example.js`를 추가해 DB 연결 확인 예시를 별도 스크립트로 분리했다.
- favicon SVG와 일부 스타일/설정 파일을 정리했다.

작업 메모:

- 실제 secret 값은 문서나 로그에 남기지 않는 방향으로 정리되었다.
- 로컬 DB 점검은 실제 접속 정보가 아닌 example script 기준으로 공유해야 한다.

### `913d0c4` perf: v1.1.0 로딩 리소스 최적화 및 SEO 보완 (#9)

초기 로딩 리소스와 SEO 보완 작업을 진행했다.

주요 내용:

- `next.config.ts`에 정적 리소스/이미지/빌드 관련 최적화 설정을 추가했다.
- marker 이미지 리소스를 경량화했다.
- `scripts/performance-v1.1.0-runtime-checks.mjs`를 추가해 런타임/성능 점검 기반을 마련했다.
- `src/lib/opsLogger.ts`를 추가해 운영 로그 코드 기반을 만들었다.
- Kakao Map SDK, store API, marker 실패 흐름에서 운영 로그와 debug code를 연결했다.
- 메인 페이지 SEO 메타 정보를 보완했다.
- local build/start와 Vercel Preview 기준 Lighthouse 결과를 문서에 반영했다.

작업 메모:

- `[ops:...]` 운영 로그가 도입된 커밋이다.
- 성능 최적화뿐 아니라 장애 진단 기반도 같이 들어갔으므로, 단순 perf 커밋으로만 보지 않는 편이 좋다.

### `997bfa8` docs: v1.1.0 production 성능 결과 반영

Production 측정 결과를 문서에 반영하기 위한 문서 커밋이다.

주요 내용:

- README의 성능 결과와 `v1.1.0` 진행 상태를 갱신했다.
- `docs/performance/2026-05-19-v1-loading-comparison.md`에 Production 결과를 반영했다.
- `docs/performance/2026-05-19-v1.1.0-lcp-analysis.md`에 LCP 측정 결과와 후속 과제를 보강했다.

작업 메모:

- 이 커밋은 바로 다음 `69426d9` PR 반영 커밋에 포함된다.
- 커밋 단위로 추적할 때는 원본 문서 수정 커밋으로 보고, dev 반영 여부는 `69426d9`에서 확인한다.

### `69426d9` docs: v1.1.0 production 성능 결과 반영 (#10)

Production 성능 결과 문서화를 dev에 반영한 PR 커밋이다.

주요 내용:

- Production Lighthouse 최종 결과를 문서화했다.
- Performance 96, Accessibility 93, Best Practices 96, SEO 100 결과를 반영했다.
- Production 기준 LCP 약 1.4초 확인 내용을 추가했다.
- `v1.1.0`에서 완료한 최적화 항목과 남은 후속 과제를 정리했다.

작업 메모:

- `997bfa8`의 문서 변경을 dev에 통합한 커밋으로 보면 된다.
- 이후 성능 회귀나 추가 최적화 논의는 이 커밋의 문서 결과를 기준선으로 삼으면 된다.

## 후속 연결

5월 19일 작업으로 로딩 안정화, 운영 로그, 성능 측정 기준은 갖춰졌지만, 메인 페이지의 fallback UX는 아직 더 정교하게 나눌 여지가 남아 있다.

5월 20일 작업 후속으로 다룰 만한 범위:

- 지도 실패 + store loading 상태에서 사용자에게 "목록 대체 화면을 준비 중"임을 자연스럽게 안내
- 지도 실패 + store success 상태에서 최신 맛집 목록 fallback을 더 안정적으로 표시
- 지도 실패 + store empty 상태에서 등록 CTA 중심 empty UI 제공
- 지도 실패 + store failure 상태에서 지도 문제와 데이터 문제를 분리해서 안내
- Supabase paused/DB 지연 상태를 일반 네트워크 실패와 구분해 설명

이 후속 작업은 2026-05-20 현재 브랜치 작업과 분리해서 별도 요청/브랜치에서 진행하는 것이 적합하다.
