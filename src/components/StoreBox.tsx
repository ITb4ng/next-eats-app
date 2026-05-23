// components/StoreBox.tsx

import Image from "next/image";
import { AiOutlineClose, AiOutlineInfoCircle, AiOutlinePhone } from "react-icons/ai";
import { PiMapPin } from "react-icons/pi";
import { useRouter } from "next/router";
import { useMapStore } from "@/zustand";
import Like from "./Like";
import { useQuery } from "react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { formatStorePhoneNumber } from "@/lib/phone";

export default function StoreBox() {
  const iconClass = "mt-0.5 h-4 w-4 shrink-0 text-gray-500";
  const { status } = useSession();
  const router = useRouter();
  const store = useMapStore((state) => state.currentStore);
  const setStore = useMapStore((state) => state.setCurrentStore);
  const { data: isLiked } = useQuery(
    ["isLiked", store?.id],
    () => axios.get(`/api/likes?storeId=${store?.id}`).then((r) => r.data.isLiked),
    {
      enabled: !!store?.id && status === "authenticated",
      initialData: store?.isLiked ?? false,
    }
  );

  if (!store) {
    return null;
  }

  const categoryIcon = store.category
    ? `/images/markers/${store.category}.png`
    : "/images/markers/default.png";
  const displayPhone = store.phone ? formatStorePhoneNumber(store.phone) : null;

  return (
    <div className="absolute inset-x-3 bottom-20 z-20 mx-auto w-auto max-w-[420px] rounded-md bg-white text-sm shadow-xl ring-1 ring-black/5 sm:inset-x-0">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gray-50 ring-1 ring-gray-100">
              <Image
                src={categoryIcon}
                width={36}
                height={36}
                alt={store.category ? `${store.category} 아이콘` : "기본 맛집 아이콘"}
                className="h-9 w-9 object-contain"
              />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-gray-900">{store.name || "이름 없는 맛집"}</h2>
              <p className="mt-1 truncate text-sm text-gray-500">
                {store.category || "카테고리 미정"} · {store.storeType || "업종 정보 없음"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Like storeId={store.id} isLiked={Boolean(isLiked)} />
            <button
              type="button"
              aria-label="맛집 정보 닫기"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              onClick={() => setStore(null)}
            >
              <AiOutlineClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm leading-5 text-gray-700">
          <div className="flex gap-2">
            <PiMapPin className={iconClass} />
            <span className="min-w-0 break-words">{store.address || "주소 정보가 없습니다."}</span>
          </div>
          <div className="flex gap-2">
            <AiOutlinePhone className={iconClass} />
            <span>{displayPhone || "연락처 없음"}</span>
          </div>
          <div className="flex gap-2">
            <AiOutlineInfoCircle className={iconClass} />
            <span>{store.foodCertifyName || "인증 정보 없음"}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/stores/${store.id}`)}
        className="min-h-12 w-full rounded-b-md bg-[--color-signature] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[--color-signature-dark]"
      >
        자세히 보기
      </button>
    </div>
  );
}
