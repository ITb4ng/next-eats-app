import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DemoBanner() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || session?.user.role !== "DEMO") {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">현재 데모 계정으로 체험 중입니다.</p>
          <p className="mt-1 text-amber-800">
            지도 탐색, 검색, 상세 조회, 좋아요 흐름은 자유롭게 확인할 수 있으며 댓글 작성과 맛집 등록 같은 일부 기능은 제한됩니다.
          </p>
        </div>
        <Link
          href="/users/login"
          className="inline-flex items-center justify-center rounded-md bg-amber-900 px-4 py-2 font-medium text-white hover:bg-amber-950"
        >
          실제 계정으로 로그인
        </Link>
      </div>
    </div>
  );
}
