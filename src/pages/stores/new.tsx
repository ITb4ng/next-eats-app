import { CATEGORY_ARR, FOOD_CERTIFY_ARR, STORE_TYPE_ARR } from "@/data/store";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import RegionSearch from "../components/RegionSearch";
import { StoreType } from "@/interface";
import { useEffect, useRef } from "react";

export default function StoreNewPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors },
  } = useForm<StoreType>();

  const phone = watch("phone");
  const isMounted = useRef(false); // 🔹 mount 여부 추적

  useEffect(() => {
  // 첫 번째 오류 필드로 포커스 이동
  const firstErrorField = Object.keys(errors)[0]; // 오류가 있는 필드의 첫 번째 항목
  if (firstErrorField) {
    setFocus(firstErrorField as keyof StoreType); // 첫 번째 오류 필드로 포커스 이동
  }
  }, [errors, setFocus]); // errors가 변경될 때마다 실행

  // 연락처 자동 하이픈 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const onlyNums = value.replace(/\D/g, "");

    if (/^01[0-9]/.test(onlyNums)) {
      if (onlyNums.length <= 3) return onlyNums;
      if (onlyNums.length <= 7) return onlyNums.replace(/(\d{3})(\d+)/, "$1-$2");
      return onlyNums.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    }

    if (/^02/.test(onlyNums)) {
      if (onlyNums.length <= 2) return onlyNums;
      if (onlyNums.length <= 5) return onlyNums.replace(/(\d{2})(\d+)/, "$1-$2");
      if (onlyNums.length === 9) return onlyNums.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
      return onlyNums.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
    }

    if (/^0[3-6][0-9]/.test(onlyNums)) {
      if (onlyNums.length <= 3) return onlyNums;
      if (onlyNums.length <= 6) return onlyNums.replace(/(\d{3})(\d+)/, "$1-$2");
      if (onlyNums.length === 10) return onlyNums.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      return onlyNums.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }

    return onlyNums;
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const formatted = formatPhoneNumber(phone || "");
    if (formatted !== phone) {
      setValue("phone", formatted, { shouldValidate: true });
    }
  }, [phone, setValue]);

  return (
    <form
      className="px-4 md:max-w-4xl mx-auto py-8"
      onSubmit={handleSubmit(async (data) => {
        try {
          const result = await axios.post("/api/stores", data);
          if (result.status === 200) {
            toast.success("맛집을 등록했습니다.");
            router.replace(`/stores/${result?.data?.id}`);
          } else {
            toast.error("다시 시도해주세요");
          }
        } catch (e) {
          console.log(e);
          toast.error("데이터 생성중 문제가 생겼습니다. 다시 시도해주세요.");
        }
      })}
    >
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-xl font-semibold leading-7 text-gray-900">맛집 등록</h2>
          <p className="mt-1 text-lg leading-6 text-gray-600">
            아래 내용을 입력해서 맛집을 등록해주세요
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* 가게명 */}
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                가게명
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="가게명을 입력해주세요"
                  {...register("name", { required: true })}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm px-2 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 
                    ${errors?.name ? "animate-shake ring-red-500" : ""}`}
                />
                {errors?.name && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>

            {/* 카테고리 */}
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                카테고리
              </label>
              <div className="mt-2">
                <select
                  {...register("category", { required: true })}
                  className={`block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 
                    ${errors?.category ? "animate-shake ring-red-500" : ""}`}
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                연락처
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="-제외 숫자만 입력해주세요."
                  {...register("name", { required: true })}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm px-2 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6
                    ${errors?.name ? "ring-red-500" : ""}
                    ${errors?.name ? "animate-shake" : ""}`} // 애니메이션을 오류 발생 시에만 적용
                />
                {errors?.name && (
                  <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
                )}
              </div>
            </div>

            {/* 주소 */}
            <RegionSearch setValue={setValue} register={register} errors={errors} />

            {/* 식품인증구분 */}
            <div className="sm:col-span-3 sm:col-start-1">
              <label htmlFor="foodCertifyName" className="block text-sm font-medium text-gray-900">
                식품인증구분
              </label>
              <div className="mt-2">
                <select
                  {...register("foodCertifyName", { required: true })}
                  className={`block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 
                    ${errors?.foodCertifyName ? "animate-shake ring-red-500" : ""}`}
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
              <label htmlFor="storeType" className="block text-sm font-medium text-gray-900">
                업종구분
              </label>
              <div className="mt-2">
                <select
                  {...register("storeType", { required: true })}
                  className={`block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2  sm:text-sm sm:leading-6 
                    ${errors?.storeType ? "animate-shake ring-red-500" : ""}`}
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
          className="text-sm font-semibold leading-6 text-gray-900 border border-gray-700 px-6 py-3 rounded-md hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
        >
          뒤로가기
        </button>
        <button
          type="submit"
          className="rounded-md leading-6 bg-[--color-signature] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
        >
          등록하기
        </button>
      </div>
    </form>
  );
}
