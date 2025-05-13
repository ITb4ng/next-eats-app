import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm"; 
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { CommentApiResponse } from "../../../interface";
import CommentList from "./CommentList";
import Pagination from "../Pagination";

interface CommentProps {
  storeId: number;
}

export default function Comments({ storeId }: CommentProps) {
  const { status } = useSession();
  const router = useRouter();
  const { page = "1" }: any = router.query;
  const queryClient = useQueryClient();

  const fetchComments = async () => {
    const { data } = await axios.get(`/api/comments?storeId=${storeId}&limit=5&page=${page}`);
    return data as CommentApiResponse;
  };

  const { data: comments } = useQuery(
    ["comments", storeId, page],
    fetchComments
  );

  const refetchComments = () => {
    queryClient.invalidateQueries(["comments", storeId]);
  };

  return (
    <div className="md:max-w-5xl py-4 px-3 mx-auto mb-10">
      {status === "authenticated" && (
        <CommentForm storeId={storeId} onCommentAdded={refetchComments} />
      )}
      <CommentList comments={comments} onDeleteSuccess={refetchComments} />
      {/* pagination */}
      {comments?.totalPage && (
        <Pagination total={comments?.totalPage} page={page} pathname={`/stores/${storeId}`}/>
      )}
    </div>
  );
}
