// StoreListPage.tsx
import React, { useRef, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import { useInfiniteQuery } from "react-query";

import { useSearchStore } from "@/zustand";

import { StoreType } from "@/interface";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import Loading from "../components/Loading";
import Loader from "../components/Loader";
import SearchFilter from "../components/SearchFilter";

export default function StoreListPage() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const pageRef = useIntersectionObserver(ref, {});
  const isPageEnd = !!pageRef?.isIntersecting;

  // const [q, setQ] = useState<string>("");
  // const [district, setDistrict] = useState<string>("");

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
          <p className="text-base font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-xs font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            요청하신 페이지를 찾을 수 없습니다.
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              홈으로
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              방성환에게 문의하기<span aria-hidden="true">&rarr;</span>
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
              {page.data.map((store: StoreType) => (
                <li
                  key={store.id}
                  className="flex justify-between gap-x-6 py-5 cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/stores/${store.id}`)}
                >
                  <div className="flex gap-x-4">
                    <Image
                      src={
                        store?.category
                          ? `/images/markers/${store?.category}.png`
                          : "/images/markers/default.png"
                      }
                      width={48}
                      height={48}
                      alt="아이콘 이미지"
                    />
                    <div>
                      <div className="text-sm font-semibold leading-6 text-gray-900">
                        {store?.name}
                      </div>
                      <div className="mt-1 text-xs truncate font-semibold leading-5 text-gray-500">
                        {store?.storeType}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <div className="text-sm font-semibold leading-6 text-gray-900">
                      {store?.address}
                    </div>
                    <div className="mt-1 text-xs truncate font-semibold leading-5 text-gray-500">
                      {store?.phone || "번호없음"} | {store?.foodCertifyName} | {store?.category}
                    </div>
                  </div>
                </li>
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