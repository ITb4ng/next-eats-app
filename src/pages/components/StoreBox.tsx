import Image from "next/image";
import { 
  AiOutlineClose, 
  AiOutlineInfoCircle, 
  AiOutlineCheck, 
  AiOutlinePhone, } from "react-icons/ai";
import { HiOutlineMapPin } from "react-icons/hi2";
import { useRouter } from "next/router";
import { useMapStore } from "@/zustand";
import Like from "./Like";


export default function StoreBox() {
    const router = useRouter();
    const store = useMapStore((state) => state.currentStore); // 상태를 가져옴
    const setStore = useMapStore((state) => state.setCurrentStore); // Setter
    return (
      <div className="active transition ease-in-out delay-150 inset-x-0 mx-auto bottom-20 rounded-lg shadow-lg max-w-sm md:max-w-xl absolute z-20 w-full bg-white">
          {store && (
            <>
              <div className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <Image 
                      src={
                        store?.category 
                        ? `/images/markers/${store?.category}.png` // 이미지 경로
                        : "/images/markers/default.png"
                      }
                      width={40}
                      height={40}
                      alt="아이콘 이미지"
                      />
                      <div className="flex justify-center gap-4">
                        <div className="font-bold">{store?.name}</div>
                        <div className="font-sm">{store?.storeType}</div>
                        <Like storeId={store.id} />
                      </div>
                      
                  </div>
                  <button type="button" className="text-lg" 
                    onClick={(

                    )=> 
                    setStore(null)}>
                    <AiOutlineClose />
                    </button>
                </div>
                <div className="mt-4 flex gap-2 items-center">
                  <AiOutlinePhone />
                    {store?.phone}
                </div>
                <div className="mt-4 flex gap-2 items-center">
                  <AiOutlineInfoCircle />
                    {store?.foodCertifyName}
                </div>
                <div className="mt-4 flex gap-2 items-center col-span-3">
                  <HiOutlineMapPin />
                  {store?.address || "주소가 없습니다."}
                </div>
                <div className="mt-4 flex gap-2 items-center">
                  <AiOutlineCheck />
                    {store?.category}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => router.push(`/stores/${store.id}`)} 
                className="w-full bg-blue-700 hover:bg-blue-500 focus:bg-blue-500 py-3 text-white font-medium rounded-b-lg"
              >
                상세보기
              </button> 
            </>
          )}
      </div>
    );
}