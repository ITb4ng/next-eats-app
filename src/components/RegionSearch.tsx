"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { StoreType } from "@/interface";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { Address } from "react-daum-postcode";

const DaumPostcodeEmbed = dynamic(
  () => import("react-daum-postcode").then((mod) => mod.DaumPostcodeEmbed),
  {
    ssr: false,
  }
);

interface RegionSearchProps {
  setValue: UseFormSetValue<StoreType>;
  register: UseFormRegister<StoreType>;
  errors: FieldErrors<StoreType>;
  disabled?: boolean;
}

export default function RegionSearch({ register, errors, setValue, disabled }: RegionSearchProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleComplete = (data: Address) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setValue("address", fullAddress, { shouldValidate: true });
    setIsOpen(false);
  };

  return (
    <>
      <div className="sm:col-span-6">
        <label htmlFor="address" className="block text-sm font-medium text-gray-900">
          주소
        </label>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          주소 검색 버튼을 눌러 Daum Postcode에서 도로명 주소를 선택해 주세요.
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px]">
          <input
            id="address"
            readOnly
            disabled={disabled}
            placeholder="주소 검색으로 입력됩니다."
            {...register("address", { required: true })}
            className={`block min-h-11 w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm ${
              errors?.address ? "animate-shake ring-red-500" : "ring-gray-300 focus:ring-indigo-600"
            } ${disabled ? "bg-gray-100 text-gray-400" : "bg-white"}`}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((val) => !val)}
            className="min-h-11 rounded-md bg-[--color-signature] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[--color-signature-dark] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            주소 검색
          </button>
        </div>
        {errors?.address && <div className="pt-2 text-xs text-red-600">필수 입력 항목입니다.</div>}
      </div>

      {isOpen && (
        <div className="col-span-full overflow-hidden rounded-md border border-gray-300 bg-white p-2">
          <DaumPostcodeEmbed onComplete={handleComplete} autoClose />
        </div>
      )}
    </>
  );
}
