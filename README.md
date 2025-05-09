# 250509
우아한형제들에서 글림체 컨셉에 맞게 favicon 등록

로그인한 사용자별 좋아요가 각각 다르게 표출 되게끔 수정

# 250508
좋아요한 맛집들 모아볼 수 있는 컴포넌츠 추가

# 250507
Store 데이터에 맛집 좋아요 기능 추가

배민 폰트 적용

배민 폰트 적용으로 기존 공통된 컴포넌트 UI 일관성 있게 유지보수 

# 250506
폼으로 생성된 데이터 수정, 생성, 삭제, 조회 기능 완성

# 250504
<h2>
 <a href="https://react-hook-form.com/">React-hook-form
</h2><br>
react-hook-form으로 생성한 다음 PostCode 검색 추가 해당 필드 UI수정

json Store 정보와 일치하게 수정

# 250503
react-hook-form으로 맛집 등록 폼 생성

외부 사용자 및 스코프를 벗어나는 에러와 보안 취약점 개선


# 250429
Zustand를 사용해 검색어(q)와 지역(district) 상태를 전역 관리

React Query를 통해 무한 스크롤 기반의 Store 리스트 데이터를 요청

Intersection Observer로 리스트 끝에 도달 시 다음 페이지 자동 로드

# 250425
Zustand 적용 및 검색 필터 Ui 수정 및 춘천시 추가

# <del>250327</del>
<strong>전역 상태 Recoil사용</strong>
<li>Next15, React19에서 Recoil 향후 업데이트 중단 및 호환성 이슈</li>

![image](https://github.com/user-attachments/assets/06ee9ddc-7b07-483c-898d-7b166575315c)
<h2><a href="https://zustand.docs.pmnd.rs/guides/typescript">Zustand</a></h2>
<li> 기존 Map, Markers 컴포넌트 리팩토링</li>
<li> Type Error에 따른 Zustand 라이브러리 채택</li>

# <del>250323</del>
<li>
  <del>기존 참고 React Select UI 제거 https://react-select.com/home </del>  
</li>
<li>
  region.ts 춘천시 읍면동 추가  
</li>
<li>
  검색 & 정렬 Ui Tailwind로 대체
</li>
<li>
  검색필터 및 자치구 선택에 따른 전역상태 추가와 데이터 재정제 필요
</li>


## This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).




## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.


