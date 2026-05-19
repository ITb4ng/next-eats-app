# v1.0.0 대비 현재 Production 로딩 성능 비교

작성일: 2026-05-19  
대상 프로젝트: `next-eats-app`  
작업 기준 브랜치: `perf/v1.1.0-loading-stability`

## 요약

- `v1.0.0`은 핵심 기능 구현과 배포에는 성공했지만, 초기 로딩 속도, 지도 의존 구조, SEO, 의존성/보안 안정화, 성능 측정 자동화 측면에서 개선 과제가 있었다.
- `v1.1.0` 로딩 안정화 작업 전 초기 Production 배포본은 `v1.0.0` 대비 Desktop Performance 평균이 `78.66`에서 `88`로, SEO가 `54`에서 `91`로 개선된 상태였다.
- PR #9 `perf: v1.1.0 로딩 리소스 최적화 및 SEO 보완` 이후 Production 최종 측정에서는 Performance `96`, Accessibility `93`, Best Practices `96`, SEO `100`을 확인했다.
- LCP는 기존 `v1.0.0` / 초기 Production 문서 기준 약 `2.1s`에서, PR #9 이후 Production 측정 기준 약 `1.4s` 수준으로 개선된 것을 확인했다.
- Mobile Performance는 1회 측정 기준 약 `72`에서 `75`로 소폭 개선되었지만, 여전히 추가 개선이 필요하다.
- 이 수치는 Lighthouse 측정 시점과 환경의 영향을 받을 수 있으므로, 절대적인 성능 보증이 아니라 `v1.1.0` 기준 로딩 안정화 목표 달성을 확인한 측정 기록으로 본다.
- 추가 최적화는 대규모 구조 변경보다 반복 측정 자동화와 회귀 방지 중심으로 관리한다.

## 배경

`next-eats-app`은 2026년 4월 4일 `v1.0.0`으로 최초 배포되었다.

`v1.0.0`은 맛집 등록, Kakao Map 기반 지도 표시, 마커 표시, 좋아요, 마이페이지, 무한 스크롤 등 핵심 기능을 제공하는 초기 릴리즈였다. 초기 릴리즈는 서비스의 주요 사용자 흐름을 실제 배포 환경까지 연결했다는 점에서 의미가 있었다.

다만 2026년 5월 18일 README 보강을 준비하던 중 다음 문제가 다시 확인되었다.

- 초기 로딩 속도 개선 필요
- Kakao Map 렌더링 의존도가 높은 구조
- Supabase 무료 요금제 일시정지로 인한 첫 요청 지연 가능성
- GitHub Dependabot 알림을 통한 의존성 및 보안 패치 필요성
- fallback UI 개선 필요성
- 프로젝트 루트 구조 및 의존성 안정화 필요성
- 반복 가능한 성능 측정 자동화 기준 부족

이에 따라 `v1.0.0` 배포 버전과 현재 Production 배포본을 비교하여, `v1.1.0` 로딩 안정화 작업의 기준선을 문서화한다.

## 비교 대상

| 구분 | 설명 | URL |
|---|---|---|
| `v1.0.0` 배포 버전 | 2026년 4월 4일 최초 배포 버전 | `https://next-eats-p8o1fkw06-itb4ngs-projects.vercel.app/` |
| 현재 Production | 현재 `dev` 브랜치 기준으로 푸시 및 배포된 Production 버전 | `https://next-eats-app.vercel.app/` |

현재 Production은 `v1.1.0`급 로딩 안정화 대상으로 보고 있으며, 이후 Playwright MCP 기반 측정 코드와 자동화 테스트로 확장할 계획이다.

## 측정 목적

이번 비교의 목적은 코드 최적화 자체가 아니라, `v1.0.0` 배포본과 현재 Production 배포본의 Lighthouse 측정 결과를 문서화해 성능 기준선을 남기는 것이다.

특히 다음 내용을 확인하는 데 초점을 둔다.

- 초기 릴리즈가 제공한 기능 범위와 운영 품질 개선 과제 정리
- 현재 Production에서 확인된 성능 및 SEO 개선 폭 기록
- LCP와 모바일 성능처럼 아직 남아 있는 병목 후보 명확화
- `v1.1.0` 안정화 작업과 `v2.0.0` 구조 개선 작업의 기준선 마련
- 향후 Playwright MCP 기반 성능 측정 자동화의 필요성 정리

