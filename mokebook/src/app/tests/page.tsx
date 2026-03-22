"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search, Clock, Lock, ChevronRight, Loader2,
  BookOpen, Users, Star, ChevronDown, ChevronUp,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "MOCKVEDA-001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const DEFAULT_FAQS = [
  { q: "Can I attempt tests on my phone?", a: "Yes! Our platform is fully optimized for mobile browsers." },
  { q: "Are the mock tests free?", a: "We offer both free and premium tests. Free tests are available to all registered users." },
  { q: "How is my percentile calculated?", a: "Based on real-time comparison with all students who attempted the same test." },
  { q: "Can I review answers after submission?", a: "Yes, a detailed solution review is available immediately after submission." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-3 text-left hover:text-[#1a73e8] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>
      {open && <p className="pb-3 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  );
}

function TestSeriesRow({ series }: { series: any }) {
  return (
    <Link href={`/tests/series/${series.id}`} className="group block">
      <div className="flex items-start gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-blue-50 flex-shrink-0">
          {series.icon ? (
            <Image src={series.icon} alt={series.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#1a73e8] transition-colors leading-snug">
                {series.name}
              </h3>
              {series.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{series.description}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              {series.isFree ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">FREE</span>
              ) : (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> PAID
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <PlayCircle className="h-3 w-3 text-blue-400" />
              {series.testsCount || 24} Tests
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Users className="h-3 w-3 text-gray-400" />
              {series.enrolledCount ? `${series.enrolledCount.toLocaleString()} Enrolled` : "1,200+ Enrolled"}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1a73e8] flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

export default function TestSeriesPage() {
  const [categorySearch, setCategorySearch] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const fRes = await apiFetch("/mockbook/folders");
        const fetchedFolders = fRes.data || [];
        setFolders(fetchedFolders);
        if (fetchedFolders.length > 0) setActiveFolderId(fetchedFolders[0].id);

        const sRes = await apiFetch("/mockbook/categories");
        const grouped = (sRes.data || []).reduce((acc: any, s: any) => {
          if (!acc[s.folderId]) acc[s.folderId] = [];
          acc[s.folderId].push(s);
          return acc;
        }, {});
        setSeriesByFolder(grouped);
      } catch (err) {
        console.error("Failed to load tests data", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredFolders = folders.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const activeSeries = seriesByFolder[activeFolderId] || [];
  const activeCat = folders.find(f => f.id === activeFolderId);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">

          {/* Page title bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-base font-bold text-gray-900">Mock Test Series</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="pl-9 pr-4 h-8 bg-gray-50 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
            </div>
          ) : (
            <div className="flex">
              {/* LEFT: Category sidebar */}
              <div
                className="w-52 flex-shrink-0 bg-white border-r border-gray-200 sticky top-[49px] self-start"
                style={{ maxHeight: "calc(100vh - 49px)", overflowY: "auto" }}
              >
                <div className="py-2">
                  <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Exam Categories</p>
                  {filteredFolders.length > 0 ? filteredFolders.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFolderId(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left",
                        activeFolderId === cat.id
                          ? "bg-[#e8f0fe] text-[#1a73e8] font-semibold border-r-2 border-[#1a73e8]"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      {activeFolderId === cat.id && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
                    </button>
                  )) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-gray-400">No categories</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Test series */}
              <div className="flex-1 min-w-0">
                {activeCat && (
                  <div className="bg-white border-b border-gray-200 px-5 py-3">
                    <h2 className="text-sm font-bold text-gray-900">{activeCat.name} Mock Test Series</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{activeSeries.length} series available</p>
                  </div>
                )}

                <div className="bg-white mx-4 my-4 rounded-lg border border-gray-200 overflow-hidden">
                  {activeSeries.length > 0 ? (
                    activeSeries.map((series: any) => <TestSeriesRow key={series.id} series={series} />)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 px-8">
                      <BookOpen className="h-10 w-10 text-gray-200" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Coming Soon</p>
                        <p className="text-xs text-gray-400 mt-1">Our experts are crafting premium content for this category.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* About & FAQ section */}
                <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    About {activeCat?.name || ""} Mock Test Series
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Prepare for your exam with our comprehensive mock test series. Each test is carefully crafted by subject matter experts to match the exact pattern and difficulty of the actual examination. Our platform tracks your performance, provides detailed analytics with topic-wise accuracy, and offers AI-powered recommendations to help you focus on weak areas.
                  </p>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Frequently Asked Questions</h4>
                  {DEFAULT_FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
