import { LikeApiResponse, LikeInterface } from "@/interface";
import axios from "axios";
import { useQuery } from "react-query";
import Loading from "../../components/Loading";
import StoreLikelist from "../../components/StoreLikelist";
import { useRouter } from "next/router";
import Pagination from "../../components/Pagination";
import Link from "next/link";
import Image from "next/image";

export default function LikesPage () {
    const router = useRouter();
    const page = (router.query.page as string) || "1";

    const fetchLikes = async (): Promise<LikeApiResponse> => {
    const { data } = await axios.get(`/api/likes?limit=10&page=${page}`);
    return data;
  };

    const { 
        data:likes,
        isLoading,
        isError,
     } = useQuery<LikeApiResponse>(["likes", page], fetchLikes);
     
    if (isError) {
        return (
          <main className="grid h-screen place-items-center pb-10 bg-white px-6 sm:pb-32 lg:px-8">
            <div className="text-center">
              <p className="text-2xl font-semibold font-bm text-[--color-signature]">404</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                  해당 페이지를 찾을 수 없음.
                </h1>
              <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                페이지가 텅텅 비었네요.
              </p>
              <div className="relative w-[500px] h-[500px] mx-auto min-[320px]:w-[150px] min-[320px]:h-[150px]">
                <Image
                  src="/images/markers/404.png"
                  alt="404 에러 이미지"
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </div>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/"
                  className="rounded-md bg-[--color-signature] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  홈으로
                </Link>
                <a href="javascript:void(0);" className="text-sm font-semibold text-gray-900">
                  방성환에게 문의하기 <span aria-hidden="true">&larr;</span>
                </a>
              </div>
            </div>
          </main>
        );
      }

    return (
        <div className="px-4 md:max-w-4xl mx-auto py-8">
            <h2 className="text-lg font-medium">즐겨찾기</h2>
            <div className="mt-1 text-gray-500 text-lg">나의 찜 리스트</div>
            <div> 
                총{likes?.totalCount}개
            </div>
            <ul role="list" className="divide-y divide-gray-100 mt-10">
                { isLoading ? (
                    <Loading />
                ) : (
                   likes?.data.map((like: LikeInterface, index) => 
                    like.store && (
                    <StoreLikelist i={index} store={like.store} key={index} />
                    )
                )
                )}
            </ul>
            {likes?.totalPage && likes?.totalPage > 0 && (
                <Pagination total={likes?.totalPage} page={page} pathname="/users/likes" />
            )}
        </div>
    );
}