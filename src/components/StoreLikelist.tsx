import { StoreType } from "@/interface";
import Image from "next/image";
import { useRouter } from "next/router";

interface StoreLikeListProps {
  store: StoreType;
  i : number;
}

export default function StoreLikelist({ store }: StoreLikeListProps) {
  const router = useRouter();

  const {
    id,
    name,
    storeType,
    address,
    phone,
    foodCertifyName,
    category,
  } = store;

  const categoryIcon = category
    ? `/images/markers/${category}.png`
    : "/images/markers/default.png";

  return (
    <li
      className="flex justify-between gap-x-6 py-5 cursor-pointer hover:bg-gray-50"
      onClick={() => router.push(`/stores/${id}`)}
    >
      <div className="flex gap-x-4">
        <Image
          src={categoryIcon}
          width={48}
          height={48}
          alt={`${category || "기본"} 아이콘`}
        />
        <div>
          <div className="text-sm font-semibold leading-6 text-gray-900">
            {name}
          </div>
          <div className="mt-1 text-xs truncate font-semibold leading-5 text-gray-500">
            {storeType}
          </div>
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-col sm:items-end">
        <div className="text-sm font-semibold leading-6 text-gray-900">
          {address}
        </div>
        <div className="mt-1 text-xs truncate font-semibold leading-5 text-gray-500">
          {phone || "번호없음"} | {foodCertifyName || "인증없음"} | {category || "카테고리없음"}
        </div>
      </div>
    </li>
  );
}
