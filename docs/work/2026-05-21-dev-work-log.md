# 2026-05-21 Dev 작업 기록

작업일: 2026-05-21

문서 정리일: 2026-05-23

작업 브랜치: `fix/map-store-fallback-debug-guards`

기준 브랜치: `dev`

## 요약

2026-05-21 작업은 2026-05-20 문서의 B/C 후속 범위를 실제 메인 페이지 fallback UI에 반영하고, 추가 요구사항 D로 production 환경의 debug/ops 노출을 분리한 작업이다.

핵심은 Kakao Map SDK 실패와 Store API/DB 실패를 같은 장애로 뭉치지 않고, 조합별로 사용자에게 다른 강도의 안내를 제공하는 것이다.

- 맵만 실패한 경우: 서비스는 계속 이용 가능하므로 warning tone 안내와 `/stores` CTA 제공
- 맵과 DB/API가 모두 실패한 경우: 탐색 기능 제한 상태로 보고 critical tone 안내
- 맵은 성공했지만 DB/API만 실패한 경우: 지도는 유지하고 낮은 강도의 warning toast 제공
- production에서는 `[ops:*]`, `debugState`, `debugReason`, `debug:` 보조 정보가 사용자에게 노출되지 않도록 유지

## B. 맵 실패 fallback UI 변경

### 기존 문서 기준

2026-05-20 문서의 B 작업 기준은 "맵을 못 불러왔을 경우"였다. 당시에는 지도 실패 후 store 데이터가 도착하면 지도 아래에 최신 맛집 목록 fallback을 표시하는 흐름이 후보로 남아 있었다.

기존 관찰 상태:

- Kakao Map SDK만 실패하고 `/api/stores`는 성공하면 지도 아래에 가게 10개 미리보기 fallback 섹션이 표시되었다.
- 이 목록은 더미가 아니라 실제 Store API 응답 데이터 중 처음 10개였다.
- 하지만 메인 페이지의 역할이 모호해지고, 사용자가 "지도만 실패한 것인지 앱 전체가 실패한 것인지" 직관적으로 알기 어려웠다.

### 변경 후 기준

맵 실패 + DB/API 성공은 앱 전체 장애가 아니라 지도 기능만 사용할 수 없는 상태로 본다.

변경 내용:

- `StoreListFallback` 컴포넌트를 제거했다.
- `showListFallback` 상태를 제거했다.
- `Map`의 `presentation`/compact 분기를 제거하고, 지도 영역은 항상 메인 화면 전체 높이를 유지한다.
- 지도 실패 카드는 화면 중앙에 유지한다.
- 가게 10개 미리보기 섹션은 더 이상 표시하지 않는다.
- 지도 실패 카드 안에 "맛집 목록과 주요 서비스는 계속 이용 가능" 안내를 표시한다.
- `/stores`로 이동하는 `맛집 목록으로 이동` CTA를 제공한다.
- `다시 시도`와 `맛집 목록으로 이동` 버튼은 개발/프로덕션 모두 같은 카드 하단에 가로 배치한다.
- map-only 실패는 주황 `warning` tone으로 표시한다.

결과 상태:

- 사용자는 지도만 실패했고, 맛집 목록/검색/지역별 필터는 계속 사용할 수 있음을 알 수 있다.
- 메인 화면 아래에 임시 목록처럼 보이는 10개 미리보기가 나오지 않는다.

## B 확장. 맵 실패 + DB/API 실패

맵 실패와 DB/API 실패가 동시에 발생하면 서비스 탐색의 핵심 경로가 모두 제한된다.

변경 내용:

- 지도 중앙 fallback 카드는 유지한다.
- 카드 안에 "지도와 맛집 데이터를 모두 불러오지 못해 현재 탐색 기능이 제한됩니다." 안내를 추가했다.
- DB/API 실패는 별도 fixed toast로 유지한다.
- 두 실패가 동시에 발생한 경우는 빨강 `critical` tone을 사용한다.
- critical 재시도 버튼은 red filled 스타일로 표시한다.

