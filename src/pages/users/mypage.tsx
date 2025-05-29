import { signOut, useSession } from "next-auth/react";
import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { CommentApiResponse } from "@/interface";
import CommentList from "../../components/comments/CommentList";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import Image from "next/image"; // Image 컴포넌트 추가
import Link from "next/link"; // Link 컴포넌트 추가

export default function MyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  // 페이지 쿼리를 안전하게 가져오기
  const page = (router.query.page as string) || "1";  // page를 string으로 안전하게 처리

  const fetchComments = async () => {
    const pageNumber = parseInt(page, 10);
    if (!session?.user) return { data: [], totalPage: 0, totalCount: 0 };
    const { data } = await axios.get(`/api/comments?&limit=5&page=${pageNumber}&user=true`);
    return data as CommentApiResponse;
  };

  const { data: comments, isLoading, isError } = useQuery(
    ["comments", session?.user?.id, page],
    fetchComments
  );

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
          <Image
            src="/images/markers/404.png"
            alt="404 오류"
            width={500}
            height={500}
            className="mx-auto min-[320px]:w-[150px] min-[320px]:h-[150px]"
          />
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-[--color-signature] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              홈으로
            </Link>
            <a href="javascript:void(0);" className="text-sm font-semibold text-gray-900">
              방성환에게 문의하기 <span aria-hidden="true">&larr;</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="md:max-w-6xl mx-auto px-4 py-10">
      <div className="px-4 sm:px-0">
        <h3 className="text-base/7 font-semibold text-gray-900 min-[320px]:text-xl">마이페이지</h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 min-[320px]:text-lg">사용자 기본 정보</p>
      </div>

      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">이름</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 min-[320px]:text-lg">
              {session?.user.name ?? "귀하신 분"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">이메일</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 min-[320px]:text-lg">
              {session?.user.email ?? "카카오 계정"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">프로필 사진</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <Image
                src={session?.user.image || "/images/default-avatar.png"}
                alt="프로필 이미지"
                className="h-10 w-10 rounded-full min-[320px]:h-[38.5px] min-[320px]:w-[38.5px] hover:opacity-70"
                width={40}
                height={40}
              />
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">설정</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm/6 font-medium text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 min-[320px]:text-lg underline"
              >
                로그아웃
              </button>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 px-4 sm:px-0 border-t border-gray-100">
        <h3 className="text-base/7 font-semibold text-gray-900 min-[320px]:text-xl mt-8">리뷰 관리</h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 min-[320px]:text-lg">작성한 리뷰</p>

        {/* 댓글 목록 */}
        {isLoading ? (
          <>
            <div>로딩 중...</div>
            <Loader />
          </>
        ) : (
          <div>
            <div>총 {comments?.totalCount}개의 리뷰</div>
            <CommentList comments={comments} commentStore={true} />

            {/* 페이지네이션 */}
            {comments?.totalPage && (
              <Pagination total={comments?.totalPage} page={page} pathname="/users/mypage" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
