import { useEffect } from "react";

import { FcGoogle } from "react-icons/fc";
import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";
import { FaApple } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import { signIn , useSession} from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage () {
  const {status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace("/");
    }

  }, [router,status]);

    return (
        <div className="flex flex-col justify-center px-6 lg:px-8 h-[80vh]">
            <div className="mx-auto w-full max-w-sm">
                <div className="text-black text-center text-4xl font-bm font-bold">
                    우아한맛집들
                </div>
                <div className="text-center mt-4 mb-8 text-base font-bold text-gray-700">
                    SNS 계정으로 로그인
                </div>
                <div className="mt-4 mx-auto w-full max-w-sm">
                    <div className="flex flex-col gap-[0.675rem]">
                        <button type="button"
                        onClick={() => signIn('kakao', { callbackUrl:'/'} )}
                        className="
                        bg-[#fef01b] text-black
                         rounded-lg
                         w-full h-full
                         flex
                         justify-center 
                         items-center
                         px-6 py-4
                         font-medium
                         gap-3
                        ">
                        <RiKakaoTalkFill className=" w-8 h-8"/>
                           카카오로 로그인</button>
                        <button type="button" 
                        onClick={() => signIn('naver', { callbackUrl:'/'} )} 
                        className="
                        bg-[#2db400] text-[#fff] 
                         rounded-lg
                         w-full h-full
                         flex
                         justify-center 
                         items-center
                         px-6 py-4
                         font-medium
                         gap-4"
                        > 
                        <SiNaver className="w-5 h-5"/>
                         네이버로 로그인</button>
                        <button type="button" 
                        onClick={() => {
                            alert('개발 중입니다.');
                        }} 
                        className="
                        bg-white text-black
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
                        <FaApple className=" w-7 h-7"/>
                         Apple로 로그인</button>
                         <button type="button" 
                        onClick={() => signIn('google', { callbackUrl:'/'} )}
                        className="
                         text-black
                         rounded-lg
                         border
                         w-full h-full
                         flex
                         justify-center 
                         items-center
                         py-4
                         pr-4
                         font-normal
                         gap-4
                         "
                        > 
                        <FcGoogle className="w-8 h-8" />
                         구글로 로그인</button>
                    </div>
                </div>
                <p className="mt-8 text-center text-sm text-gray-500">
                    계정이 없다면, 자동으로 회원가입이 진행됩니다.
                </p>
                <div className="text-sm mt-9 text-center flex-shrink cursor-pointer">
                    <span className="inline-flex items-center">
                        이메일 또는 아이디로 로그인
                        <IoIosArrowForward className="ml-2" />
                    </span>
                </div>
            </div>
        </div>
    );
}