## 측정 기준

| 항목 | 기준 |
|---|---|
| 측정 도구 | Chrome DevTools Lighthouse |
| 측정 방식 | Navigation |
| Desktop Performance | 반복 측정 평균값 |
| Mobile Performance | 1회 측정값 |
| `v1.0.0` 측정 대상 | Vercel 고유 배포 URL |
| 현재 Production 측정 대상 | Production URL |
| 주요 확인 지표 | Performance, SEO, LCP, FCP, Speed Index, TBT, CLS |

## 측정 환경과 한계

이번 문서의 수치는 Lighthouse 수동 측정 결과를 기준으로 정리했다.

- `v1.0.0`은 과거 배포 URL을 확보했지만, 현재 로컬 코드 기준에서 당시 버전을 Playwright MCP 서버로 동일하게 재현 측정하는 것은 불가능하다.
- 따라서 `v1.0.0`은 복원한 Vercel 고유 URL의 Lighthouse 수동 측정 결과를 baseline으로 사용한다.
- 현재 Production은 `https://next-eats-app.vercel.app/` 배포본을 기준으로 측정했다.
- Desktop Performance는 평균값을 기준으로 비교했다.
- Mobile Performance는 1회 측정값 기준이므로 반복 측정 평균으로 보기 어렵다.
- Lighthouse 결과는 네트워크 상태, Vercel 응답 상태, 외부 API 및 정적 리소스 캐시 상태, 측정 시점의 브라우저 환경에 영향을 받을 수 있다.
- Kakao Map, 지도 타일, 커스텀 폰트, 마커 이미지 등 외부/정적 리소스 의존도가 있으므로 앱 코드만으로 모든 지표를 통제하기 어렵다.
- Supabase 무료 요금제의 일시정지 또는 cold start 상황은 첫 요청 지연으로 나타날 수 있으며, 측정 시점에 따라 결과가 달라질 수 있다.

따라서 이 문서는 절대적인 성능 보증이 아니라, 2026년 5월 19일 기준 운영 개선 흐름을 설명하기 위한 비교 기록으로 다룬다.

## Lighthouse Desktop 초기 비교

| 항목 | `v1.0.0` 배포 버전 | 초기 Production | 변화 |
|---|---:|---:|---:|
| Desktop Performance 평균 | 78.66 | 88 | +9.34 |
| SEO | 54 | 91 | +37 |

PR #9 이전 초기 Production 기준 Desktop Performance 평균은 `78.66`에서 `88`로 개선되었다.

SEO는 `54`에서 `91`로 상승해 메타 정보, 페이지 구조, 검색 노출 관점의 개선이 확인되었다.

## v1.1.0 Production 최종 측정 결과

PR #9 이후 Production URL 기준으로 다음 Lighthouse 결과를 확인했다.

| 항목 | v1.0.0 / 초기 기준 | v1.1.0 Production 최종 | 변화 |
|---|---:|---:|---:|
| Desktop Performance 평균 | 78.66 | 96 | +17.34 |
| SEO | 54 | 100 | +46 |
| LCP | 약 2.1s | 약 1.4s | 약 -0.7s |
| Accessibility | 93 | 93 | 유지 |
| Best Practices | 96 | 96 | 유지 |

- `v1.1.0` 최적화 이후 Production URL 기준 Performance `96`, SEO `100`을 확인했다.
- 기존 `v1.0.0` 대비 Desktop Performance와 SEO가 크게 개선되었다.
- LCP는 기존 약 `2.1s` 수준에서 약 `1.4s` 수준으로 개선된 것으로 확인했다.
- Accessibility와 Best Practices는 기존의 양호한 수준을 유지했다.
- Preview에서는 SEO가 `54`에서 `63`으로 개선되었지만 noindex 영향이 남아 있었고, Production에서는 SEO `100`으로 확인되었다.
- 따라서 Preview SEO 결과는 Production SEO 문제로 단정하지 않는다.

## v1.1.0 남은 최적화 숙제 점검

