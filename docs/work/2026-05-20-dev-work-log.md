# 2026-05-20 Dev 작업 기록

작성일: 2026-05-20

기준 브랜치: `fix/v1.1.0-favicon-debug-state`

## 요약

2026-05-20 작업은 PR merge 전 작업 브랜치에서 favicon/app icon 보완, debug state 환경 분리, 메인 페이지 fallback 상태 문서화를 함께 정리하는 데 집중되었다. 특히 `debugState` 코드를 추가해서 실제 장애 대응에 따른 UI를 시각적으로 확인하여 추후 fallback UI/UX 개선 작업으로 이어갈 수 있도록 기준을 분리하였고 금일 작업 우선 순위는 A, B, C중 A를 우선시 작업을 진행, 
이 A는 문서화와 각 브라우저마다 달리 보이는 favicon, fallback UI 확인을 위해 개발을 진행했음

핵심 변경 축:

- favicon, apple touch icon, Android icon, web manifest 추가 및 캐시 정책 정리
- `debugState`, `debugReason`, runtime copy 매핑을 별도 모듈로 분리
- 개발 환경에서만 URL debug preview와 `debug:` 보조 문구가 동작하도록 가드
- Map, Store API, Marker 상태별 사용자 문구와 debug reason 연결
- 지도 실패와 store API 실패 UI의 역할 분리
- debug state 문서와 날짜별 work log 문서 추가

## 커밋별 작업 기록

### 미커밋 작업 묶음: `fix/v1.1.0-favicon-debug-state`
*** 해당 세션은 커밋 후 다음 작업에서 다시 수정한다. ***

주요 내용:

- favicon 관련 정적 파일을 추가했다.
  - `public/favicon.ico`
  - `public/favicon-32x32.png`
  - `public/apple-touch-icon.png`
  - `public/android-chrome-192x192.png`
  - `public/android-chrome-512x512.png`
  - `public/site.webmanifest`
- `_app.tsx`에 favicon, apple touch icon, manifest, theme color 메타 정보를 연결했다.
- `next.config.ts`에서 favicon/icon/manifest 파일의 cache header를 `must-revalidate` 기준으로 조정했다.
- `src/lib/debugState.ts`를 추가해 runtime UI 상태, map/store/marker debug state, 사용자-facing copy를 한 곳에서 관리하도록 분리했다.
- `src/hooks/useKakaoMapSdk.ts`에서 Kakao Map SDK 실패 원인을 `debugCode`로 반환하도록 보강했다.
- `src/components/Map.tsx`에서 map debug state를 받아 로딩, SDK 실패, 지도 생성 실패, tile timeout 상태를 강제 preview할 수 있게 했다.
- `src/pages/index.tsx`에서 `debugState`/`debugReason` query를 읽어 개발 환경 전용 runtime preview를 제공했다.
- Store API 실패를 `store-database-delay`, `store-network-error`, `store-api-error`로 분류하고, 개발 환경에서만 `debug:` 보조 문구를 표시하도록 정리했다.
- Store API 실패 toast와 일반 상태 패널을 분리해 지도 실패와 데이터 실패가 같은 화면에서 섞이지 않도록 했다.
- `docs/debug/2026-05-19-v1.1.0-debug-state.md`를 추가해 URL preview, 실제 장애 재현, API/DB 확인 방법을 분리했다.
- `docs/work/2026-05-18-dev-work-log.md`, `docs/work/2026-05-19-dev-work-log.md`를 추가해 원격 `dev` 기준 과거 작업 기록을 날짜별로 정리했다.

작업 메모:

- `debugState=loading|empty|failure`는 실제 지도/API/마커 렌더링의 관련된 사용자 측 통합 preview UI를 보여준다.
- 실제 Kakao SDK 실패나 `/api/stores` 네트워크 실패는 DevTools request blocking으로 확인
- `[ops:...]` 진단 로그는 사용자 측이 아닌 개발환경에서 장애대응 매뉴얼에 관해 디버깅이 용이하도록 콘솔/서버 로그에서 장애 원인을 검색하기 위한 코드다.
- 지도 실패 + store success + 데이터 있음 상태는 전체 success가 아니라 `map failure + store success`의 degraded fallback 상태로 보는 것이 맞다.
- 지도 실패 후 store 데이터가 늦게 도착하면서 목록 fallback이 갑자기 나타나는 현상은 B/C fallback UX 개선 대상이며, 1차 개선에서는 10개 미리보기 목록을 제거한다.

