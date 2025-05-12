import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import { CommentApiResponse } from "@/interface";

interface CommentListProps {
  comments?: CommentApiResponse;
  onDeleteSuccess?: () => void;
}

export default function CommentList({ comments, onDeleteSuccess }: CommentListProps) {
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
            <img
              src={comment?.user?.image || '/images/markers/user.png'}
              alt="사용자 이미지"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
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
                {comment.body}
              </div>
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
