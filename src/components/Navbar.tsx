import { useEffect, useState } from "react";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const { status } = useSession();

  // 훅은 항상 최상위에서 호출
  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      setAnimationKey((prev) => prev + 1); // 강제 리렌더링 용
    }
  }, [status]);

  // status가 loading일 때 로딩 UI 반환
  if (status === "loading") {
    return (
      <div className="navbar-wrapper shadow-md">
        <div className="navbar-container">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // status가 authenticated 또는 unauthenticated 일 때 정상 Navbar 렌더링
  return (
    <div className="navbar-wrapper shadow-md">
      <div className="navbar-container">
        <Link
          href="/"
          className="navbar__logo"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          우아한맛집들
        </Link>
        <div className="navbar__list">
          <Link href="/stores" className="navbar__list--item font-bm">
            맛집 목록
          </Link>
          <Link href="/stores/new" className="navbar__list--item font-bm">
            맛집 등록
          </Link>
          <Link href="/users/likes" className="navbar__list--item font-bm">
            즐겨찾기
          </Link>
          <Link href="/users/mypage" className="navbar__list--item font-bm">
            마이페이지
          </Link>
          {status === "authenticated" ? (
            <button type="button" onClick={() => signOut()} className="font-bm">
              로그아웃
            </button>
          ) : (
            <Link href="/api/auth/signin" className="navbar__list--item font-bm">
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
              { href: "/stores", label: "맛집 목록", onclick: () => setIsOpen(false) },
              { href: "/stores/new", label: "맛집 등록", onclick: () => setIsOpen(false) },
              { href: "/users/likes", label: "즐겨찾기", onclick: () => setIsOpen(false) },
              { href: "/users/mypage", label: "마이페이지", onclick: () => setIsOpen(false) },
            ].map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="navbar__list--item--mobile font-bm text-black opacity-0 animate-slideFadeIn"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
                onClick={() => {
                  item.onclick();
                  setIsOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}

            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="navbar__list--item--mobile text-left text-black opacity-0 animate-slideFadeIn delay-[400ms] font-bm"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                className="navbar__list--item--mobile text-left text-black opacity-0 animate-slideFadeIn delay-[400ms] font-bm"
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
