import { useQueryClient } from "react-query";
import { useStore } from "@/zustand";
import axios from "axios";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function Like({ storeId, isLiked }: { storeId: number; isLiked: boolean }) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const toggleLike = useStore(s => s.toggleLike);

  const handleLike = async () => {
    if (status !== "authenticated") {
      toast.warn("로그인 후 찜하기를 이용해주세요.");
      return;
    }

    // 1) Optimistic React‑Query update
    const prev = queryClient.getQueryData<boolean>(["isLiked", storeId]);
    queryClient.setQueryData(["isLiked", storeId], !prev);

    // 2) Zustand 상태 토글
    toggleLike(storeId);

    try {
      const res = await axios.post("/api/likes", { storeId });
      toast[res.status === 201 ? "success" : "warning"](
        res.status === 201 ? "가게를 찜했습니다." : "찜을 취소했습니다."
      );
    } catch (e) {
      // rollback
      queryClient.setQueryData(["isLiked", storeId], prev);
      toggleLike(storeId);
      toast.error("찜 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <button onClick={handleLike} className="h-5 w-5">
      {isLiked ? (
        <AiFillHeart className="text-red-500" />
      ) : (
        <AiOutlineHeart />
      )}
    </button>
  );
}