### 완료로 볼 수 있는 항목

- `v1.0.0` 대비 Performance 개선 확인
- `v1.0.0` 대비 SEO 개선 확인
- Production 기준 SEO `100` 확인
- Production 기준 LCP 약 `1.4s` 확인
- Preview / Production SEO 차이 원인 분리
- local build/start와 Production 측정 결과 문서화

### v1.1.0에서 아직 확인할 항목

- Mobile Lighthouse 반복 측정
- Production LCP 3회 반복 측정 평균
- Console error 0개 확인
- Kakao Map SDK / tile 요청 수 확인
- map loading / store loading 상태 분리 여부 확인
- debug state가 production에 노출되지 않는지 확인
- fallback / loading / empty / error 상태가 사용자 기준으로 안정적인지 확인

### 지금 당장 하지 않을 항목

- Kakao Map SDK 로딩 방식 전면 변경
- 메인페이지 지도/목록 구조 전면 리팩토링
- 맛집 등록 플로우 재설계
- 주소 검색/좌표 저장/카테고리 선택 흐름 변경
- DB 구조 변경
- 대규모 dynamic import 리팩토링

### v2.0.0으로 넘길 항목

- 맛집 등록 플로우 전면 재설계
- 지도 클릭 기반 등록 UX 강화
- 지도 중심 구조와 리스트 중심 구조의 역할 재정의
- 서비스 데이터 흐름 전면 개편
- fallback/debug/loading/empty/error 상태 설계 전면 재정리

## 추가 최적화 판단

Production LCP가 약 `1.4s` 수준으로 확인되었기 때문에, `v1.1.0` 단계에서 추가적인 대규모 LCP 최적화는 우선순위가 낮다. 이후에는 Playwright MCP 또는 반복 Lighthouse 측정을 통해 성능 회귀를 감지하고, 모바일 성능이나 지도 fallback 상태에서 문제가 반복될 경우 작은 범위의 최적화를 진행한다.

Kakao Map 관련 외부 리소스는 앱 코드만으로 전부 통제하기 어렵다. 따라서 SDK 로딩 방식이나 메인 지도 구조를 무리하게 바꾸기보다, Production 반복 측정, 모바일 측정, console/network 점검을 통해 실제 회귀가 확인되는 지점부터 좁은 범위로 다룬다.

## 후속 작업 제안

| 브랜치 후보 | 목적 |
|---|---|
| `test/v1.1.0-performance-monitoring` | Playwright MCP 또는 Playwright 기반 측정 시나리오 추가 |
| `feat/v1.1.0-debug-state-guard` | debug state가 production에 노출되지 않도록 환경 분리 점검 |
| `test/v1.1.0-mobile-lighthouse-baseline` | 모바일 Lighthouse 반복 측정 기준 정리 |
| `docs/v1.1.0-release-notes` | `v1.1.0` 릴리즈 노트 작성 |

## Lighthouse Mobile 비교

| 항목 | `v1.0.0` 배포 버전 | 현재 Production | 변화 |
|---|---:|---:|---:|
| Mobile Performance 1회 측정 | 약 72 | 75 | +3 |

Mobile Performance는 약 `72`에서 `75`로 소폭 개선되었다.

다만 1회 측정값이므로 모바일 성능이 안정적으로 개선되었다고 단정하기보다는, 현재 시점에서 개선 가능성이 확인된 정도로 해석한다.

## 주요 실측 지표

| 지표 | v1.1.0 Production 최종 | 해석 |
|---|---:|---|
| LCP | 약 1.4s | 기존 약 2.1s 기준 대비 개선을 확인했다. |
| FCP | 약 0.2s | 초기 콘텐츠 표시 자체는 빠르게 시작되는 편이다. |
| Speed Index | 약 0.6s | 주요 시각 요소의 표시 속도는 양호한 편이다. |
| TBT | 0ms | 측정 시점 기준 메인 스레드 장기 점유는 크게 드러나지 않았다. |
| CLS | 약 0.001 | 레이아웃 이동은 매우 낮은 수준으로 확인되었다. |

LCP는 `v1.1.0` Production 최종 측정 기준 약 `1.4s`로 확인되어, 현재 단계에서는 양호한 수준으로 판단한다.

