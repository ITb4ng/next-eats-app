import React, { useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import { useRouter } from "next/router";

import { useSearchStore } from "@/zustand";
import { StoreType } from "@/interface";
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

  // ✅ 스크롤 위치 복원
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("scrollPosition");
    if (savedScroll) {
      window.scrollTo({ top: parseInt(savedScroll), behavior: "auto" });
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

  // ✅ 뒤로가기 시 검색 상태 복원
  useEffect(() => {
    const { q, district } = router.query;
    if (typeof q === "string") {
      useSearchStore.setState({ q });
    }
    if (typeof district === "string") {
      useSearchStore.setState({ district });
    }
  }, [router.query]);

  // ✅ 무한스크롤 데이터
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
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isLoading,
  } = useInfiniteQuery(["stores", q, district], fetchStores, {
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.totalPage ? nextPage : undefined;
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

  if (isError) {
    return <div>에러 발생</div>;
  }

  return (
    <div className="px-4 md:max-w-4xl mx-auto">
      <SearchFilter />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ul role="list" className="divide-y divide-gray-100">
            {stores?.pages.map((page, index) => (
              <React.Fragment key={index}>
                {page.data.map((store: StoreType, i: number) => (
                  <StoreLikelist key={store.id || i} store={store} i={i} />
                ))}
              </React.Fragment>
            ))}
          </ul>

          {isFetching && <Loader />}
          <div className="w-full touch-none h-10 mb-10" ref={bottomRef} />
        </>
      )}
    </div>
  );
}
