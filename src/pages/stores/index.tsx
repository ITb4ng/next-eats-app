import React, { useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import { useRouter } from "next/router"; // useRouter 추가

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
      <p className="text-2xl font-semibold font-bm text-[--color-signature]">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
        해당 페이지를 찾을 수 없음.
      </h1>
      <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
        페이지가 텅텅 비었네요.
      </p>
      <img
        src="/images/markers/404.png"
        className="w-[500px] h-[500px] mx-auto min-[320px]:w-[150px] min-[320px]:h-[150px]"
      />
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/"
          className="rounded-md bg-[--color-signature] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-50  focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Go back home
        </a>
        <a href="javascript:void(0);" className="text-sm font-semibold text-gray-900">
          Contact support <span aria-hidden="true">&larr;</span>
        </a>
      </div>
    </div>
  </main>
);

export default function StoreListPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const intersection = useIntersectionObserver(ref, {});
  const isPageEnd = !!intersection?.isIntersecting;
  const router = useRouter();

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

  // 뒤로가기 시 URL에서 쿼리 파라미터를 읽어 상태 복원
  useEffect(() => {
    const { q, district } = router.query;
    if (typeof q === "string") {
      useSearchStore.setState({ q });
    }
    if (typeof district === "string") {
      useSearchStore.setState({ district });
    }
  }, [router.query]);
  // 초기화 버튼 클릭 시 상태 초기화

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
