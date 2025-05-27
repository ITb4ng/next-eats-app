// components/StoreBox.tsx

import Image from "next/image";
import {
  AiOutlineClose,
  AiOutlineInfoCircle,
  AiOutlineCheck,
  AiOutlinePhone,
} from "react-icons/ai";
import { useRouter } from "next/router";
import { useMapStore } from "@/zustand";
import Like from "./Like";
import { useQuery } from "react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { PiMapPin } from "react-icons/pi";

export default function StoreBox() {
  const iconClass = "w-4 h-4 mt-1 text-gray-700 text-base";
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

  return (
    <div className="absolute bottom-20 inset-x-0 mx-auto z-20 w-full max-w-[360px] sm:max-w-[480px] bg-white rounded-lg shadow-lg transition text-sm md:text-base">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Image
              src={
                store.category
                  ? `/images/markers/${store.category}.png`
                  : "/images/markers/default.png"
              }
              width={40}
              height={40}
              alt="아이콘 이미지"
            />
            <div className="flex flex-col gap-1">
              <div className="font-bold text-lg">{store.name}</div>
              <div className="text-sm text-gray-500">{store.storeType}</div>
            </div> 
          </div>
          <div className="flex justify-end items-center gap-3">
            <Like storeId={store.id} isLiked={isLiked} />
            <button
              type="button"
              className="text-lg text-gray-500 hover:text-gray-700"
              onClick={() => setStore(null)}
            >
            <AiOutlineClose />
            </button>
          </div>   
         
        </div>

        <div className="text-sm leading-tight">
          <div className="mt-4 flex gap-2 items-center text-gray-700">
            <AiOutlinePhone className="{iconClass}" />
            <span className="font-medium">{store.phone || "-"}</span>
          </div>
          <div className="mt-2 flex gap-2 items-center text-gray-700">
            <AiOutlineInfoCircle className="{iconClass}" />
            {store.foodCertifyName || "-"}
          </div>
          <div className="mt-2 flex gap-2 items-start text-gray-700 break-words">
            <PiMapPin className="{iconClass}" />
            {store.address || "주소가 없습니다."}
          </div>
          <div className="mt-2 flex gap-2 items-center text-gray-700">
            <AiOutlineCheck className="{iconClass}" />
            {store.category || "-"}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/stores/${store.id}`)}
        className="w-full bg-[--color-signature] hover:font-bold py-3 text-white font-normal rounded-b-lg"
      >
        상세보기
      </button>
    </div>
  );
}
