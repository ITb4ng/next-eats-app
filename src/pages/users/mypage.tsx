import { useSession, signOut } from "next-auth/react";

export default function myPage () {
		const { data :session} = useSession();

    return (
            <div className="md:max-w-6xl mx-auto px-4 py-10 ">
              <div className="px-4 sm:px-0">
                <h3 className="text-base/7 font-semibold text-gray-900 min-[320px]:text-xl ">마이페이지</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 min-[320px]:text-lg">사용자 기본 정보</p>
              </div>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                	<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
										<dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">이름</dt>
										<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 min-[320px]:text-lg">{session?.user.name ?? "귀하신 분"}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">이메일</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 min-[320px]:text-lg">{session?.user.email ?? "카카오 계정"}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">프로필 사진</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
										<img src={session?.user.image} alt="프로필 이미지" className="h-10 w-10 rounded-full min-[320px]:h-[38.5px] min-[320px]:w-[38.5px] hover:opacity-70" />
										</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 min-[320px]:text-xl">설정</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
											<button type="button" 
												onClick={() => signOut()}
												className="
														text-sm/6 font-medium
												  text-gray-900 
														hover:text-gray-700 
														focus:outline-none 
														focus:ring-2 
														focus:ring-offset-2 
														focus:ring-indigo-500
                            min-[320px]:text-lg
                            underline"
                            >
												로그아웃
											</button>
										</dd>
                  </div>
                </dl>
              </div>
            </div>
    );
}