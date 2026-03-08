"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isOpen } = useSidebarStore();

    // Exclude auth routes and other non-dashboard routes from layout
    const isExcluded = pathname.startsWith("/login") || pathname === "/forgot-password" || pathname.startsWith("/public-website");

    if (isExcluded) {
        return <>{children}</>;
    }

    // The 70+ page.tsx files currently export their own <Sidebar />, <TopBar />
    // and <div className="ml-60 flex flex-col min-h-screen"> wrapper.
    // We can't trivially wrap them here without doubling the Sidebar/TopBar render 
    // unless we aggressively search and replace those from all 70+ files.
    // We'll proceed with modifying the page.tsx files effectively instead.

    return (
        <>
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </>
    );
}
