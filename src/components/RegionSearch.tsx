"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { StoreType } from "@/interface";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { Address } from "react-daum-postcode";

// SSR 비활성화된 DaumPostcodeEmbed 동적 import
const DaumPostcodeEmbed = dynamic(() => import("react-daum-postcode").then(mod => mod.DaumPostcodeEmbed), {
  ssr: false,
});

interface RegionSearchProps {
  setValue: UseFormSetValue<StoreType>;
  register: UseFormRegister<StoreType>;
  errors: FieldErrors<StoreType>;
}

export default function RegionSearch({
  register,
  errors,
  setValue,
}: RegionSearchProps) {
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

    setValue("address", fullAddress);
    setIsOpen(false);
  };

  return (
    <>
      <div className="sm:col-span-full md:col-span-4 lg:col-span-full">
        <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
          주소
        </label>
        <div className="mt-2">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            <input
              readOnly
              placeholder="주소를 입력해주세요"
              {...register("address", { required: true })}
              className={`col-span-3 block sm:w-full rounded-md border-0 py-1.5 px-2 outline-none text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                errors?.address ? "animate-shake ring-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setIsOpen((val) => !val)}
              className="bg-[--color-signature] font-normal hover:font-medium py-1.5 px-2 rounded text-white"
            >
              검색
            </button>
          </div>
          {errors?.address && (
            <div className="pt-2 text-xs text-red-600">필수 입력사항입니다.</div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border border-gray-300 w-full col-span-full md:col-span-4 rounded-md p-2">
          <DaumPostcodeEmbed onComplete={handleComplete} autoClose />
        </div>
      )}
    </>
  );
}
