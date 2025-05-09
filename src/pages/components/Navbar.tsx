import { useEffect, useState } from "react";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";
import { useSession, signOut } from "next-auth/react";
import { PiCornersOutLight } from "react-icons/pi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const { data , status } = useSession();

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      setAnimationKey(prev => prev + 1); // 강제로 리렌더링
    }
  }, [status]);
  console.log(data);
  return (
    <div className="navbar-wrapper shadow-md">
      <div className="navbar-container">
        <Link href="/" className="navbar__logo">
          우아한맛집들
        </Link>

        <div className="navbar__list">
          <Link href="/stores" className="navbar__list--item">
            맛집 목록
          </Link>
          <Link href="/stores/new" className="navbar__list--item">
            맛집 등록
          </Link>
          <Link href="/users/likes" className="navbar__list--item">
            즐겨찾기
          </Link>
          <Link href="/users/mypage" className="navbar__list--item">
            마이페이지
          </Link>
          {status === "authenticated" ? (
            <button type="button" onClick={() => signOut()}>
              로그아웃
            </button>
          ) : (
            <Link href="/api/auth/signin" className="navbar__list--item">
              로그인
            </Link>
          )}
        </div>

        <div
          role="presentation"
          className="navbar__button"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <IoIosClose /> : <RxHamburgerMenu />}
        </div>
      </div>

      {isOpen && (
        <div className="navbar--mobile bg-white p-4 shadow-md" key={animationKey}>
          <div className="navbar__list--mobile flex flex-col gap-2">
            {[
              { href: "/stores", label: "맛집 목록" },
              { href: "/stores/new", label: "맛집 등록" },
              { href: "/users/likes", label: "즐겨찾기" },
              { href: "/users/mypage", label: "마이페이지" },
            ].map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="navbar__list--item--mobile text-black opacity-0 animate-slideFadeIn"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {item.label}
              </Link>
            ))}

            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="navbar__list--item--mobile text-left text-black opacity-0 animate-slideFadeIn delay-[400ms]"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                className="navbar__list--item--mobile text-left text-black opacity-0 animate-slideFadeIn delay-[400ms]"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
