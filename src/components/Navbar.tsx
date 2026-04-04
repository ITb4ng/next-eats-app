import { CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";
import { useSession, signOut } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

const normalizePath = (path: string) => path.split("?")[0].split("#")[0];

const isStoresListPath = (pathname: string) =>
  pathname === "/stores" ||
  (pathname.startsWith("/stores/") && !pathname.startsWith("/stores/new"));

const NAV_ITEMS: NavItem[] = [
  {
    href: "/stores",
    label: "맛집 목록",
    match: isStoresListPath,
  },
  {
    href: "/stores/new",
    label: "맛집 등록",
    match: (pathname) => pathname === "/stores/new",
  },
  {
    href: "/users/likes",
    label: "즐겨찾기",
    match: (pathname) => pathname === "/users/likes",
  },
  {
    href: "/users/mypage",
    label: "마이페이지",
    match: (pathname) => pathname === "/users/mypage",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const currentPath = normalizePath(router.asPath);

  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  if (status === "loading") {
    return (
      <div className="navbar-wrapper shadow-md">
        <div className="navbar-container">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const getNavClassName = (isActive: boolean) =>
    [
      "navbar__list--item",
      "font-bm",
      isActive ? "navbar__list--item--active" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const getMobileNavClassName = (isActive: boolean) =>
    [
      "navbar__list--item--mobile",
      "font-bm",
      "text-black",
      "opacity-0",
      "animate-slideFadeIn",
      isActive ? "navbar__list--item--mobile--active" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const getMobileNavLabelClassName = (isActive: boolean) =>
    [
      "navbar__list-label--mobile",
      isActive ? "navbar__list-label--mobile--active" : "",
    ]
      .filter(Boolean)
      .join(" ");

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

        <nav className="navbar__list" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(currentPath);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={getNavClassName(isActive)}
              >
                {item.label}
              </Link>
            );
          })}

          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="navbar__action font-bm"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/users/login"
              aria-current={currentPath === "/users/login" ? "page" : undefined}
              className={getNavClassName(currentPath === "/users/login")}
            >
              로그인
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="navbar__button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? (
            <IoIosClose className="w-7 h-7 md:w-8 md:h-8" />
          ) : (
            <RxHamburgerMenu className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="navbar--mobile bg-white p-4 shadow-md">
          <nav
            id="mobile-navigation"
            className="navbar__list--mobile flex flex-col gap-2"
            aria-label="모바일 메뉴"
          >
            {NAV_ITEMS.map((item, index) => {
              const isActive = item.match(currentPath);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={getMobileNavClassName(isActive)}
                  style={
                    {
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "forwards",
                    } as CSSProperties
                  }
                >
                  <span className={getMobileNavLabelClassName(isActive)}>{item.label}</span>
                </Link>
              );
            })}

            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="navbar__list--item--mobile navbar__action navbar__action--mobile text-left text-black opacity-0 animate-slideFadeIn delay-[400ms] font-bm"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/users/login"
                aria-current={currentPath === "/users/login" ? "page" : undefined}
                className={getMobileNavClassName(currentPath === "/users/login")}
                style={
                  {
                    animationDelay: `${NAV_ITEMS.length * 100}ms`,
                    animationFillMode: "forwards",
                  } as CSSProperties
                }
              >
                <span className={getMobileNavLabelClassName(currentPath === "/users/login")}>
                  로그인
                </span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
