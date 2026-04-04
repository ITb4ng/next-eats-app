import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";

import RegionSearch from "@/components/RegionSearch";
import { CATEGORY_ARR, FOOD_CERTIFY_ARR, STORE_TYPE_ARR } from "@/data/store";
import { StoreType } from "@/interface";

export default function StoreNewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors },
  } = useForm<StoreType>({
    shouldFocusError: false,
    defaultValues: {
      phone: "",
    },
  });

  const phone = watch("phone");
  const isMounted = useRef(false);
  const isDemoUser = session?.user.role === "DEMO";

  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      setFocus(firstErrorField as keyof StoreType);
    }
  }, [errors, setFocus]);

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

    if (!phone?.trim()) return;

    const formatted = formatPhoneNumber(phone);
    if (formatted !== phone) {
      setValue("phone", formatted, { shouldValidate: true });
    }
  }, [phone, setValue]);

  return (
    <form
      className="px-4 py-8 md:mx-auto md:max-w-4xl"
      onSubmit={handleSubmit(async (data) => {
        if (isDemoUser) {
          toast.info("데모 계정은 맛집 등록이 제한됩니다. 실제 계정으로 로그인해보세요.");
          return;
        }

        try {
          const result = await axios.post("/api/stores", data);
          if (result.status === 200) {
            toast.success("맛집을 등록했습니다.");
            router.replace(`/stores/${result.data?.id}`);
          } else {
            toast.error("다시 시도해주세요.");
          }
        } catch (error) {
          console.error(error);
          toast.error("맛집 등록 중 문제가 발생했습니다. 다시 시도해주세요.");
        }
      })}
    >
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-xl font-semibold leading-7 text-gray-900">맛집 등록</h2>
          <p className="mt-1 text-lg leading-6 text-gray-600">
            아래 내용을 입력해서 맛집을 등록해주세요.
          </p>

          {isDemoUser && (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              데모 계정은 맛집 등록과 수정이 제한됩니다.{" "}
              <Link href="/users/login" className="font-semibold underline">
                실제 계정으로 로그인
              </Link>
              하면 모든 기능을 사용할 수 있습니다.
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                가게명
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  disabled={isDemoUser}
                  placeholder="가게명을 입력해주세요."
                  {...register("name", { required: true })}
                  className={`block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors?.name ? "animate-shake ring-red-500" : ""} ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
                />
                {errors?.name && (
                  <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                카테고리
              </label>
              <div className="mt-2">
                <select
                  disabled={isDemoUser}
                  {...register("category", { required: true })}
                  className={`block w-full rounded-md border-0 px-2 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors?.category ? "animate-shake ring-red-500" : ""} ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {CATEGORY_ARR.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors?.category && (
                  <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                연락처
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  disabled={isDemoUser}
                  placeholder="- 없이 숫자만 입력해주세요."
                  {...register("phone", { required: true })}
                  className={`block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors?.phone ? "animate-shake ring-red-500" : ""} ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
                />
                {errors?.phone && (
                  <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div>
                )}
              </div>
            </div>

            <RegionSearch setValue={setValue} register={register} errors={errors} />

            <div className="sm:col-span-3 sm:col-start-1">
              <label htmlFor="foodCertifyName" className="block text-sm font-medium text-gray-900">
                식품인증구분
              </label>
              <div className="mt-2">
                <select
                  disabled={isDemoUser}
                  {...register("foodCertifyName", { required: true })}
                  className={`block w-full rounded-md border-0 px-2 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors?.foodCertifyName ? "animate-shake ring-red-500" : ""} ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
                >
                  <option value="">식품인증구분을 선택하세요</option>
                  {FOOD_CERTIFY_ARR.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
                {errors?.foodCertifyName && (
                  <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="storeType" className="block text-sm font-medium text-gray-900">
                업종구분
              </label>
              <div className="mt-2">
                <select
                  disabled={isDemoUser}
                  {...register("storeType", { required: true })}
                  className={`block w-full rounded-md border-0 px-2 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6 ${errors?.storeType ? "animate-shake ring-red-500" : ""} ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
                >
                  <option value="">업종구분을 선택하세요</option>
                  {STORE_TYPE_ARR.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
                {errors?.storeType && (
                  <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div>
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
          className="rounded-md border border-gray-700 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          뒤로가기
        </button>
        <button
          type="submit"
          disabled={isDemoUser}
          className="rounded-md bg-[--color-signature] px-6 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          등록하기
        </button>
      </div>
    </form>
  );
}
