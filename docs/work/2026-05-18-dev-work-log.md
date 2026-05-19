# 2026-05-18 Dev 작업 기록

작성일: 2026-05-20

기준 브랜치: `origin/dev`

## 요약

2026-05-18 작업은 `v1.1.0`의 첫 화면 로딩 안정화 기반을 잡는 데 집중되었다. 
Kakao Map SDK 로딩을 별도 hook으로 분리하고, 지도/마커/store API 상태를 메인 페이지에서 함께 다룰 수 있도록 구조를 넓혔다.

핵심 변경 축:

- Kakao Map SDK 로딩, timeout, error 상태 분리
- 지도 생성 실패와 marker 렌더링 실패 상태 처리 기반 추가
- 메인 페이지의 store 데이터 fallback 흐름 보강
- `/api/stores` DB/API 오류 분류 보강
- 로컬 실행 환경 변수 예시 정리

## 커밋별 작업 기록

### `2bcccb7` feat: 첫 로딩화면 지도 안정성 강화 및 fallback UX 개선

첫 로딩 화면에서 Kakao Map SDK와 지도 인스턴스 생성 흐름을 안정화하기 위한 기반 작업을 진행했다.

주요 내용:

- `useKakaoMapSdk` hook을 추가해 Kakao Map script 로딩, timeout, error 상태를 분리했다.
- `Map`, `Markers`, `Marker`, `CurrentPosition`의 지도 의존 흐름을 정리했다.
- 메인 페이지에서 지도 로딩/실패, store 데이터, marker 상태를 함께 다룰 수 있도록 상태 분기 기반을 넓혔다.
- `/api/stores`에서 DB/API 오류 분류를 보강했다.
- `.env.example`을 추가해 로컬 실행에 필요한 환경 변수 기준을 문서화했다.
- 사용하지 않는 `src/pages/dataFetching/*` 예제 페이지를 제거했다.

작업 메모:

- 이 커밋은 이후 2026-05-19의 `361ffe2`와 거의 같은 변경 범위를 가진다.
- 리뷰할 때는 2026-05-19 커밋 메시지가 더 구체적이므로 `361ffe2`를 대표 구현 커밋으로 보는 편이 좋다.

## 후속 연결

이날 작업으로 지도 로딩 안정화와 fallback UX의 기반은 마련되었지만, 실제 사용자 흐름에서는 지도 실패 후 store 데이터가 늦게 도착할 때 화면이 갑자기 바뀌는 문제가 남아 있다. 이 부분은 이후 지도 실패 fallback UI와 store empty/failure UI 개선 작업에서 별도로 다루는 것이 적합하다.
