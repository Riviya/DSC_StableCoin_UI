"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const shouldShowHeader = pathname !== "/";

    return (
        <>
            {shouldShowHeader && <Header />}
            {children}
        </>
    );
}