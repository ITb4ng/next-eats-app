import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm"; 
import {useQuery} from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { CommentApiResponse,CommentInterface } from "../../../interface";

interface CommentProps {
    storeId: number;
}

export default function Comments({ storeId } :CommentProps) {
	const { status } = useSession();
	const router = useRouter();
	const { page = "1"}: any = router.query;
 	const fetchComments = async () => {
		const {data} = await axios.get(`/api/comments?storeId=${storeId}&limit=10&page=${page}`);  
		return data as CommentApiResponse;
	};
	const {data : comments} = useQuery(`comments-${storeId}`, fetchComments)
    return (
				//댓글 작성 폼 wrapper
        <div className="md:max-w-5xl py-8 px-2 mx-auto mb-20">
					{/* 로그인 상태일 때만 댓글 작성가능 */}
					{status === "authenticated" && <CommentForm storeId={storeId} />}
					{/* {comment List} */}
					<div className="my-10">
						{comments?.data && comments?.data?.length > 0 ? (
							comments?.data?.map((comment) => (
								<div 
                  key={comment.id} 
                  className="flex space-x-4 text-lg text-gray-500 mb-8"
								>
                  {/* 리뷰 사용자 정보 이미지*/}
									<div>
										<img src={comment?.user?.image || '/images/markers/user.png'}
											width={40}
                      height={40}
                      className="rounded-full bg-gray-10"
                      alt="사용자 이미지"
										/>
									</div>
									<div>
                  {/* 리뷰 사용자 정보 이메일(0) ~ 커멘트까지(2)*/}  
                    <div className="flex flex-col space-y-1">
                      <div> 
                        {comment?.user?.name ?? "사용자"} | {comment?.user?.email}
                      </div>
                      <div className="text-xs">
                        {new Date(comment?.createdAt)?.toLocaleDateString()}
                      </div>
                      <div className="text-black mt-1 text-base">
                        {comment.body}
                      </div>
                    </div>
                  </div>
									<div></div>
								</div>
							)) 
							) : (
							<div>
								댓글이 없습니다.
							</div>
						)}
					</div>
        </div>
    )
};