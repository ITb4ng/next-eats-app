import React, { useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import { useRouter } from "next/router";

import { useSearchStore } from "@/zustand";
import { StoreApiResponse, StoreType } from "@/interface";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

import Loading from "@/components/Loading";
import Loader from "@/components/Loader";
import SearchFilter from "@/components/SearchFilter";
import StoreLikelist from "@/components/StoreLikelist";

export default function StoreListPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const intersection = useIntersectionObserver(bottomRef, {});
  const shouldLoadMore = !!intersection?.isIntersecting;

  const router = useRouter();
  const q = useSearchStore((state) => state.q);
  const district = useSearchStore((state) => state.district);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("scrollPosition");
    if (savedScroll) {
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    const { q, district } = router.query;
    if (typeof q === "string") {
      useSearchStore.setState({ q });
    }
    if (typeof district === "string") {
      useSearchStore.setState({ district });
    }
  }, [router.query]);

  const fetchStores = async ({ pageParam = 1 }): Promise<StoreApiResponse> => {
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
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isLoading,
  } = useInfiniteQuery(["stores", q, district], fetchStores, {
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.page ?? 1) + 1;
      return nextPage <= (lastPage.totalPage ?? 1) ? nextPage : undefined;
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  const fetchNext = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage().catch(console.error);
    }
  }, [fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (shouldLoadMore && !isFetchingNextPage) {
      const timeout = setTimeout(fetchNext, 300);
      return () => clearTimeout(timeout);
    }
  }, [shouldLoadMore, fetchNext, isFetchingNextPage]);

  const storeItems = stores?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = stores?.pages[0]?.totalCount ?? storeItems.length;
  const hasActiveFilter = Boolean(q || district);

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <SearchFilter />
        <div className="mt-6 rounded-md border border-red-100 bg-red-50 px-5 py-8 text-center">
          <p className="text-base font-semibold text-red-700">맛집 목록을 불러오지 못했습니다.</p>
          <p className="mt-2 text-sm text-red-600">잠시 후 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <SearchFilter />

      {isLoading ? (
        <div className="rounded-md border border-gray-100 bg-white px-4 py-10">
          <Loading />
          <p className="mt-4 text-center text-sm text-gray-500">맛집 정보를 불러오는 중입니다.</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {hasActiveFilter ? "검색 조건에 맞는 맛집" : "전체 맛집"}{" "}
              <span className="font-semibold text-gray-900">{totalCount}</span>곳
            </p>
            {district && (
              <p className="text-gray-500">
                선택 지역: <span className="font-medium text-gray-700">{district}</span>
              </p>
            )}
          </div>

          {storeItems.length > 0 ? (
            <ul role="list" className="space-y-3">
              {stores?.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page.data.map((store: StoreType, i: number) => (
                    <StoreLikelist key={store.id || i} store={store} i={i} />
                  ))}
                </React.Fragment>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-5 py-12 text-center">
              <p className="text-base font-semibold text-gray-900">조건에 맞는 맛집이 없습니다.</p>
              <p className="mt-2 text-sm text-gray-500">
                검색어 또는 지역 필터를 변경해 다시 확인해 주세요.
              </p>
            </div>
          )}

          {isFetchingNextPage && !isLoading && <Loader />}
          <div className="h-10 w-full touch-none mb-10" ref={bottomRef} />
        </>
      )}
    </div>
  );
}
