import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { StoreType } from "@/interface";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import axios from "axios";
import Loader from "@/components/Loader";
import Map from "@/components/Map";
import Marker from "@/components/Marker";
import Link from "next/link";
import Like from "@/components/Like";
import Comments from "@/components/comments";
import Image from "next/image";
import { formatStorePhoneNumber } from "@/lib/phone";

export default function StorePage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession();

  const {
    data: store,
    isLoading,
    isError,
    isSuccess,
  } = useQuery<StoreType | null>(["store", id], () => axios.get(`/api/stores?id=${id}`).then((r) => r.data), {
    enabled: !!id,
  });

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
    const confirmDelete = window.confirm("맛집 정보를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const result = await axios.delete(`/api/stores?id=${store.id}`);
      if (result.status === 200) {
        toast.success("맛집 정보를 삭제했습니다.");
        router.push("/stores");
      } else {
        toast.error("맛집 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("맛집 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };
  const displayPhone = store?.phone ? formatStorePhoneNumber(store.phone) : null;

  if (isError || (!isLoading && !store)) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 py-16">
        <div className="max-w-md text-center">
          <p className="text-2xl font-semibold font-bm text-[--color-signature]">404</p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">맛집 정보를 찾을 수 없습니다.</h1>
          <p className="mt-4 text-base text-gray-500">주소가 바뀌었거나 삭제된 맛집일 수 있습니다.</p>
          <Image
            src="/images/markers/404.png"
            width={180}
            height={180}
            alt="맛집 정보를 찾을 수 없는 상태"
            className="mx-auto mt-6 h-[180px] w-[180px] object-contain"
          />
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/stores"
              className="rounded-md bg-[--color-signature] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[--color-signature-dark]"
            >
              목록으로 가기
            </Link>
            <button type="button" onClick={() => router.back()} className="text-sm font-semibold text-gray-700">
              뒤로가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading || !id) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20">
        <Loader className="mx-auto" />
        <p className="mt-4 text-center text-sm text-gray-500">맛집 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>{store?.category || "카테고리 미정"}</span>
              <span aria-hidden="true">·</span>
              <span>{store?.storeType || "업종 정보 없음"}</span>
            </div>
            <h1 className="mt-2 break-words text-2xl font-bold text-gray-900">{store?.name}</h1>
            <p className="mt-2 break-words text-sm leading-6 text-gray-600">{store?.address}</p>
          </div>

          {status === "authenticated" && (
            <div className="flex shrink-0 items-center justify-end gap-2">
              {likeLoading ? (
                <Loader className="h-10 w-10 rounded-full bg-gray-100" />
              ) : (
                <Like storeId={store!.id} isLiked={Boolean(likeData)} />
              )}
              {store?.id && (
                <Link
                  href={`/stores/${store.id}/edit`}
                  className="inline-flex min-h-10 items-center rounded-md border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  수정
                </Link>
              )}
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex min-h-10 items-center rounded-md border border-gray-200 px-3 text-sm font-semibold text-red-500 hover:border-red-200 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <dl className="mt-6 divide-y divide-gray-100 rounded-md border border-gray-200 bg-white">
          {[
            ["카테고리", store?.category],
            ["연락처", displayPhone],
            ["업종명", store?.storeType],
            ["인증 구분", store?.foodCertifyName],
            ["위도", store?.lat],
            ["경도", store?.lng],
          ].map(([dt, dd]) => (
            <div key={String(dt)} className="grid grid-cols-1 gap-1 px-4 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-semibold text-gray-900">{dt}</dt>
              <dd className="break-words text-sm text-gray-700 sm:col-span-2">{dd ?? "정보 없음"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {isSuccess && store && (
        <>
          <div className="mx-auto mb-5 max-w-5xl px-4">
            <Map lat={store.lat} lng={store.lng} zoom={2} />
            <Marker store={store} />
          </div>
          <Comments storeId={store.id} />
        </>
      )}

      <div className="mx-auto mb-8 flex max-w-5xl justify-end px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-11 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          뒤로가기
        </button>
      </div>
    </>
  );
}
