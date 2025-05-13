import { CATEGORY_ARR, FOOD_CERTIFY_ARR, STORE_TYPE_ARR } from "@/data/store";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import RegionSearch from "@/components/RegionSearch";
import { StoreType } from "@/interface";
import { useQuery } from "react-query";
import Loader from "@/components/Loader";
import Link from "next/link";

export default function StoreEditPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const fetchStore = async () => {
      const { data } = await axios(`/api/stores?id=${id}`);
      return data as StoreType;
  };
  const { 
    isFetching, 
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
                    <p className="text-2xl font-semibold font-bm text-[--color-signature]">404</p>
                      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                          해당 페이지를 찾을 수 없음.
                      </h1>
                    <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                          페이지가 텅텅 비었네요.
                    </p>
                    <img src="/images/markers/404.png" className="w-[500px] h-[500px] mx-auto min-[320px]:w-[150px] min-[320px]:h-[150px]"/>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                      <Link href="/">
                        <a className="rounded-md bg-[--color-signature] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-50  focus-visible:outline-2 focus-visible:outline-offset-2">
                          홈으로 가기
                        </a>
                      </Link>
                      <a href="javascript:void(0);" className="text-sm font-semibold text-gray-900">
                        개발자에게 문의하기 <span aria-hidden="true">&larr;</span>
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

            {/* 특징 */}
            <div className="sm:col-span-3 sm:col-start-1">
              <label htmlFor="foodCertifyName" className="block text-sm font-medium leading-6 text-gray-900">
                구분
              </label>
              <div className="mt-2">
                <select
                  {...register("foodCertifyName", { required: true })}
                  className={`block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    errors?.foodCertifyName ? "animate-shake ring-red-500" : ""
                  }`}
                >
                  <option value="">구분 선택</option>
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
          className="text-sm font-semibold leading-6 text-gray-900 border border-gray-700 px-6 py-3 rounded-md hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:-inset-1 shadow-sm"
        >
          뒤로가기
        </button>
        <button
          type="submit"
          className="rounded-md leading-6 bg-[--color-signature] px-6 py-3 text-sm font-normal text-white shadow-sm hover:font-medium focus-visible:outline focus-visible:outline-2 focus-visible:-inset-1"
        >
          수정하기
        </button>
      </div>
    </form>
  );
}


// 19:11  Error: 'store' is assigned a value but never used.  @typescript-eslint/no-unused-vars
// 21:5  Error: 'isSuccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
// 58:21  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
// 58:21  Warning: img elements must have an alt prop, either with meaningful text, or an empty string for decorative images.  jsx-a11y/alt-text
// 60:23  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages