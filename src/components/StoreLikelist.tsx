import { StoreType } from "@/interface";
import { formatStorePhoneNumber } from "@/lib/phone";
import Image from "next/image";
import { useRouter } from "next/router";
import PaySupportBadge from "./PaySupportBadge";

interface StoreLikeListProps {
  store: StoreType;
  i?: number;
}

export default function StoreLikelist({ store }: StoreLikeListProps) {
  const router = useRouter();

  const { id, name, storeType, address, phone, foodCertifyName, category, acceptsPaySupport } = store;
  const categoryIcon = category ? `/images/markers/${category}.png` : "/images/markers/default.png";
  const displayPhone = phone ? formatStorePhoneNumber(phone) : null;

  return (
    <li>
      <button
        type="button"
        className="flex w-full items-start gap-4 rounded-md border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-signature] sm:p-5"
        onClick={() => router.push(`/stores/${id}`)}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gray-50 ring-1 ring-gray-100">
          <Image
            src={categoryIcon}
            width={42}
            height={42}
            alt={category ? `${category} 아이콘` : "기본 맛집 아이콘"}
            className="h-10 w-10 object-contain"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <span className="truncate text-base font-semibold text-gray-900">{name || "이름 없는 맛집"}</span>
            <span className="text-sm font-medium text-gray-500">{category || "카테고리 미정"}</span>
            {acceptsPaySupport && <PaySupportBadge />}
          </span>
          <span className="mt-1 block text-sm text-gray-600">{storeType || "업종 정보 없음"}</span>
          <span className="mt-2 block break-words text-sm leading-5 text-gray-700">
            {address || "주소 정보가 없습니다."}
          </span>
          <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{displayPhone || "연락처 없음"}</span>
            <span>{foodCertifyName || "인증 정보 없음"}</span>
          </span>
        </span>

        <span className="hidden shrink-0 self-center text-sm font-semibold text-[--color-signature-dark] sm:inline">
          자세히 보기
        </span>
      </button>
    </li>
  );
}
