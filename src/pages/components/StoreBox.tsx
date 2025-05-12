// components/StoreBox.tsx

import Image from "next/image";
import {
  AiOutlineClose,
  AiOutlineInfoCircle,
  AiOutlineCheck,
  AiOutlinePhone,
} from "react-icons/ai";
import { HiOutlineMapPin } from "react-icons/hi2";
import { useRouter } from "next/router";
import { useMapStore } from "@/zustand";
import Like from "./Like";
import { useQuery } from "react-query";
import { useSession } from "next-auth/react";
import axios from "axios";


export default function StoreBox() {
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
    <div className="transition ease-in-out delay-150 inset-x-0 mx-auto bottom-20 rounded-lg shadow-lg max-w-sm md:max-w-xl absolute z-20 w-full bg-white">
      <div className="p-8">
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

        <div className="mt-4 flex gap-2 items-center text-gray-700">
          <AiOutlinePhone />
          {store.phone || "-"}
        </div>
        <div className="mt-2 flex gap-2 items-center text-gray-700">
          <AiOutlineInfoCircle />
          {store.foodCertifyName || "-"}
        </div>
        <div className="mt-2 flex gap-2 items-center text-gray-700">
          <HiOutlineMapPin />
          {store.address || "주소가 없습니다."}
        </div>
        <div className="mt-2 flex gap-2 items-center text-gray-700">
          <AiOutlineCheck />
          {store.category || "-"}
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/stores/${store.id}`)}
        className="w-full bg-blue-600 hover:bg-blue-500 py-3 text-white font-medium rounded-b-lg"
      >
        상세보기
      </button>
    </div>
  );
}