## C. 맵 성공 + DB/API 실패 변경

### 기존 문서 기준

2026-05-20 문서의 C 작업 기준은 "맵은 열렸지만 Store 데이터가 없거나 실패한 경우"였다.

기존 구현/관찰 상태:

- Store API 실패 toast가 빨강 alert 중심으로 표시되었다.
- 지도는 성공했는데도 데이터 실패 UI가 전체 장애처럼 강하게 보일 수 있었다.
- debug 보조 문구의 배경이 signature color 계열이라 warning 상태와 의미가 섞여 보였다.

### 변경 후 기준

맵 성공 + DB/API 실패는 앱 전체 장애가 아니다. 지도 화면은 유지하되 가게 목록과 위치 데이터만 일시적으로 불러오지 못한 상태로 본다.

변경 내용:

- 지도는 그대로 표시한다.
- Store API/DB 실패 toast는 fixed notification 형태로 유지한다.
- 이 케이스는 빨강 critical이 아니라 주황 `warning` tone으로 낮춰 표시한다.
- debug 보조 문구도 signature color가 아니라 warning tone 배경/텍스트를 사용한다.
- 문구는 "지도는 사용할 수 있지만 맛집 목록과 위치 정보를 불러오지 못했습니다" 방향으로 조정했다.

그 외 C 범위:

- `store-empty`는 장애가 아니므로 등록 CTA 중심 empty UI로 유지한다.
- marker empty/partial/error는 지도 SDK 실패와 분리된 위치 표시 문제로 유지한다.

## 공통 fallback tone 정리

이번 작업에서 상태 색상 기준을 `src/lib/fallbackTone.ts`로 공통화했다.

현재 기준:

- `warning`: 둘 중 하나만 실패한 경우
  - 맵 실패 + DB/API 성공
  - 맵 성공 + DB/API 실패
- `critical`: 맵과 DB/API가 모두 실패한 경우

공통화한 항목:

- fallback panel border
- divider
- debug label 배경/텍스트
- retry button
- toast border

이 파일은 다음 컬러 시스템 토큰 작업에서 CSS variable 또는 design token으로 승격할 수 있는 임시 기준점이다.

## D. production ops/debug 노출 분리

D는 B/C fallback UI 개선과 별개의 추가 작업으로 명시했다.

변경 이유:

- 배포 사이트에서 `/api/stores` 또는 Kakao SDK 요청을 Network block 처리하면 브라우저 콘솔에 `[ops:*]` 진단 로그가 노출되는 문제가 있었다.
- production 사용자는 내부 진단 코드가 아니라 복구 가능한 안내와 다음 행동만 봐야 한다.

변경 내용:

- `src/lib/opsLogger.ts`에서 `[ops:*]` 로그가 `NODE_ENV=development`에서만 출력되도록 가드했다.
- `debugState`, `debugReason`, `debug:` 보조 문구는 기존 기준대로 development에서만 동작하도록 유지했다.
- production build 산출물에서 `[ops:` 문자열이 남지 않는지 확인했다.

문서 반영:

- `docs/debug/2026-05-19-v1.1.0-debug-state.md`에 production에서 `[ops:*]` 로그와 debug UI가 노출되면 수정 대상이라는 기준을 보강했다.
- 이 work log의 D 섹션에 B/C와 별도인 추가 작업임을 명시했다.

## 변경 파일

- `src/pages/index.tsx`
- `src/components/Map.tsx`
- `src/lib/debugState.ts`
- `src/lib/opsLogger.ts`
- `src/lib/fallbackTone.ts`
- `docs/debug/2026-05-19-v1.1.0-debug-state.md`
- `docs/work/2026-05-20-dev-work-log.md`
- `docs/work/2026-05-21-dev-work-log.md`

## 검증 기록

- `yarn lint` 통과
- `yarn build` 통과
- `StoreListFallback`, `showListFallback`, `presentation` 검색 결과 없음
- 10개 미리보기 fallback 관련 문구 검색 결과 없음
- `.next`에서 `[ops:` 문자열 없음
