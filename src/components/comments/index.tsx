import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { CommentApiResponse } from "../../interface";
import CommentList from "./CommentList";
import Pagination from "../Pagination";
import Link from "next/link";

interface CommentProps {
  storeId: number;
}

export default function Comments({ storeId }: CommentProps) {
  const { status } = useSession();
  const router = useRouter();
  const page = (parseInt(router.query.page as string, 10) || 1).toString();
  const queryClient = useQueryClient();

  const fetchComments = async () => {
    const { data } = await axios.get(`/api/comments?storeId=${storeId}&limit=5&page=${page}`);
    return data as CommentApiResponse;
  };

  const {
    data: comments,
    isLoading,
    isError,
  } = useQuery(["comments", storeId, page], fetchComments, {
    enabled: !!storeId,
  });

  const refetchComments = () => {
    queryClient.invalidateQueries(["comments", storeId]);
  };

  return (
    <section className="mx-auto mb-10 max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">댓글</h2>
          <p className="mt-1 text-sm text-gray-500">방문 경험이나 맛집 정보를 남겨 주세요.</p>
        </div>
        {comments?.totalCount ? (
          <span className="text-sm font-medium text-gray-500">{comments.totalCount}개</span>
        ) : null}
      </div>

      {status === "authenticated" ? (
        <CommentForm storeId={storeId} onCommentAdded={refetchComments} />
      ) : (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
          로그인 후 댓글을 작성할 수 있습니다.{" "}
          <Link href="/users/login" className="font-semibold text-[--color-signature-dark] underline">
            로그인하기
          </Link>
        </div>
      )}

      {isError ? (
        <div className="mt-5 rounded-md border border-red-100 bg-red-50 px-4 py-5 text-sm text-red-700">
          댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : (
        <CommentList comments={comments} isLoading={isLoading} onDeleteSuccess={refetchComments} />
      )}

      {Number(comments?.totalPage ?? 0) > 1 && (
        <Pagination total={comments?.totalPage ?? 0} page={page} pathname={`/stores/${storeId}`} />
      )}
    </section>
  );
}
