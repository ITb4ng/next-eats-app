import { ReactNode } from "react"
import Navbar from "./Navbar"
import DemoBanner from "./DemoBanner"


interface LayoutProps {
    children: ReactNode;
}

export default function Layout({children} :LayoutProps) {
    return (
        <div className="layout">
            <Navbar />
            <DemoBanner />
            {children}
        </div>
    );
}
