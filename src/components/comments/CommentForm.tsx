import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface CommentFormProps {
  storeId: number;
  onCommentAdded?: () => void;
}

interface CommentFormValues {
  body: string;
}

export default function CommentForm({ storeId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>();

  const isDemoUser = session?.user.role === "DEMO";

  return (
    <form
      className="rounded-md border border-gray-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit(async (data) => {
        if (isDemoUser) {
          toast.info("데모 계정은 댓글 작성이 제한됩니다. 실제 계정으로 로그인해 보세요.");
          return;
        }

        try {
          const res = await axios.post("/api/comments", { ...data, storeId });
          if (res.status === 200) {
            toast.success("댓글을 등록했습니다.");
            resetField("body");
            onCommentAdded?.();
          } else {
            toast.error("댓글 등록에 실패했습니다.");
          }
        } catch (error) {
          console.error(error);
          toast.error("댓글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
      })}
    >
      {isDemoUser && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          데모 계정은 댓글 작성이 제한됩니다.{" "}
          <Link href="/users/login" className="font-semibold underline">
            실제 계정으로 로그인
          </Link>
          하면 리뷰를 직접 남길 수 있습니다.
        </div>
      )}

      <label htmlFor="comment-body" className="block text-sm font-semibold text-gray-900">
        댓글 작성
      </label>
      <textarea
        id="comment-body"
        {...register("body", { required: true, maxLength: 200 })}
        placeholder="댓글을 입력해 주세요."
        rows={3}
        disabled={isDemoUser || isSubmitting}
        className={`mt-2 block min-h-[112px] w-full resize-none rounded-md border px-4 py-3 text-base leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(42,193,188,0.18)] disabled:bg-gray-100 disabled:text-gray-400 ${
          errors?.body ? "border-red-300 focus:border-red-400" : "border-gray-300 focus:border-[--color-signature]"
        }`}
      />

      {errors?.body?.type === "required" && (
        <p className="mt-2 text-sm text-red-600">댓글을 입력해 주세요.</p>
      )}
      {errors?.body?.type === "maxLength" && (
        <p className="mt-2 text-sm text-red-600">댓글은 200자 이내로 입력해 주세요.</p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isDemoUser || isSubmitting}
          className="min-h-11 w-full rounded-md bg-[--color-signature] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[--color-signature-dark] disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
        >
          {isSubmitting ? "등록 중" : "댓글 작성"}
        </button>
      </div>
    </form>
  );
}
