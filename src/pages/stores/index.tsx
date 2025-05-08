// StoreListPage.tsx
import React, { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";

import { useSearchStore } from "@/zustand";

import { StoreType } from "@/interface";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import Loading from "../components/Loading";
import Loader from "../components/Loader";
import SearchFilter from "../components/SearchFilter";
import StoreLikelist from "../components/StoreLikelist";

export default function StoreListPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const pageRef = useIntersectionObserver(ref, {});
  const isPageEnd = !!pageRef?.isIntersecting;


  const q = useSearchStore((state) => state.q);
  const district = useSearchStore((state) => state.district);

  const fetchStores = async ({ pageParam = 1 }) => {
    const { data } = await axios.get("/api/stores", {
      params: {
        limit: 10,
        page: pageParam,
        q: q || undefined,
        district: district || undefined,
      },
    });
    return data;
  };

  const {
    data: stores,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isLoading,
  } = useInfiniteQuery(["stores", q, district], fetchStores, {
    getNextPageParam: (lastPage: any) =>
      lastPage.data?.length > 0 ? lastPage.page + 1 : undefined,
    keepPreviousData: false,
  });

  const fetchNext = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage().catch(console.error);
    }
  }, [fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (isPageEnd) {
      const timeout = setTimeout(() => {
        fetchNext();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isPageEnd, fetchNext]);

  if (isError) {
    return (
      <main className="grid h-screen place-items-center pb-10 bg-white px-6 sm:pb-32 lg:px-8">
        <div className="text-center">
          <p className="text-2xl font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-xs font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            요청하신 페이지를 찾을 수 없습니다.
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            style={{
              backgroundColor: 'rgb(42, 193, 188)',  // 버튼 기본 배경 색
              color: 'white',  // 텍스트 색
              padding: '10px 14px',  // 패딩
              fontSize: '14px',  // 폰트 크기
              fontWeight: '600',  // 폰트 굵기
              borderRadius: '0.375rem',  // 테두리 둥글기
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',  // 그림자 효과
              transition: 'background-color 0.3s ease',  // 색상 변경시 부드러운 전환
            }}
          >
            홈으로
          </a>
          <a
            href="javascript:void(0);"
            className="text-sm font-semibold text-gray-900 border border-gray-200 py-[10px] px-[14px] rounded-md hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            방성환에게 문의하기
            <span aria-hidden="true">&rarr;</span>
          </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="px-4 md:max-w-4xl mx-auto py-8">
      <SearchFilter />
      <ul role="list" className="divide-y divide-gray-100">
        {isLoading ? (
          <Loading />
        ) : (
          stores?.pages.map((page, index) => (
            <React.Fragment key={index}>
              {page.data.map((store: StoreType, i:number) => (
                <StoreLikelist store={store} i={i} key={i} />
              ))}
            </React.Fragment>
          ))
        )}
      </ul>

      {(isFetching || isFetchingNextPage) && <Loader />}
      <div className="w-full touch-none h-10 mb-10" ref={ref} />
    </div>
  );
}