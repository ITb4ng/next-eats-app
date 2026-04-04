import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface CommentFormProps {
  storeId: number;
  onCommentAdded?: () => void;
}

export default function CommentForm({ storeId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const { register, handleSubmit, resetField, formState: { errors } } = useForm();

  const isDemoUser = session?.user.role === "DEMO";

  return (
    <form
      className="flex flex-col space-y-2 mt-2"
      onSubmit={handleSubmit(async (data) => {
        if (isDemoUser) {
          toast.info("데모 계정은 댓글 작성이 제한됩니다. 실제 계정으로 로그인해보세요.");
          return;
        }

        try {
          const res = await axios.post("/api/comments", { ...data, storeId });
          if (res.status === 200) {
            toast.success("댓글이 등록되었습니다.");
            resetField("body");
            onCommentAdded?.();
          } else {
            toast.error("댓글 등록에 실패했습니다.");
          }
        } catch (error) {
          console.error(error);
          toast.error("댓글 등록 중 오류가 발생했습니다.");
        }
      })}
    >
      {isDemoUser && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          데모 계정은 댓글 작성이 제한됩니다.{" "}
          <Link href="/users/login" className="font-semibold underline">
            실제 계정으로 로그인
          </Link>
          하면 리뷰를 직접 남길 수 있습니다.
        </div>
      )}

      {errors?.body?.type === "required" && (
        <div className="text-lg text-red-500 mb-2">필수 입력 항목입니다.</div>
      )}

      <textarea
        {...register("body", { required: true, maxLength: 200 })}
        placeholder="댓글이나 리뷰를 입력해주세요."
        rows={3}
        disabled={isDemoUser}
        className="block w-full min-h-[120px] resize-none border bg-transparent py-2.5 px-4 focus:outline-none placeholder:text-gray-400 text-lg leading-6 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
      />

      <button
        type="submit"
        disabled={isDemoUser}
        className="bg-[#2ac1bc] hover:opacity-70 text-white px-4 py-2 font-bold shadow-sm mt-2 rounded-md disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        리뷰 작성
      </button>
    </form>
  );
}
