import { LikeApiResponse, LikeInterface } from "@/interface";
import axios from "axios";
import { useQuery } from "react-query";
import Loading from "../../components/Loading";
import StoreLikelist from "../../components/StoreLikelist";
import { useRouter } from "next/router";
import Pagination from "../../components/Pagination";
import Link from "next/link";
import Image from "next/image";

export default function LikesPage() {
  const router = useRouter();
  const page = (router.query.page as string) || "1";

  const fetchLikes = async (): Promise<LikeApiResponse> => {
    const { data } = await axios.get(`/api/likes?limit=10&page=${page}`);
    return data;
  };

  const {
    data: likes,
    isLoading,
    isError,
  } = useQuery<LikeApiResponse>(["likes", page], fetchLikes);

  if (isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 py-16">
        <div className="max-w-md text-center">
          <p className="text-2xl font-semibold font-bm text-[--color-signature]">404</p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">찜 목록을 불러오지 못했습니다.</h1>
          <p className="mt-4 text-base text-gray-500">잠시 후 다시 시도해 주세요.</p>
          <div className="relative mx-auto mt-6 h-[150px] w-[150px]">
            <Image src="/images/markers/404.png" alt="404 에러 이미지" fill className="object-contain" priority />
          </div>
          <div className="mt-8">
            <Link
              href="/stores"
              className="rounded-md bg-[--color-signature] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[--color-signature-dark]"
            >
              맛집 보러가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">찜한 맛집</h2>
        <p className="mt-1 text-sm text-gray-500">내가 찜한 맛집 리스트입니다.</p>
        <p className="mt-3 text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{likes?.totalCount ?? 0}</span>곳
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-gray-100 bg-white px-4 py-10">
          <Loading />
        </div>
      ) : likes?.data.length ? (
        <ul role="list" className="space-y-3">
          {likes.data.map(
            (like: LikeInterface, index) =>
              like.store && <StoreLikelist i={index} store={like.store} key={like.id || index} />
          )}
        </ul>
      ) : (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-gray-900">아직 찜한 맛집이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-500">마음에 드는 맛집을 찾아 찜해 보세요.</p>
          <Link
            href="/stores"
            className="mt-4 inline-flex min-h-10 items-center rounded-md bg-[--color-signature] px-4 text-sm font-semibold text-white hover:bg-[--color-signature-dark]"
          >
            맛집 보러가기
          </Link>
        </div>
      )}

      {Number(likes?.totalPage ?? 0) > 1 && (
        <Pagination total={likes?.totalPage ?? 0} page={page} pathname="/users/likes" />
      )}
    </div>
  );
}