## 후속 연결

이 브랜치의 A 작업으로 debug state와 fallback 상태 해석 기준 분리와 문서 정리를 진행했고, 이후 B/C 작업에서는 실제 화면 UX를 다음 기준으로 개선하는 것이 적합하다. B/C 작업의 내용은 아래 내용과 같다.

- 지도 실패 + store loading 상태에서 "목록 대체 화면을 준비 중"임을 자연스럽게 안내
- 지도 실패 + store success 상태에서 최신 맛집 목록 fallback을 더 안정적으로 표시
- 지도 실패 + store empty 상태에서 등록 CTA 중심 empty UI 제공
- 지도 실패 + store failure 상태에서 지도 문제와 데이터 문제를 분리해서 안내
- Supabase paused/DB 지연 상태를 일반 네트워크 실패와 구분해 설명
- 지도 실패 + 데이터 로드 실패 + Supabase paused/DB 실패는 `?debugStatate=Failure`와 `[ops]..` 운영코드까지 같이 로그 표시

이 후속 작업은 재배포 후 검증이 완료되면 목적에 맞게 브랜치 명을 생성 후 B/C 작업을 이어 진행한다.

## 후속 B/C/D 진행 연결

진행 브랜치: `fix/map-store-fallback-debug-guards`

2026-05-20 문서의 B/C 후속 작업은 위 기준과 목적이 맞다고 판단했다. A 작업에서 debug state와 fallback 상태 기준을 분리했고, 이후 `fix/map-store-fallback-debug-guards` 브랜치에서 실제 화면 흐름을 B/C로 반영하면서 production 노출 로그 분리를 D 작업으로 추가했다.

실제 구현 상세 기록은 `docs/work/2026-05-21-dev-work-log.md`에 분리했다.

### B. 지도를 못 불러왔을 경우

기존 기준:

- 지도 실패 + store success 상태에서 최신 맛집 목록 fallback을 표시하는 방향이 후보였다.
- 실제 화면에서는 지도 아래에 실제 Store API 데이터 10개 미리보기 섹션이 표시되었다.

변경 방향:

- 10개 미리보기 fallback은 제거한다.
- 지도 실패 시 메인 지도 영역의 전체 높이를 유지하고 중앙 fallback 카드로 안내한다.
- 맵만 실패하고 DB/API가 성공한 경우는 서비스 이용 가능 안내와 `/stores` CTA를 제공한다.
- 맵과 DB/API가 모두 실패한 경우는 탐색 기능 제한 상태로 안내한다.

### C. 지도는 열렸지만 Store/Marker 상태가 비정상인 경우

기존 기준:

- 맵은 열렸지만 Store 데이터가 없거나 실패한 경우를 지도 SDK 실패와 분리해야 했다.
- Store API 실패 toast가 빨강 alert 중심으로 보여, 지도는 정상인데도 전체 장애처럼 강하게 보일 수 있었다.

변경 방향:

- 맵 성공 + DB/API 실패는 지도는 유지하고 store 실패 toast만 표시한다.
- 이 케이스는 빨강 critical이 아니라 주황 warning tone으로 낮춰 표시한다.
- `store-empty`와 marker 문제는 장애 성격이 다르므로 기존처럼 별도 상태로 유지한다.

### D. production ops/debug 노출 분리

D는 B/C fallback UI 개선과 별개의 추가 작업이다.

- `[ops:*]` 진단 로그는 `NODE_ENV=development`에서만 콘솔에 출력되도록 제한한다.
- production 브라우저에서 `/api/stores` 요청을 차단해도 `[ops:*]` 로그가 콘솔에 남지 않아야 한다.
- `debugState`, `debugReason`, `debug:` 보조 문구는 기존 기준대로 개발 환경에서만 동작해야 한다.
- production 사용자는 내부 debug code가 아니라 복구 가능한 사용자 안내와 다음 행동만 확인해야 한다.
