import { CATEGORY_ARR, FOOD_CERTIFY_ARR, STORE_TYPE_ARR } from "@/data/store";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import RegionSearch from "@/components/RegionSearch";
import { StoreType } from "@/interface";
import { useQuery } from "react-query";
import Loader from "@/components/Loader";
import Link from "next/link";
import { formatStorePhoneNumber } from "@/lib/phone";

const inputClass =
  "block min-h-11 w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm";
const selectClass =
  "block min-h-11 w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm";

export default function StoreEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StoreType>({
    defaultValues: {
      acceptsPaySupport: false,
    },
  });
  const phone = watch("phone");
  const isMounted = useRef(false);

  const fetchStore = async () => {
    const { data } = await axios(`/api/stores?id=${id}`);
    return data as StoreType | null;
  };

  const { data: store, isFetching, isError } = useQuery(["store-edit", id], fetchStore, {
    enabled: !!id,
    onSuccess: (data) => {
      if (!data) return;
      setValue("id", data.id);
      setValue("name", data.name);
      setValue("category", data.category);
      setValue("lat", data.lat);
      setValue("lng", data.lng);
      setValue("phone", data.phone);
      setValue("address", data.address);
      setValue("foodCertifyName", data.foodCertifyName);
      setValue("storeType", data.storeType);
      setValue("acceptsPaySupport", Boolean(data.acceptsPaySupport));
    },
    refetchOnWindowFocus: false,
  });

  const fieldError = (field: keyof StoreType) =>
    errors?.[field] ? <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div> : null;

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

  if (isError || (!isFetching && !store)) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 py-16">
        <div className="max-w-md text-center">
          <p className="text-2xl font-semibold font-bm text-[--color-signature]">404</p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">맛집 정보를 찾을 수 없습니다.</h1>
          <p className="mt-4 text-base text-gray-500">주소가 바뀌었거나 삭제된 맛집일 수 있습니다.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/stores"
              className="rounded-md bg-[--color-signature] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[--color-signature-dark]"
            >
              목록으로 가기
            </Link>
            <button type="button" onClick={() => router.back()} className="text-sm font-semibold text-gray-700">
              뒤로가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isFetching || !id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <Loader className="mx-auto" />
        <p className="mt-4 text-center text-sm text-gray-500">맛집 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-4xl px-4 py-8"
      onSubmit={handleSubmit(async (data) => {
        try {
          const result = await axios.put("/api/stores", data);
          if (result.status === 200) {
            toast.success("맛집 정보를 수정했습니다.");
            router.replace(`/stores/${result?.data?.id}`);
          } else {
            toast.error("맛집 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          }
        } catch (e) {
          console.error(e);
          toast.error("맛집 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
      })}
    >
      <div className="border-b border-gray-200 pb-10">
        <h2 className="text-xl font-semibold text-gray-900">맛집 수정</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          등록된 정보를 확인하고 필요한 항목만 수정해 주세요.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              가게명
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: true })}
              className={`${inputClass} mt-2 ${errors?.name ? "animate-shake ring-red-500" : "ring-gray-300"}`}
            />
            {fieldError("name")}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-900">
              카테고리
            </label>
            <select
              id="category"
              {...register("category", { required: true })}
              className={`${selectClass} mt-2 ${
                errors?.category ? "animate-shake ring-red-500" : "ring-gray-300"
              }`}
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
              placeholder="010-0000-0000"
              {...register("phone", { required: true })}
              className={`${inputClass} mt-2 ${errors?.phone ? "animate-shake ring-red-500" : "ring-gray-300"}`}
            />
            {fieldError("phone")}
          </div>

          <RegionSearch setValue={setValue} register={register} errors={errors} />

          <div className="sm:col-span-3">
            <label htmlFor="foodCertifyName" className="block text-sm font-medium text-gray-900">
              인증 구분
            </label>
            <select
              id="foodCertifyName"
              {...register("foodCertifyName", { required: true })}
              className={`${selectClass} mt-2 ${
                errors?.foodCertifyName ? "animate-shake ring-red-500" : "ring-gray-300"
              }`}
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
              {...register("storeType", { required: true })}
              className={`${selectClass} mt-2 ${
                errors?.storeType ? "animate-shake ring-red-500" : "ring-gray-300"
              }`}
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
                {...register("acceptsPaySupport")}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[--color-signature] focus:ring-[--color-signature]"
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
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-md bg-[--color-signature] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[--color-signature-dark] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "저장 중" : "저장하기"}
        </button>
      </div>
    </form>
  );
}
