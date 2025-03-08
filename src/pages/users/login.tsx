import { useEffect } from "react";

import { FcGoogle } from "react-icons/fc";
import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";


import { signIn , useSession} from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage () {
  const {status , data: session} = useSession();
  const router = useRouter();

  console.log(session);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace("/");
    }

  }, [router,status]);

    return (
        <div className="flex flex-col justify-center px-6 lg:px-8 h-[60vh]">
            <div className="mx-auto w-full max-w-sm">
                <div className="text-blue-700 text-center text-2xl font-semibold italic">
                    Next-App
                </div>
                <div className="text-center mt-6 text-2xl font-bold text-gray-700">
                    SNS 계정으로 로그인
                </div>
                <div className="mt-4 mx-auto w-full max-w-sm">
                    <div className="flex flex-col gap-2">
                        <button type="button" 
                        onClick={() => signIn('google', { callbackUrl:'/'} )}
                        className="
                         text-[#51555d]
                         rounded-lg
                         border
                         w-full h-full
                         flex
                         justify-center 
                         items-center
                         px-5 py-4
                         font-medium
                         gap-4
                         "
                        > 
                        <FcGoogle className="w-8 h-8" />
                         계정으로 로그인</button>
                        <button type="button" 
                        onClick={() => signIn('naver', { callbackUrl:'/'} )} 
                        className="
                        bg-[#2db400] text-[#fff] 
                         rounded-lg
                         w-full h-full
                         flex
                         justify-center 
                         items-center
                         px-5 py-4
                         font-medium
                         gap-4"
                        > 
                        <SiNaver className="w-5 h-5"/>
                         계정으로 로그인</button>
                        <button type="button"
                        onClick={() => signIn('kakao', { callbackUrl:'/'} )}
                        className="
                        bg-[#fef01b] text-black
                         rounded-lg
                         w-full h-full
                         flex
                         justify-center 
                         items-center
                         px-5 py-4
                         font-medium
                         gap-3
                        ">
                          <RiKakaoTalkFill className=" w-8 h-8"/>
                           계정으로 로그인</button>
                    </div>
                </div>
                <p className="mt-2 text-center text-sm text-gray-500">
                    계정이 없다면, 자동으로 회원가입이 진행됩니다.
                </p>
            </div>
        </div>
    );
}