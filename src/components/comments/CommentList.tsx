import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import { CommentApiResponse } from "@/interface";
import Link from "next/link";
import Image from "next/image";

interface CommentListProps {
  comments?: CommentApiResponse;
  onDeleteSuccess?: () => void;
  commentStore?: boolean;
  isLoading?: boolean;
}

export default function CommentList({
  comments,
  onDeleteSuccess,
  commentStore,
  isLoading,
}: CommentListProps) {
  const { data: session } = useSession();

  const handleDeleteComment = async (id: number) => {
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/comments?id=${id}`);
      if (res.status === 200) {
        toast.success("댓글을 삭제했습니다.");
        onDeleteSuccess?.();
      } else {
        toast.error("댓글 삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      toast.error("댓글 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (isLoading) {
    return (
      <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        댓글을 불러오는 중입니다.
      </div>
    );
  }

  return (
    <div className="mt-5">
      {comments?.data && comments.data.length > 0 ? (
        <ul className="space-y-3">
          {comments.data.map((comment) => (
            <li
              key={comment.id}
              className="flex gap-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm sm:gap-4"
            >
              <Image
                src={comment?.user?.image || "/images/markers/user.png"}
                alt="사용자 이미지"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
                unoptimized
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {comment.user?.name || "사용자"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {comment.user?.email || "소셜 계정"}
                    </p>
                  </div>
                  <time className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-base leading-6 text-gray-900">
                  {comment.body}
                </p>

                {commentStore && comment.store && (
                  <div className="mt-3 text-sm text-gray-500">
                    맛집:{" "}
                    <Link
                      href={`/stores/${comment.store.id}`}
                      className="font-medium text-[--color-signature-dark] underline underline-offset-2"
                    >
                      {comment.store.name}
                    </Link>
                  </div>
                )}
              </div>

              {comment.userId === session?.user.id && (
                <button
                  type="button"
                  className="h-9 shrink-0 rounded-md border border-gray-200 px-3 text-sm font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">아직 등록된 댓글이 없습니다.</p>
          <p className="mt-1 text-sm text-gray-500">첫 댓글을 남겨 맛집 정보를 공유해 주세요.</p>
        </div>
      )}
    </div>
  );
}
