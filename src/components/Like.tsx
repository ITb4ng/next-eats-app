import { useState } from "react";
import { useQueryClient } from "react-query";
import { useStore } from "@/zustand";
import axios from "axios";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function Like({ storeId, isLiked }: { storeId: number; isLiked: boolean }) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const toggleLike = useStore((s) => s.toggleLike);
  const [isPending, setIsPending] = useState(false);
  const currentLiked = Boolean(isLiked);

  const handleLike = async () => {
    if (status !== "authenticated") {
      toast.warn("로그인 후 찜할 수 있습니다.");
      return;
    }

    if (isPending) return;

    const prev = queryClient.getQueryData<boolean>(["isLiked", storeId]);
    queryClient.setQueryData(["isLiked", storeId], !currentLiked);
    toggleLike(storeId);
    setIsPending(true);

    try {
      const res = await axios.post("/api/likes", { storeId }, { withCredentials: true });
      toast[res.status === 201 ? "success" : "warning"](
        res.status === 201 ? "찜 완료" : "찜을 취소했습니다."
      );
    } catch (error) {
      console.error("Like API error:", error);
      queryClient.setQueryData(["isLiked", storeId], prev ?? currentLiked);
      toggleLike(storeId);
      toast.error("찜 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isPending || status === "loading"}
      aria-pressed={currentLiked}
      aria-label={currentLiked ? "찜 완료" : "찜하기"}
      title={currentLiked ? "찜 완료" : "찜하기"}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:cursor-not-allowed disabled:opacity-60 ${
        currentLiked
          ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-200 bg-white text-gray-500 hover:border-red-100 hover:bg-red-50 hover:text-red-500"
      }`}
    >
      {currentLiked ? <AiFillHeart className="h-5 w-5" /> : <AiOutlineHeart className="h-5 w-5" />}
      <span className="sr-only">{isPending ? "찜 처리 중" : currentLiked ? "찜 완료" : "찜하기"}</span>
    </button>
  );
}
