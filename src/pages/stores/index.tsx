import React, { useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";

import { useSearchStore } from "@/zustand";
import { StoreType } from "@/interface";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

import Loading from "../components/Loading";
import Loader from "../components/Loader";
import SearchFilter from "../components/SearchFilter";
import StoreLikelist from "../components/StoreLikelist";

const ErrorPage = () => (
  <main className="grid h-screen place-items-center pb-10 bg-white px-6 sm:pb-32 lg:px-8">
    <div className="text-center">
      <p className="text-2xl font-semibold text-indigo-600">404</p>
      <h1 className="mt-4 text-xs font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
        요청하신 페이지를 찾을 수 없습니다.
      </h1>
      <p className="mt-6 text-lg font-medium text-gray-500 sm:text-xl">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/"
          className="bg-teal-500 text-white py-2 px-3.5 text-sm font-semibold rounded-md shadow-sm hover:bg-teal-600 transition-colors"
        >
          홈으로
        </a>
        <a
          href="#"
          className="text-sm font-semibold text-gray-900 border border-gray-200 py-2 px-3.5 rounded-md hover:bg-gray-100"
        >
          방성환에게 문의하기 <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  </main>
);

export default function StoreListPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const intersection = useIntersectionObserver(ref, {});
  const isPageEnd = !!intersection?.isIntersecting;

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
      const timeout = setTimeout(fetchNext, 300);
      return () => clearTimeout(timeout);
    }
  }, [isPageEnd, fetchNext]);

  if (isError) return <ErrorPage />;

  return (
    <div className="px-4 md:max-w-4xl mx-auto py-8">
      <SearchFilter />

      {isLoading ? (
        <Loading />
      ) : (
        <ul role="list" className="divide-y divide-gray-100">
          {stores?.pages.map((page, index) => (
            <React.Fragment key={index}>
              {page.data.map((store: StoreType, i: number) => (
                <StoreLikelist key={store.id || i} store={store} i={i} />
              ))}
            </React.Fragment>
          ))}
        </ul>
      )}

      {(isFetching || isFetchingNextPage) && <Loader />}
      <div className="w-full touch-none h-10 mb-10" ref={ref} />
    </div>
  );
}
