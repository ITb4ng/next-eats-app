// pages/stores/[id]/index.tsx

import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { StoreType } from "@/interface";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import axios from "axios";
import Loader from "@/pages/components/Loader";
import Map from "@/pages/components/Map";
import Marker from "@/pages/components/Marker";
import Link from "next/link";
import Like from "@/pages/components/Like";
import Comments from "@/pages/components/comments";

export default function StorePage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession();

  // 1) store 정보 불러오기
  const { data: store, isFetching, isError, isSuccess } = useQuery<StoreType>(
    ["store", id],
    () => axios.get(`/api/stores?id=${id}`).then((r) => r.data),
    { enabled: !!id }
  );

  // 2) 찜 여부 불러오기
  const { data: likeData, isLoading: likeLoading } = useQuery<boolean>(
    ["isLiked", store?.id],
    () =>
      axios
        .get<{ isLiked: boolean }>(`/api/likes?storeId=${store?.id}`)
        .then((r) => r.data.isLiked),
    {
      enabled: !!store?.id && status === "authenticated",
      initialData: store?.isLiked ?? false,
    }
  );

  const handleDelete = async () => {
    if (!store) return;
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const result = await axios.delete(`/api/stores?id=${store.id}`);
      if (result.status === 200) {
        toast.success("삭제가 완료되었습니다.");
        router.push("/stores");
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  if (isError) {
    return (
      <main className="grid h-screen place-items-center bg-white px-6">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-5xl font-semibold text-gray-900 sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg text-gray-500">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go back home
            </Link>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (isFetching) {
    return <Loader className="mt-[20%]" />;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="md:flex justify-between items-center py-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">{store?.name}</h2>
            <p className="mt-1 text-gray-500">{store?.address}</p>
          </div>
          {status === "authenticated" && (
            <div className="flex items-center gap-4 mt-8 min-[310px]:justify-end">
              {likeLoading ? (
                <Loader className="w-8 h-8 rounded-full bg-gray-200" />
              ) : (
                <Like storeId={store!.id} isLiked={likeData!} />
              )}
              <Link
                href={`/stores/${store?.id}/edit`}
                className="underline hover:text-gray-600 min-[310px]:text-base"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="underline hover:text-gray-600 min-[310px]:text-base"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            {[
              ["카테고리", store?.category],
              ["연락처", store?.phone],
              ["업종명", store?.storeType],
              ["식품인증구분", store?.foodCertifyName],
              ["위도", store?.lat],
              ["경도", store?.lng],
            ].map(([dt, dd], idx) => (
              <div
                key={idx}
                className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
              >
                <dt className="text-lg font-medium text-gray-900">{dt}</dt>
                <dd className="mt-1 text-gray-700 sm:col-span-2 sm:mt-0">
                  {dd ?? ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {isSuccess && (
        <>
        <div className="max-w-5xl mx-auto mb-5">
          <Map lat={store?.lat} lng={store?.lng} zoom={2} />
          <Marker store={store!} />
        </div>
        <Comments storeId={store?.id}/>
        </>
      )}

      <div className="max-w-5xl mx-auto mb-5 flex justify-end">
        <button
          onClick={() => router.push("/stores")}
          className="border border-gray-100 px-4 py-2 rounded-md text-gray-900"
        >
          목록으로
        </button>
      </div>
    </>
  );
}
