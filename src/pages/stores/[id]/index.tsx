
import { useRouter } from "next/router"
import { useQuery } from "react-query";
import axios from "axios";
import { StoreType } from "@/interface";
import Loader from "@/pages/components/Loader";
import Map from "@/pages/components/Map";
import Marker from "@/pages/components/Marker";
import { toast } from "react-toastify";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function StorePage() {
    const router = useRouter();
    const { id } = router.query;
    const { status } = useSession();
    
    const fetchStore = async () => {
      const { data } = await axios(`/api/stores?id=${id}`);
      return data as StoreType;
    }
    
    const {
      data: store, 
      isFetching,
      isSuccess, 
      isError 
    } = useQuery( `store-${id}`, fetchStore, {
      enabled: !!id,
      refetchOnWindowFocus: false
    });
    
   
    const handleDelete = async () => {
      const confirm = window.confirm("정말 삭제하시겠습니까?");
      if (confirm && store) {
        try {
          const result = await axios.delete(`/api/stores?id=${store?.id}`);

          if (result.status === 200) {
            toast.success("삭제가 완료되었습니다.");
            router.push("/stores");
          } else {
            toast.error("삭제에 실패했습니다.");
          }
        }
        catch (error) {
          console.error("Error deleting store:", error);
          toast.error("삭제에 실패했습니다.");
        }
      }
    };

    if (isError) {
        return (
            <main className="grid h-screen place-items-center pb-10 bg-white px-6 sm:pb-32 lg:px-8">
                <div className="text-center">
                  <p className="text-base font-semibold text-indigo-600">404</p>
                    <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
                        Page not found
                    </h1>
                  <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                      Sorry, we couldn’t find the page you’re looking for.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a
                      href="/"
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Go back home
                    </a>
                    <a href="javascript:void(0);" className="text-sm font-semibold text-gray-900">
                      Contact support <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
            </main>
        );
      }

    if (isFetching) {
        return <Loader className="mt-[20%]"/>;
    }
    
    return(
      <>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="md:flex justify-between items-center py-4 md:py-0">
            <div className="px-4 sm:px-0">
              <h2 className="text-lg font-black text-gray-900">
                {store?.name}
              </h2>
              <p className="mt-1 max-w-2xl text-m text-gray-500">
                {store?.address}
              </p>
            </div>
            { status === 'authenticated' && (
              <div className="flex items-center justify-end gap-4 sm:justify-end sm:py-2">
                <Link href={`/stores/${store?.id}/edit`} className="underline hover:text-gray-600">수정</Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="underline hover:text-gray-600">
                    삭제
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-lg font-medium text-gray-900">카테고리</dt>
                <dd className="mt-1 text-sm/2 text-gray-700 sm:col-span-2 sm:mt-0">{store?.category}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-lg font-medium text-gray-900">연락처</dt>
                <dd className="mt-1 text-sm/2 text-gray-700 sm:col-span-2 sm:mt-0">{store?.phone}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-lg font-medium text-gray-900">업종명</dt>
                <dd className="mt-1 text-sm/2 text-gray-700 sm:col-span-2 sm:mt-0">{store?.storeType}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-lg font-medium text-gray-900">식품인증구분</dt>
                <dd className="mt-1 text-sm/2 text-gray-700 sm:col-span-2 sm:mt-0">{store?.foodCertifyName}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-lg font-medium text-gray-900">위도</dt>
                <dd className="mt-1 text-sm/2 text-gray-700 sm:col-span-2 sm:mt-0">{store?.lat}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-lg font-medium text-gray-900">경도</dt>
                <dd className="mt-1 text-sm/2 text-gray-700 sm:col-span-2 sm:mt-0"> {store?.lng}</dd>
              </div>
            </dl>
          </div>
      </div>
      { isSuccess && (
        <div className="overflow-hidden w-full mb-5 max-w-5xl mx-auto max-h-[600px] sm:-h-[390px]">
          <Map lat={store?.lat} lng={store?.lng} zoom={2}/>
          <Marker store={store}/>
        </div>
      )
      
    }
    <div className="max-w-5xl mx-auto mb-5 flex justify-end">
    <button
          type="button"
          onClick={() => router.push('/stores')}
          className="text-2xl font-medium leading-4 text-gray-900 border border-gray-100 rounded-md"
        >
          목록으로
        </button>
    </div>
    </>
    )
}