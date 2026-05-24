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
import { formatStorePhoneNumber } from "@/lib/phone";

const inputClass =
  "block min-h-11 w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm";
const selectClass =
  "block min-h-11 w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm";

export default function StoreNewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<StoreType>({
    shouldFocusError: false,
    defaultValues: {
      phone: "",
      acceptsPaySupport: false,
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

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!phone?.trim()) return;

    const formatted = formatStorePhoneNumber(phone);
    if (formatted !== phone) {
      setValue("phone", formatted, { shouldValidate: true });
    }
  }, [phone, setValue]);

  const fieldError = (field?: keyof typeof errors) =>
    field && errors?.[field] ? <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div> : null;

  return (
    <form
      className="mx-auto max-w-4xl px-4 py-8"
      onSubmit={handleSubmit(async (data) => {
        if (isDemoUser) {
          toast.info("데모 계정은 맛집 등록이 제한됩니다. 실제 계정으로 로그인해 보세요.");
          return;
        }

        try {
          const result = await axios.post("/api/stores", data);
          if (result.status === 200) {
            toast.success("맛집을 등록했습니다.");
            router.replace(`/stores/${result.data?.id}`);
          } else {
            toast.error("맛집 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          }
        } catch (error) {
          console.error(error);
          toast.error("맛집 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
      })}
    >
      <div className="border-b border-gray-200 pb-10">
        <h2 className="text-xl font-semibold text-gray-900">맛집 등록</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          기본 정보, 주소, 업종 정보를 순서대로 입력해 주세요.
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

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              가게명
            </label>
            <input
              id="name"
              type="text"
              disabled={isDemoUser}
              placeholder="예: 강남분식"
              {...register("name", { required: true })}
              className={`${inputClass} mt-2 ${
                errors?.name ? "animate-shake ring-red-500" : "ring-gray-300"
              } ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
            />
            {fieldError("name")}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-900">
              카테고리
            </label>
            <select
              id="category"
              disabled={isDemoUser}
              {...register("category", { required: true })}
              className={`${selectClass} mt-2 ${
                errors?.category ? "animate-shake ring-red-500" : "ring-gray-300"
              } ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
            >
              <option value="">카테고리를 선택해 주세요.</option>
              {CATEGORY_ARR.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldError("category")}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
              연락처
            </label>
            <input
              id="phone"
              type="text"
              disabled={isDemoUser}
              placeholder="숫자만 입력하면 자동으로 정리됩니다."
              {...register("phone", { required: true })}
              className={`${inputClass} mt-2 ${
                errors?.phone ? "animate-shake ring-red-500" : "ring-gray-300"
              } ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
            />
            {fieldError("phone")}
          </div>

          <RegionSearch setValue={setValue} register={register} errors={errors} disabled={isDemoUser} />

          <div className="sm:col-span-3">
            <label htmlFor="foodCertifyName" className="block text-sm font-medium text-gray-900">
              인증 구분
            </label>
            <select
              id="foodCertifyName"
              disabled={isDemoUser}
              {...register("foodCertifyName", { required: true })}
              className={`${selectClass} mt-2 ${
                errors?.foodCertifyName ? "animate-shake ring-red-500" : "ring-gray-300"
              } ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
            >
              <option value="">인증 구분을 선택해 주세요.</option>
              {FOOD_CERTIFY_ARR.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>
            {fieldError("foodCertifyName")}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="storeType" className="block text-sm font-medium text-gray-900">
              업종 구분
            </label>
            <select
              id="storeType"
              disabled={isDemoUser}
              {...register("storeType", { required: true })}
              className={`${selectClass} mt-2 ${
                errors?.storeType ? "animate-shake ring-red-500" : "ring-gray-300"
              } ${isDemoUser ? "bg-gray-100 text-gray-400" : ""}`}
            >
              <option value="">업종 구분을 선택해 주세요.</option>
              {STORE_TYPE_ARR.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>
            {fieldError("storeType")}
          </div>

          <div className="sm:col-span-6">
            <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                disabled={isDemoUser}
                {...register("acceptsPaySupport")}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[--color-signature] focus:ring-[--color-signature] disabled:cursor-not-allowed"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  고유가 피해지원금 사용 가능
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  사용 가능 여부는 카드사, 지역, 결제수단, 가맹점 상태에 따라 달라질 수 있습니다.
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-11 rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          뒤로가기
        </button>
        <button
          type="submit"
          disabled={isDemoUser || isSubmitting}
          className="min-h-11 rounded-md bg-[--color-signature] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[--color-signature-dark] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "등록 중" : "등록하기"}
        </button>
      </div>
    </form>
  );
}