다만 지도 타일, Kakao Map SDK, 커스텀 폰트, 마커 이미지 같은 외부/정적 리소스가 LCP 후보와 렌더링 타이밍에 영향을 줄 수 있으므로 반복 측정 기반으로 회귀 여부를 관리한다.

## 초기 공통 개선 대상

`v1.0.0`과 초기 Production을 비교한 결과, 다음 항목은 두 버전 모두에서 공통적으로 개선이 필요한 영역으로 판단했다.

- LCP 개선
- Kakao Map 중심 초기 렌더링 구조 완화
- 지도 타일, 마커 이미지, 커스텀 폰트 등 정적 리소스 최적화
- 모바일 성능 개선
- fallback, loading, empty, error 상태의 체계화
- 개발 환경과 운영 환경의 debug state 분리
- 반복 가능한 성능 측정 자동화 도입

특히 LCP는 PR #9 이후 약 `1.4s` 수준으로 개선 확인되었으므로, `v1.1.0`에서는 추가 구조 변경보다 반복 측정과 회귀 방지를 우선한다.

## `v1.0.0`의 문제점

`v1.0.0`은 핵심 기능 구현과 배포에 성공한 초기 릴리즈였지만, 운영 품질 관점에서는 다음 문제가 있었다.

- 초기 로딩 속도가 충분히 안정화되지 않았다.
- Kakao Map 렌더링 의존도가 높아 지도 SDK, 지도 타일, 마커 이미지 로딩 상태가 초기 화면 경험에 직접적인 영향을 줄 수 있었다.
- Supabase 무료 요금제 일시정지 또는 cold start로 인해 첫 요청이 지연될 가능성이 있었다.
- 지도 fallback 상황에서 사용자에게 제공되는 정보가 제한적이었다.
- SEO 점수가 낮아 공개 페이지의 검색 노출과 문서 구조 개선이 필요했다.
- GitHub Dependabot 알림을 통해 의존성 및 보안 패치 필요성이 확인되었다.
- `v1.0.0` 이후 프로젝트 구조를 안정화하고 유지보수 기준을 정리할 필요가 있었다.
- fallback, loading, empty, error, debug 상태가 운영 품질 관점에서 충분히 분리되어 있지 않았다.
- 성능 측정이 수동 Lighthouse에 의존하고 있어 반복 가능한 자동화 기준선이 부족했다.

## 현재 Production에서 확인된 개선점

현재 Production에서는 fallback store 표시 개선과 PR #9의 로딩 리소스 최적화 이후 초기 화면 체감 속도가 개선되었다.

Lighthouse 수치상으로도 Desktop Performance 평균과 SEO 개선이 확인되었다.

- Desktop Performance: `78.66`에서 `96`으로 개선 확인
- SEO: `54`에서 `100`으로 개선 확인
- Mobile Performance 1회 측정: 약 `72`에서 `75`로 소폭 개선
- LCP: 약 `2.1s`에서 약 `1.4s` 수준으로 개선 확인
- 현재 Production 기준 FCP 약 `0.2s`, Speed Index 약 `0.6s`, TBT `0ms`, CLS 약 `0.001` 확인
- 초기 화면에서 사용자에게 보여줄 fallback 흐름을 보강해 빈 화면으로 느껴지는 시간을 줄이는 방향으로 안정화

다만 이 개선은 모든 병목이 해결되었다는 의미가 아니다.

`v1.1.0` 기준 로딩 안정화 목표는 Production 측정에서 달성한 것으로 보되, 모바일 반복 측정과 회귀 방지는 계속 필요하다.

## 아직 남은 문제

현재 Production에서도 다음 확인 과제는 남아 있다.

- Production LCP 3회 반복 측정 평균을 아직 별도로 문서화하지 않았다.
- 모바일 성능은 1회 측정 기준 `75`로, Desktop 대비 개선 여지가 크다.
- Kakao Map SDK, 지도 타일, 마커 이미지, 커스텀 폰트 같은 외부/정적 리소스 의존도가 여전히 높다.
- Supabase 무료 요금제 특성상 첫 요청 지연 가능성을 모두 제거하기 어렵다.
- debug state와 운영 state를 더 명확히 분리할 필요가 있다.
- loading, fallback, empty, error 상태의 사용자 경험을 더 체계적으로 정리해야 한다.
- 반복 가능한 성능 측정 자동화가 아직 도입되지 않았다.

