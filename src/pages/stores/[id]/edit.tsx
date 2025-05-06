import { CATEGORY_ARR, FOOD_CERTIFY_ARR, STORE_TYPE_ARR } from "@/data/store";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import RegionSearch from "../../components/RegionSearch";
import { StoreType } from "@/interface";
import { useQuery } from "react-query";
import Loader from "@/pages/components/Loader";

export default function StoreEditPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const fetchStore = async () => {
      const { data } = await axios(`/api/stores?id=${id}`);
      return data as StoreType;
  };
  const { 
    data: store, 
    isFetching, 
    isSuccess, 
    isError 
  } = useQuery(`store-${id}`, fetchStore,{
    onSuccess: (data) => {
      setValue("id", data.id);
      setValue("name", data.name);
      setValue("category", data.category);
      setValue("lat", data.lat);
      setValue("lng", data.lng);
      setValue("phone", data.phone);
      setValue("address", data.address);
      setValue("foodCertifyName", data.foodCertifyName);
      setValue("storeType", data.storeType);
    },
    refetchOnWindowFocus: false,
  });
  
  

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm <StoreType> ();
 
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
  
  return (
    <form
      className="px-4 md:max-w-4xl mx-auto py-8 h-screen"
      onSubmit={handleSubmit(async (data) => {
        try {
          const result = await axios.put("/api/stores", data);
          if (result.status === 200) {
            toast.success("수정이 완료됐습니다.");
            router.replace(`/stores/${result?.data?.id}`);
          } else {
            toast.error("다시 시도해주세요");
          }
        } catch (e) {
          console.log(e);
          toast.error("수정 중 문제가 생겼습니다. 다시 시도해주세요.");
        }
      })}
    >
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-xl font-semibold leading-7 text-gray-900">수정 사항</h2>
          <p className="mt-1 text-lg leading-6 text-gray-600">
            수정 사항을 입력해주세요
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* 가게명 */}
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                가게명
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 outline-none px-2 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    errors?.name ? "animate-shake ring-red-500" : ""
                  }`}
                />
                {errors?.name && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>

            {/* 카테고리 */}
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                카테고리
              </label>
              <div className="mt-2">
                <select
                  {...register("category", { required: true })}
                  className={`block w-full rounded-md border-0 px-2 outline-none py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    errors?.category ? "animate-shake ring-red-500" : ""
                  }`}
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORY_ARR?.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors?.category && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>

            {/* 연락처 */}
            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                연락처
              </label>
              <div className="mt-2">
                <input
                  placeholder="010-0000-0000"
                  {...register("phone", { required: true })}
                  className={`block w-[74%] rounded-md border-0 outline-none px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:w-full sm:text-sm sm:leading-6 ${
                    errors?.phone ? "animate-shake ring-red-500" : ""
                  }`}
                />
                {errors?.phone && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>

            {/* 주소 */}
            <RegionSearch 
            setValue={setValue} 
            register={register} 
            errors={errors}/>

            {/* 식품인증구분 */}
            <div className="sm:col-span-3 sm:col-start-1">
              <label htmlFor="foodCertifyName" className="block text-sm font-medium leading-6 text-gray-900">
                식품인증구분
              </label>
              <div className="mt-2">
                <select
                  {...register("foodCertifyName", { required: true })}
                  className={`block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    errors?.foodCertifyName ? "animate-shake ring-red-500" : ""
                  }`}
                >
                  <option value="">식품인증구분 선택</option>
                  {FOOD_CERTIFY_ARR?.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
                {errors?.foodCertifyName && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>

            {/* 업종구분 */}
            <div className="sm:col-span-3">
              <label htmlFor="storeType" className="block text-sm font-medium leading-6 text-gray-900">
                업종구분
              </label>
              <div className="mt-2">
                <select
                  {...register("storeType", { required: true })}
                  className={`block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    errors?.storeType ? "animate-shake ring-red-500" : ""
                  }`}
                >
                  <option value="">업종구분 선택</option>
                  {STORE_TYPE_ARR?.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
                {errors?.storeType && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          뒤로가기
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          수정하기
        </button>
      </div>
    </form>
  );
}
