
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Zap, 
  Bot, 
  User,
  Settings,
  Library,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: BookOpen, label: "Test Series", href: "/tests" },
  { icon: Zap, label: "Practice", href: "/practice" },
  { icon: Library, label: "My Library", href: "/library" },
  { icon: Bot, label: "AI Planner", href: "/study-plans" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#1E3A5F] shrink-0 relative z-40 shadow-xl transition-all duration-300 sticky top-[3.5rem] h-[calc(100vh-3.5rem)]">
      <nav className="flex-1 pt-0 pb-4 custom-scrollbar overflow-y-auto w-full">
        <div className="px-4 mb-2 mt-0">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
            MAIN MENU
          </span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 h-11 transition-all duration-200 cursor-pointer text-sm font-medium",
                isActive
                  ? "bg-[#162C47] text-white border-l-[3px] border-[#F4511E]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-[3px] border-transparent"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-all duration-200",
                isActive ? "text-white" : "text-slate-400"
              )} />
              <span className="truncate flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 h-11 transition-all duration-200 cursor-pointer text-sm font-medium",
            pathname === "/settings"
              ? "bg-[#162C47] text-white border-l-[3px] border-[#F4511E]"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-[3px] border-transparent"
          )}
        >
          <Settings className={cn(
            "h-5 w-5 shrink-0 transition-all duration-200",
            pathname === "/settings" ? "text-white" : "text-slate-400"
          )} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