## `v1.1.0` 안정화 방향

`v1.1.0`은 새로운 기능 확장보다 로딩 안정화와 운영 품질 개선에 초점을 둔다.

- 초기 로딩 안정화
- LCP 개선 후보 탐색
- Kakao Map 렌더링 의존도 완화
- 지도 타일, 커스텀 폰트, 마커 이미지 등 정적 리소스 최적화 검토
- fallback UI와 loading state 개선
- debug state와 production state 환경 분리
- GitHub Dependabot 알림 기반 의존성 및 보안 패치 반영
- 프로젝트 루트 구조 및 의존성 안정화
- Playwright MCP 기반 성능 측정 자동화 기반 마련
- 필요 시 메인페이지 지도 렌더링 로직 리팩토링

## `v1.1.0`에서 다루지 않는 범위

`v1.1.0`은 로딩 안정화와 운영 품질 개선에 초점을 둔다.

따라서 다음 항목은 `v2.0.0` 구조 개선 과제로 분리한다.

- 맛집 등록 플로우 전면 개편
- 지도 클릭 기반 등록 UX 재설계
- 주소 검색, 좌표 저장, 카테고리 선택 흐름 전면 변경
- 전체 페이지 구조 재설계
- 서비스 데이터 흐름 전면 개편
- 지도 중심 구조와 리스트 중심 구조의 역할 재정의

## Playwright MCP 기반 측정 자동화 계획

향후에는 Lighthouse 수동 측정만으로 비교하지 않고, Playwright MCP 기반으로 반복 가능한 성능 측정 흐름을 마련한다.

계획은 다음과 같다.

- Production URL과 Preview URL을 대상으로 동일한 시나리오를 반복 측정한다.
- 홈 진입, 지도 표시, 마커 표시, 목록 스크롤, 상세 진입 같은 핵심 사용자 흐름을 시나리오로 정의한다.
- LCP, FCP, CLS, TBT, Speed Index 같은 지표를 기록하고 회귀 여부를 비교한다.
- 모바일과 데스크톱 조건을 분리해 측정한다.
- 수동 Lighthouse 결과와 자동화 결과의 차이를 문서화한다.
- PR 또는 배포 전 체크리스트에 성능 측정 결과를 연결한다.

## `v2.0.0` 구조적 개선 과제

`v2.0.0`에서는 단순 성능 수치 개선을 넘어 서비스 구조와 사용자 흐름을 재설계한다.

- 맛집 등록 플로우 전면 재설계
- Kakao Map 의존 구조 개선
- 주소 검색, 좌표 저장, 카테고리 선택 흐름 재검토
- 지도 클릭 기반 등록 UX 강화
- 지도 중심 구조와 리스트 중심 구조의 역할 재정의
- fallback, debug, loading, empty, error 상태 설계 전면 개선
- 서비스 운영 관점의 데이터 검증 및 관리 흐름 개선
- 사용자가 지도, 목록, 상세, 등록 화면을 오갈 때의 데이터 흐름 단순화

## 결론

현재 Production은 `v1.0.0` 대비 Desktop Performance, SEO, LCP에서 개선이 확인되었다.

Production 최종 측정 기준 Performance `96`, SEO `100`, LCP 약 `1.4s`를 확인했으므로, `v1.1.0` 기준 로딩 안정화 목표는 달성한 것으로 정리한다.

다만 이 결과는 측정 시점의 Lighthouse 결과이며, Kakao Map과 외부/정적 리소스 의존도는 여전히 남아 있다. 따라서 최종적인 성능 보증으로 보지는 않고, 이후 자동화된 측정 기반 위에서 모바일 성능과 회귀 여부를 계속 관리한다.

이 문서는 단순 성능 점수 기록이 아니라, `v1.0.0` 배포 이후 실제 운영 환경에서 발견한 병목을 기준으로 `v1.1.0` 안정화 작업과 `v2.0.0` 구조 개선 방향을 구분하기 위한 기준선으로 사용한다.
