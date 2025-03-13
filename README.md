
참고 https://react-select.com/home <br>
![image](https://github.com/user-attachments/assets/866afe2f-ad4a-429e-b0ed-1b410fcaadd4)
```bash
# SearchFilter.tsx
import { CiSearch } from "react-icons/ci";
import { 
  REGION_ARR,
  ColourOption,
  colourOptions,
  FlavourOption,
  GroupedOption,
  groupedOptions,
 } from "@/data/region";
import React, { CSSProperties } from 'react';
import Select from 'react-select';


const groupStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
const groupBadgeStyles: CSSProperties = {
  backgroundColor: '#EBECF0',
  borderRadius: '2em',
  color: '#172B4D',
  display: 'inline-block',
  fontSize: 12,
  fontWeight: 'normal',
  lineHeight: '1',
  minWidth: 1,
  padding: '0.16666666666667em 0.5em',
  textAlign: 'center',
};

const formatGroupLabel = (data: GroupedOption) => (
  <div style={groupStyles}>
    <span>{data.label}</span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);
 

export default function SearchFilter() {
    return (
      <div className="flex flex-col md:flex-row gap-2 my-4">
          <div className="flex items-center justify-center w-full">
            <CiSearch className="w-9 h-9 pr-3"/>
            <input 
              type="search" 
              placeholder="맛집 검색"
              className="block w-full p-2 text-base text-gray-800 border border-gray-300 rounded-lg bg-gray-100 focus:border-blue-500 outline-none"
            />
          </div>
          <Select<ColourOption | ColourOption, false, GroupedOption>
            defaultValue={colourOptions[1]}
            options={groupedOptions}
            formatGroupLabel={formatGroupLabel}
            />
      </div>
      
    );
}
```

```bash
# retion.ts
export const SEOUL_DISTRICT_ARR = [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
]

export const REGION_ARR = [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
    "경기도",
    "충청북도",
    "충청남도",
    "전라남도",
    "경상북도",
    "경상남도",
    "강원특별자치도",
    "전북특별자치도",
    "경기도",
]
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

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


