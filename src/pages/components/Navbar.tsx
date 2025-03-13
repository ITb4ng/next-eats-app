import { useState } from "react"
import Link from "next/link";
//https://react-icons.github.io/react-icons/search/ 
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";

import { useSession, signOut } from "next-auth/react";



export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const {data, status} = useSession();
    return (
        <>
            <div className="navbar">
                <Link href ="/" className="navbar__logo">
                    우아한맛집들
                </Link>
                    <div className="navbar__list">
                        <Link href ="/stores" className="navbar__list--item">
                            맛집 목록
                        </Link>
                        <Link href ="/stores/new" className="navbar__list--item">
                            맛집 등록
                        </Link>
                        <Link href ="/users/likes" className="navbar__list--item">
                            즐겨찾기
                        </Link>
                        {status === "authenticated" ? (
                            <button type="button" onClick={() => signOut()}>
                                로그아웃
                            </button>) : (
                            <Link href ="/api/auth/signin" className="navbar__list--item">
                                로그인
                            </Link>
                            )}
            </div>
                {/* {모바일 Navbar} */}
                <div role="presentation" className="navbar__button" onClick= {() =>
                    setIsOpen((value) => !value)
                }> { isOpen ? <IoIosClose/> : <RxHamburgerMenu/> }
                </div>
                {/* {모바일 메뉴} */}
                {isOpen && (
                    <div className="navbar--mobile">
                        <div className="navbar__list--mobile">
                            <Link href ="/stores" className="navbar__list--item--mobile">
                                맛집 목록
                            </Link>
                            <Link href ="/stores/new" className="navbar__list--item--mobile">
                                맛집 등록
                            </Link>
                            <Link href ="/users/likes" className="navbar__list--item--mobile">
                                즐겨찾기
                            </Link>
                            <Link href ="/api/auth/signin" className="navbar__list--item--mobile">
                                로그인
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

