import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface CommentFormProps {
  storeId: number;
  onCommentAdded?: () => void;
}

export default function CommentForm({ storeId, onCommentAdded }: CommentFormProps) {
  const { register, handleSubmit, resetField, formState: { errors } } = useForm();

  return (
    <form
      className="flex flex-col space-y-2 mt-2"
      onSubmit={handleSubmit(async (data) => {
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
          toast.error("댓글 등록 중 에러 발생");
        }
      })}
    >
      {errors?.body?.type === "required" && (
        <div className="text-lg text-red-500 mb-2">필수 입력사항입니다.</div>
      )}
      <textarea
        {...register("body", { required: true, maxLength: 200 })}
        placeholder="댓글이나 리뷰를 입력해주세요."
        rows={3}
        className="block w-full min-h-[120px] resize-none border bg-transparent py-2.5 px-4 focus:outline-none placeholder:text-gray-400 text-lg leading-6 rounded-md"
      />
      <button
        type="submit"
        className="bg-[#2ac1bc] hover:opacity-70 text-white px-4 py-2 font-bold shadow-sm mt-2 rounded-md"
      >
        리뷰 작성
      </button>
    </form>
  );
}
