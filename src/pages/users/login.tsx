import { useEffect } from "react";

import { FcGoogle } from "react-icons/fc";
import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";
import { FaApple, FaRegSmile } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  return (
    <section className="min-h-[calc(100dvh-var(--navbar-height))] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-var(--navbar-height)-3rem)] w-full max-w-5xl items-start justify-center lg:items-center">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8">
          <div className="text-center text-3xl font-bm font-bold text-black sm:text-4xl">
            우아한맛집들
          </div>

          <p className="mt-4 text-center text-sm font-bold text-gray-700 sm:text-base">
            원하는 방식으로 로그인하고 서비스를 둘러보세요
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => signIn("demo", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#111827] px-6 py-4 font-medium text-white"
            >
              <FaRegSmile className="h-5 w-5" />
              데모 계정으로 체험하기
            </button>

            <button
              type="button"
              onClick={() => signIn("kakao", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#fef01b] px-6 py-4 font-medium text-black"
            >
              <RiKakaoTalkFill className="h-8 w-8" />
              카카오로 로그인
            </button>

            <button
              type="button"
              onClick={() => signIn("naver", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-4 rounded-lg bg-[#2db400] px-6 py-4 font-medium text-white"
            >
              <SiNaver className="h-5 w-5" />
              네이버로 로그인
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Apple 로그인은 아직 준비 중입니다.");
              }}
              className="flex w-full items-center justify-center gap-4 rounded-lg border bg-white px-5 py-4 font-medium text-black"
            >
              <FaApple className="h-7 w-7" />
              Apple로 로그인
            </button>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-4 rounded-lg border py-4 pr-4 text-black"
            >
              <FcGoogle className="h-8 w-8" />
              Google로 로그인
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            데모 계정은 주요 탐색 흐름을 체험하기 위한 계정이며, 일부 작성 기능은 제한됩니다.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">이렇게 체험해보세요</p>
            <ul className="mt-3 space-y-2">
              <li>1. 홈 지도에서 마커를 눌러 맛집 정보를 확인해보세요.</li>
              <li>2. 맛집 목록에서 검색과 지역 필터를 적용해보세요.</li>
              <li>3. 상세 페이지에서 좋아요와 댓글 흐름을 살펴보세요.</li>
              <li>4. 마이페이지와 찜 목록에서 개인화 화면 구성을 확인해보세요.</li>
            </ul>
          </div>

          <div className="mt-8 text-center text-sm text-gray-700">
            <span className="inline-flex items-center">
              계정이 없다면 소셜 로그인 후 자동으로 가입됩니다
              <IoIosArrowForward className="ml-2" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
