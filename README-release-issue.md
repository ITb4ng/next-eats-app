# 🔥 Hotfix: Navbar 및 UI 오류 수정 (`hotfix/release-issue`)

## 🐛 Bug Fixes

- **Navbar가 `/store` 진입 시 작동하지 않던 문제 수정**
- **모바일 메뉴 토글이 작동하지 않던 이슈 해결**
- `status === "loading"` 상태 처리 로직 추가로 페이지 깜빡임 방지
- `useEffect` 훅 사용 순서 오류 (Rendered more hooks than during the previous render) 수정
- 로고 클릭 시 포커스 보더가 **타원형으로 표시되던 문제 해결**
- `:focus-visible` 사용으로 **접근성과 시각 스타일** 모두 만족하도록 수정

## 💄 Style & Accessibility

- 모바일 및 데스크탑 **양쪽에서 자연스러운 사용자 경험 제공**
- `font-bm`, 버튼 스타일 등 **UI 통일성 향상**
- 포커스 스타일 (`box-shadow`)로 인한 시각 오류 제거

## 🛠️ UI 개선 사항

- **모바일 메뉴 애니메이션 안정화**
- 메뉴 클릭 시 **자동 닫힘 처리**로 UX 개선
- 로그인/로그아웃 버튼 클릭 시에도 메뉴 자동 닫힘 적용

## 💄 맛집 목록 무한 스크롤 오류
- 검색필터로 인한 컴포넌트 렌더링 충돌로 발생
- debounce로 텀을 두어 작동하게 끔 개선


> 해당 브랜치는 위와 같은 긴급 UI 수정사항들을 해결하기 위해 생성되었습니다.