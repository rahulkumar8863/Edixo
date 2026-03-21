"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Flame,
  Bell,
  Search,
  User,
  Coins,
  LogOut,
  LayoutDashboard,
  Settings,
  BookOpen,
  Bot,
  Zap,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { navItems } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { org } = useOrganization();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isFirebaseUser = user !== null && typeof (user as any).getIdToken === 'function';
  const userDoc = useDoc(isFirebaseUser && db ? doc(db, "users", user!.uid) : null);
  const points = userDoc.data?.totalPoints || 0;

  const handleLogout = async () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (auth) {
      try {
        await signOut(auth);
        router.push("/login");
      } catch (error) {
        console.error("Logout failed", error);
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shrink-0" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <div className="flex h-14 items-center justify-between gap-2 px-3 md:px-5 max-w-full">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            {org?.logoUrl ? (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
              </div>
            ) : (
              <span
                className="text-white p-1.5 rounded-lg text-xs font-black w-8 h-8 flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #1a73e8, #0057d9)" }}
              >
                {org?.name?.charAt(0) || "M"}
              </span>
            )}
            <span className="hidden sm:inline text-base font-bold tracking-tight text-slate-900">
              {org?.name || "Mockbook"}
            </span>
          </Link>
        </div>

        {/* Centre: Search (logged in & desktop only) */}
        {user && (
          <div className="hidden md:flex flex-1 max-w-sm relative mx-4 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="search"
              placeholder="Search tests, topics..."
              className="h-9 w-full bg-slate-50 border border-slate-200 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm placeholder:text-slate-400 transition-all"
            />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileSearchOpen(o => !o)}
              >
                {mobileSearchOpen ? <X className="h-4 w-4 text-slate-600" /> : <Search className="h-4 w-4 text-slate-600" />}
              </Button>

              {/* Points & Streak Chip */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <Coins className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-700 text-xs">{points.toLocaleString()}</span>
                <div className="w-px h-3 bg-slate-300 mx-1" />
                <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-400" />
                <span className="font-bold text-slate-700 text-xs">18</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-slate-100 transition-all">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 p-0 overflow-hidden border border-slate-200 hover:border-blue-300 transition-all">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl border-slate-100 mt-1.5">
                  {/* User info */}
                  <div className="p-3 mb-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-blue-200 overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{user?.displayName || userDoc.data?.name || "Student"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {[
                      { href: "/tests", icon: LayoutDashboard, label: "Dashboard", color: "text-blue-500" },
                      { href: "/tests/my-series", icon: BookOpen, label: "My Test Series", color: "text-orange-500" },
                      { href: "/study-plans", icon: Bot, label: "AI Study Plans", color: "text-purple-500" },
                      { href: "/analytics", icon: BarChart3, label: "Performance", color: "text-green-500" },
                      { href: "/settings", icon: Settings, label: "Settings", color: "text-slate-500" },
                    ].map(item => (
                      <DropdownMenuItem key={item.href} asChild className="cursor-pointer text-sm font-semibold rounded-lg py-2.5 px-3 focus:bg-blue-50 focus:text-blue-700 transition-colors">
                        <Link href={item.href} className="flex items-center gap-2.5 w-full">
                          <item.icon className={cn("h-4 w-4", item.color)} />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <div className="h-px bg-slate-100 my-1.5 mx-1" />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm font-semibold rounded-lg py-2.5 px-3 text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors">
                    <LogOut className="h-4 w-4 mr-2.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-sm font-semibold rounded-lg text-slate-600 h-9 px-4" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="text-sm font-bold rounded-lg h-9 px-4 text-white border-none"
                style={{ background: "linear-gradient(135deg, #1a73e8, #0057d9)" }}
                asChild
              >
                <Link href="/login">Join Free</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (expandable) */}
      {user && mobileSearchOpen && (
        <div className="md:hidden px-3 pb-2.5 border-t border-slate-100 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="search"
              placeholder="Search tests, topics..."
              autoFocus
              className="h-9 w-full bg-slate-50 border border-slate-200 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm placeholder:text-slate-400"
            />
          </div>
        </div>
      )}
    </header>
  );
}
