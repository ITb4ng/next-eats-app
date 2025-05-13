import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import { CommentApiResponse } from "@/interface";
import Link from "next/link";
import Image from "next/image";

interface CommentListProps {
  comments?: CommentApiResponse;
  onDeleteSuccess?: () => void;
  commentStore? : boolean;
}

export default function CommentList({ comments, onDeleteSuccess, commentStore }: CommentListProps) {
  const { data: session } = useSession();

  const handleDeleteComment = async (id: number) => {
    const confirmDelete = window.confirm("리뷰를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/comments?id=${id}`);
      if (res.status === 200) {
        toast.success("리뷰 삭제 완료");
        onDeleteSuccess?.(); // 댓글 목록 갱신
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      toast.error("오류가 발생했습니다.");
    }
  };

  return (
    <div className="my-10">
      {comments?.data && comments.data.length > 0 ? (
        comments.data.map((comment) => (
          <div
            key={comment.id}
            className="flex space-x-4 items-center text-lg text-gray-500 mb-8 border-b border-gray-200 pb-8"
          >
            <Image
              src={comment?.user?.image || '/images/markers/user.png'}
              alt="사용자 이미지"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
              unoptimized // 외부 URL 또는 최적화 비원할 시 사용
            />
            <div className="flex flex-col space-y-1 flex-1">
              <div>
                {comment.user?.name || "Naver 사용자"} | 
                &nbsp;
                {comment.user?.email || "카카오 계정"}
              </div>
              <div className="text-base">
                {new Date(comment.createdAt).toLocaleDateString()}
              </div>
              <div className="text-black mt-1 text-lg">
                댓글 : &nbsp; {comment.body}
              </div>
              {commentStore && comment.store && (
                <div className="mt-2">
                  맛집 - &nbsp;
                  <Link href={`/stores/${comment.store.id}`}
                    className="text-gray-400 underline font-normal hover:font-bold hover:text-gray-600 underline-offset-2"
                  >
                    {comment.store.name}
                  </Link>
                </div>
              )}
            </div>
            {comment.userId === session?.user.id && (
              <button
                className="underline text-red-400 hover:text-gray-300 text-base"
                onClick={() => handleDeleteComment(comment.id)}
              >
                삭제
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="p-4 border border-gray-200 rounded-md text-sm text-gray-400">
          댓글이 없습니다.
        </div>
      )}
    </div>
  );
}


// Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element