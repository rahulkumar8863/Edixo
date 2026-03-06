"use client";

import Link from "next/link";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Exam Prep Zone
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors font-medium">
              Blog
            </Link>
            <Link href="/tools/creator" className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              Tools
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB]">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-[#6B7280] hover:text-error hover:bg-red-50 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-semibold text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
