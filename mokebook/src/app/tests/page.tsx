"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search, BookOpen, Clock, Zap, HelpCircle, BookMarked,
  Users, Flame, Loader2, ChevronRight, Filter, Sparkles,
  Lock, PlayCircle, ChevronLeft, BarChart3, Target,
  FileText, Trophy, Bookmark, Layers, ArrowRight, CheckCircle2,
  Star, ChevronDown, ChevronUp, Quote, Award, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUser } from "@/firebase";

// ── My Series static data ─────────────────────────────────────────────────────
const MY_SERIES = [
  { id: "1", name: "RRB Group D Mock Test Series", progress: 45, tests: 45, totalTests: 100, icon: Zap, color: "bg-red-500", status: "active", lastActivity: "2h ago" },
  { id: "2", name: "SSC CGL Tier-I Mega Pack", progress: 12, tests: 12, totalTests: 45, icon: Award, color: "bg-blue-500", status: "active", lastActivity: "1d ago" },
  { id: "3", name: "Current Affairs 2024 Daily", progress: 88, tests: 88, totalTests: 100, icon: TrendingUp, color: "bg-orange-500", status: "active", lastActivity: "3h ago" },
  { id: "4", name: "Physics: Laws of Motion", progress: 100, tests: 20, totalTests: 20, icon: Zap, color: "bg-green-500", status: "completed", lastActivity: "5d ago" },
];

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "MOCKVEDA-001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const DEFAULT_QUICK_LINKS = [
  { id: "free-test", label: "Free Tests", icon: "📝", linkUrl: "/tests?filter=free" },
  { id: "previous-papers", label: "Prev. Papers", icon: "📄", linkUrl: "/tests?filter=previous" },
  { id: "full-length", label: "Full Length", icon: "🏆", linkUrl: "/tests?filter=full" },
  { id: "sectional", label: "Sectional", icon: "🎯", linkUrl: "/tests?filter=sectional" },
  { id: "daily-quiz", label: "Daily Quiz", icon: "📅", linkUrl: "/tests?filter=daily" },
  { id: "analytics", label: "My Analytics", icon: "📊", linkUrl: "/analytics" },
];

const DEFAULT_BANNERS = [
  {
    id: "1",
    title: "Attempt Today's Free Mock",
    subtitle: "Challenge 5,000+ students in today's live quiz. No registration needed.",
    badgeText: "FREE TODAY",
    ctaText: "Attempt Now",
    linkUrl: "/tests",
    gradient: "linear-gradient(135deg, #1a73e8 0%, #0047cc 100%)",
  },
  {
    id: "2",
    title: "Build Your Exam Strategy",
    subtitle: "Our AI studies your weak areas and creates a personalized day-by-day plan.",
    badgeText: "AI POWERED",
    ctaText: "Create My Plan",
    linkUrl: "/study-plans",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  },
  {
    id: "3",
    title: "All SSC & Bank Exams",
    subtitle: "500+ full-length, sectional, and topic-wise mocks. Updated for 2026.",
    badgeText: "POPULAR",
    ctaText: "Explore Tests",
    linkUrl: "/tests",
    gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  },
];

const DEFAULT_WHY_ITEMS = [
  { icon: "🎯", title: "Real Exam Pattern", desc: "Every test mirrors the exact pattern and difficulty of the actual exam." },
  { icon: "📊", title: "Performance Analysis", desc: "Detailed analytics with percentile, rank, and topic-wise breakdown." },
  { icon: "🤖", title: "AI-Powered Prep", desc: "Personalized weak-area identification and adaptive practice sessions." },
];

const DEFAULT_FAQS = [
  { q: "Can I attempt tests on my phone?", a: "Yes! Our platform is fully optimized for mobile browsers. No app download needed." },
  { q: "Are the mock tests free?", a: "We offer both free and premium tests. Free tests are available to all registered users." },
  { q: "How is my percentile calculated?", a: "Your percentile is calculated based on real-time comparison with all students who attempted the same test." },
  { q: "Can I review my answers after submission?", a: "Yes, a detailed solution review with explanations is available immediately after submission." },
];

// TB colors
const TB_BLUE = "#1a73e8";
const TB_SURFACE = "#F0F2F8";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-bold text-slate-800 pr-4">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function TestSeriesPage() {
  const { org } = useOrganization();
  const { user } = useUser();
  const [categorySearch, setCategorySearch] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("");
  const [activeBanner, setActiveBanner] = useState(0);
  const [frontendConfig, setFrontendConfig] = useState<any>(null);

  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [liveTests, setLiveTests] = useState<any[]>([]);
  const [enrolledSeries, setEnrolledSeries] = useState<any[]>([]);
  const [recentSeries, setRecentSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const bannerInterval = useRef<any>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const cfgRes = await fetch(`${API_URL}/organizations/public/${ORG_ID}`);
        const cfgData = await cfgRes.json();
        if (cfgData.success && cfgData.data.frontendConfig) {
          setFrontendConfig(cfgData.data.frontendConfig);
        }

        const fRes = await apiFetch("/mockbook/folders");
        const fetchedFolders = fRes.data || [];
        setFolders(fetchedFolders);
        if (fetchedFolders.length > 0) setActiveCategoryTab(fetchedFolders[0].id);

        const sRes = await apiFetch("/mockbook/categories");
        const grouped = (sRes.data || []).reduce((acc: any, s: any) => {
          if (!acc[s.folderId]) acc[s.folderId] = [];
          acc[s.folderId].push(s);
          return acc;
        }, {});
        setSeriesByFolder(grouped);

        const pubRes = await apiFetch("/mockbook/public");
        setLiveTests(pubRes.data || []);

        const allSeries = (sRes.data || []).slice(0, 4);
        setRecentSeries(allSeries);

        setEnrolledSeries([
          { id: "1", name: "SSC CGL Tier 1 Mock Tests 2026", progress: 45, testsLeft: 18, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" },
          { id: "2", name: "Reasoning Special Sectional Series", progress: 12, testsLeft: 24, image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&q=80" },
          { id: "3", name: "Banking & SSC GK Capsule 2026", progress: 67, testsLeft: 8, image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80" },
          { id: "4", name: "English Grammar & Comprehension", progress: 30, testsLeft: 12, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80" },
        ]);
      } catch (err) {
        console.error("Failed to load tests data", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const banners: any[] = frontendConfig?.promoBanners?.length ? frontendConfig.promoBanners.map((b: any) => ({
    ...b,
    gradient: b.gradient?.startsWith("from-") ? `linear-gradient(135deg, #1a73e8, #0047cc)` : b.gradient,
  })) : DEFAULT_BANNERS;

  useEffect(() => {
    bannerInterval.current = setInterval(() => {
      setActiveBanner(p => (p + 1) % banners.length);
    }, 4500);
    return () => clearInterval(bannerInterval.current);
  }, [banners.length]);

  const quickLinks: any[] = frontendConfig?.quickLinks?.length ? frontendConfig.quickLinks : DEFAULT_QUICK_LINKS;
  const heroSubText: string = frontendConfig?.heroSubText || "We've analyzed your performance. Today is a great day to attempt a Full-Length Mock.";
  const stats: any[] = frontendConfig?.stats?.length ? frontendConfig.stats : [
    { label: "Active Students", value: "50K+" },
    { label: "Mock Tests", value: "12K+" },
    { label: "Success Rate", value: "92%" },
    { label: "AI Study Plans", value: "25K+" },
  ];
  const whyItems: any[] = frontendConfig?.whySection?.items?.length ? frontendConfig.whySection.items : DEFAULT_WHY_ITEMS;
  const whyTitle: string = frontendConfig?.whySection?.title || "Why Choose Our Test Series?";
  const testimonials: any[] = frontendConfig?.testimonials || [];
  const faqs: any[] = frontendConfig?.faqs?.length ? frontendConfig.faqs : DEFAULT_FAQS;

  const filteredFolders = folders.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const displayName = (user as any)?.displayName || "Student";
  const [activeTab, setActiveTab] = useState<"discover" | "my-series">("discover");
  const [mySeriesSearch, setMySeriesSearch] = useState("");
  const filteredMySeries = MY_SERIES.filter(s => s.name.toLowerCase().includes(mySeriesSearch.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: TB_SURFACE }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">

          {/* ── TAB SWITCHER ── */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-6" style={{ boxShadow: "0 1px 0 #e2e8f0" }}>
            <div className="flex gap-0 pt-1">
              {(["discover", "my-series"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-3 text-sm font-bold capitalize border-b-2 transition-all mr-1",
                    activeTab === tab
                      ? "border-b-[#1a73e8] text-[#1a73e8]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tab === "discover" ? "Discover" : "My Series"}
                </button>
              ))}
            </div>
          </div>

          {/* ── MY SERIES TAB ── */}
          {activeTab === "my-series" && (
            <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search your enrolled series..."
                  className="w-full pl-10 pr-4 h-10 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                  value={mySeriesSearch}
                  onChange={e => setMySeriesSearch(e.target.value)}
                />
              </div>
              {filteredMySeries.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <BookOpen className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="text-slate-500 font-semibold text-sm">No enrolled series found.</p>
                  <button onClick={() => setActiveTab("discover")} className="text-sm font-bold hover:underline" style={{ color: TB_BLUE }}>
                    Browse Test Series →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredMySeries.map(series => (
                    <Link key={series.id} href={`/tests/series/${series.id}`} className="group block">
                      <div className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                        <div className={cn("h-1 w-full", series.color)} />
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                          <div className="flex justify-between items-start">
                            <Badge className={cn("text-[9px] font-bold uppercase h-5 px-2 border",
                              series.status === "completed"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            )}>
                              {series.status === "completed"
                                ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Completed</span>
                                : "In Progress"
                              }
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-400">{series.lastActivity}</span>
                          </div>
                          <h3 className="text-sm font-bold leading-snug group-hover:text-blue-600 transition-colors flex-1 line-clamp-2">{series.name}</h3>
                          <div className="space-y-1.5 mt-auto">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-500">{series.tests}/{series.totalTests} Tests</span>
                              <span style={{ color: TB_BLUE }}>{series.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${series.progress}%`, background: TB_BLUE }} />
                            </div>
                          </div>
                          <div className="w-full h-8 flex items-center justify-center text-xs font-bold rounded-lg bg-slate-900 text-white group-hover:bg-blue-600 transition-all">
                            {series.status === "completed" ? "Review Analysis" : "Continue Test"}
                            <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DISCOVER TAB ── */}
          {activeTab === "discover" && <>

            {/* ── PROMO BANNER ── */}
            <div className="relative overflow-hidden" style={{ minHeight: "180px" }}>
              {banners.map((banner, i) => (
                <div
                  key={banner.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-700",
                    i === activeBanner ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
                  )}
                >
                  <div
                    className="h-full w-full relative flex items-center"
                    style={{ background: banner.gradient || "linear-gradient(135deg, #1a73e8, #0047cc)" }}
                  >
                    {/* Subtle circles */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-10 pointer-events-none">
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border-[30px] border-white" />
                      <div className="absolute -right-4 -top-16 w-36 h-36 rounded-full border-[15px] border-white/60" />
                    </div>

                    <div className="relative z-10 px-6 md:px-10 py-7 space-y-2.5 max-w-2xl">
                      {banner.badgeText && (
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full border border-white/20">
                          ✦ {banner.badgeText}
                        </span>
                      )}
                      <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                        {banner.title}
                      </h2>
                      <p className="text-white/80 text-sm font-medium max-w-sm leading-relaxed">
                        {banner.subtitle}
                      </p>
                      {banner.ctaText && (
                        <Link href={banner.linkUrl || "/tests"}>
                          <button className="mt-1 h-9 px-6 rounded-lg bg-white font-bold text-sm hover:bg-white/90 transition-all border-none" style={{ color: "#1a73e8" }}>
                            {banner.ctaText} →
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Dots */}
              <div className="absolute bottom-3 right-5 flex items-center gap-2 z-20">
                <button
                  onClick={() => setActiveBanner(p => (p - 1 + banners.length) % banners.length)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <div className="flex gap-1.5">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveBanner(i)}
                      className={cn("h-1.5 rounded-full transition-all", i === activeBanner ? "w-5 bg-white" : "w-1.5 bg-white/40")}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveBanner(p => (p + 1) % banners.length)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="p-4 md:p-5 space-y-5 max-w-7xl mx-auto">

              {/* ── QUICK LINKS ── */}
              {quickLinks.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <ScrollArea className="w-full">
                    <div className="flex gap-4 pb-0.5">
                      {quickLinks.map(ql => (
                        <Link key={ql.id} href={ql.linkUrl || "/tests"}>
                          <div className="flex flex-col items-center gap-1.5 min-w-[60px] group cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-200 group-hover:scale-105">
                              {ql.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 text-center leading-tight group-hover:text-blue-600 transition-colors">
                              {ql.label}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}

              {/* ── WELCOME / STREAK BANNER ── */}
              <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a73e8 0%, #0047cc 100%)" }}>
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                <div className="absolute right-0 top-0 bottom-0 w-36 overflow-hidden opacity-[0.07] pointer-events-none">
                  <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-[40px] border-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-0.5">
                      <Sparkles className="h-3 w-3" /> Your Daily Target
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-white leading-snug">
                      Hello, {displayName.split(" ")[0]}! <span className="text-blue-200">Let's ace today.</span>
                    </h2>
                    <p className="text-blue-200 text-xs font-medium max-w-sm">{heroSubText}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-center px-4 py-2.5 rounded-lg bg-white/10 border border-white/15">
                      <Flame className="h-4 w-4 text-orange-300" />
                      <span className="text-lg font-black text-white mt-0.5">24</span>
                      <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wide">Day Streak</span>
                    </div>
                    <button
                      className="h-10 px-6 rounded-lg font-bold text-sm text-white border border-white/30 bg-white/15 hover:bg-white/25 transition-all"
                    >
                      Resume Last Test
                    </button>
                  </div>
                </div>
              </div>

              {/* ── STATS STRIP ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <p className="text-xl font-black text-slate-900">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* ── RECENT TEST SERIES ── */}
              {recentSeries.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="inline-flex w-1 h-4 rounded-full" style={{ background: TB_BLUE }} />
                      Recent Test Series
                    </h2>
                    <button className="text-xs font-bold flex items-center gap-0.5 hover:underline" style={{ color: TB_BLUE }}>
                      View All <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 pb-3">
                      {recentSeries.map((series: any) => (
                        <Link key={series.id} href={`/tests/series/${series.id}`} className="group block shrink-0">
                          <div className="w-52 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div className="relative h-24 bg-blue-50">
                              {series.icon ? (
                                <Image src={series.icon} alt={series.name} fill className="object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-blue-200" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{series.name}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge className="text-[9px] font-black px-2 h-4 rounded-full border-none bg-blue-50 text-blue-700">
                                  {series.isFree ? "FREE" : "PREMIUM"}
                                </Badge>
                              </div>
                              <button className="w-full mt-2.5 h-7 flex items-center justify-center text-xs font-bold rounded-lg text-white transition-all" style={{ background: TB_BLUE }}>
                                Continue
                              </button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </section>
              )}

              {/* ── ENROLLED SERIES ── */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="inline-flex w-1 h-4 rounded-full" style={{ background: "#ea580c" }} />
                    Your Enrolled Series
                  </h2>
                  <button className="text-xs font-bold flex items-center gap-0.5 hover:underline" style={{ color: TB_BLUE }}>
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {enrolledSeries.map(series => (
                    <Link key={series.id} href={`/tests/series/${series.id}`} className="group">
                      <div className="bg-white rounded-xl border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-3.5 flex gap-3 items-start" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <Image src={series.image} alt={series.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <p className="font-bold text-slate-900 leading-tight line-clamp-2 text-xs group-hover:text-blue-600 transition-colors">{series.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{series.testsLeft} tests left</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-black">
                              <span className="text-slate-400">PROGRESS</span>
                              <span style={{ color: TB_BLUE }}>{series.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${series.progress}%`, background: TB_BLUE }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* ── LIVE TESTS ── */}
              {liveTests.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="inline-flex w-1 h-4 rounded-full bg-red-500" />
                      Live Tests & Free Quizzes
                      <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    </h2>
                    <button className="text-xs font-bold flex items-center gap-0.5 hover:underline" style={{ color: TB_BLUE }}>
                      View All <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 pb-3">
                      {liveTests.map(quiz => (
                        <Link key={quiz.id} href={`/tests/instructions/${quiz.id}`} className="group block shrink-0">
                          <div className="w-64 bg-white rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div className="relative h-32 overflow-hidden bg-slate-100">
                              <Image src={`https://picsum.photos/seed/${quiz.id}/576/288`} alt={quiz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                                <Badge className="bg-red-500 text-[9px] font-black px-2.5 rounded-full border-none animate-pulse">🔴 LIVE</Badge>
                                <Badge className="bg-white/90 text-slate-900 text-[9px] font-black px-2.5 rounded-full border-none">FREE</Badge>
                              </div>
                            </div>
                            <div className="p-3.5 space-y-2.5">
                              <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{quiz.name}</h3>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-500" /> {quiz.durationMins}m</span>
                                <span className="flex items-center gap-1"><Users className="h-3 w-3 text-blue-400" /> 1.2K+ Live</span>
                              </div>
                              <button className="w-full rounded-lg text-white font-bold h-8 text-xs transition-all" style={{ background: TB_BLUE }}>
                                Join Now
                              </button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </section>
              )}

              {/* ── TEST SERIES BY CATEGORIES ── */}
              <section className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="inline-flex w-1 h-4 rounded-full bg-purple-500" />
                    Test Series by Categories
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search SSC, JEE, NEET..."
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        className="pl-9 h-9 bg-white border-slate-200 rounded-lg text-xs w-48 focus-visible:ring-blue-400/30 focus-visible:border-blue-400"
                      />
                    </div>
                    <Button variant="outline" className="h-9 w-9 rounded-lg p-0 border-slate-200 bg-white">
                      <Filter className="h-3.5 w-3.5 text-slate-500" />
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[400px]" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  {loading ? (
                    <div className="py-32 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: TB_BLUE }} />
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Loading Catalog...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row h-full">
                      {/* Vertical Category Sidebar */}
                      <div className="w-full lg:w-52 bg-slate-50/80 lg:border-r border-b lg:border-b-0 border-slate-200 p-2.5 shrink-0">
                        <p className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2.5 mb-2">Categories</p>
                        <div className="flex lg:flex-col items-stretch justify-start gap-1 overflow-x-auto no-scrollbar">
                          {filteredFolders.length > 0 ? filteredFolders.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setActiveCategoryTab(cat.id)}
                              className={cn(
                                "flex-shrink-0 lg:w-full flex items-center justify-between text-xs font-bold px-3 py-2.5 rounded-lg whitespace-nowrap transition-all",
                                activeCategoryTab === cat.id
                                  ? "bg-white text-blue-700 shadow-sm border border-blue-100"
                                  : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent"
                              )}
                            >
                              <span className="lg:flex-1 text-left">{cat.name}</span>
                              <ChevronRight className={cn("hidden lg:block h-3 w-3 text-blue-400", activeCategoryTab === cat.id ? "opacity-100" : "opacity-0")} />
                            </button>
                          )) : (
                            <div className="p-6 text-center w-full">
                              <HelpCircle className="h-5 w-5 text-slate-200 mx-auto mb-1" />
                              <p className="text-xs text-slate-400 font-bold">No results</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content area */}
                      <div className="flex-1 p-4 md:p-5">
                        {folders.filter(c => c.id === activeCategoryTab).map(cat => (
                          <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                            {seriesByFolder[cat.id]?.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {seriesByFolder[cat.id].map((series: any) => (
                                  <Link key={series.id} href={`/tests/series/${series.id}`} className="group block">
                                    <div className="relative bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full hover:-translate-y-0.5">
                                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                                        <Image
                                          src={series.icon || `https://picsum.photos/seed/${series.id}/640/360`}
                                          alt={series.name} fill
                                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                                        {series.isFeatured && (
                                          <div className="absolute top-2 right-2">
                                            <Badge className="bg-amber-400 text-slate-900 text-[9px] font-black px-2 h-5 rounded-full border-none">⭐ TOP</Badge>
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-3.5 flex-1 flex flex-col space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <Badge className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 h-4 rounded-full border-none">Mock Series</Badge>
                                          {series.isFree ? (
                                            <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 h-4 rounded-full border-none">FREE</Badge>
                                          ) : (
                                            <Badge className="bg-slate-900 text-white text-[9px] font-black px-2 h-4 rounded-full border-none flex items-center gap-1">
                                              <Lock className="h-2 w-2" /> PRO
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                          <h4 className="font-bold text-slate-900 line-clamp-2 text-xs group-hover:text-blue-600 transition-colors">{series.name}</h4>
                                          <p className="text-[10px] text-slate-500 line-clamp-2">{series.description || "Comprehensive mock series with full analytics and rank tracking."}</p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <PlayCircle className="h-3 w-3 text-blue-500" /> 24 Tests
                                          </span>
                                          <span className="font-bold text-xs flex items-center gap-0.5 group-hover:gap-1.5 transition-all" style={{ color: TB_BLUE }}>
                                            Explore <ChevronRight className="h-3 w-3" />
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                                <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                                  <BookOpen className="h-7 w-7 text-slate-200" />
                                </div>
                                <div className="space-y-1 max-w-xs">
                                  <p className="text-sm font-black text-slate-900">Coming Soon</p>
                                  <p className="text-xs text-slate-500">Our experts are crafting premium content for <span className="font-bold" style={{ color: TB_BLUE }}>{cat.name}</span>. Stay tuned!</p>
                                </div>
                                <button className="h-8 px-5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all">Notify Me</button>
                              </div>
                            )}
                          </div>
                        ))}
                        {folders.length === 0 && !loading && (
                          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                            <Loader2 className="h-7 w-7 text-slate-200" />
                            <p className="text-xs text-slate-400 font-medium">No categories found.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── WHY CHOOSE US ── */}
              {whyItems.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-black text-slate-900">{whyTitle}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {whyItems.map((item: any, i: number) => (
                      <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-xs mb-1">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── TESTIMONIALS ── */}
              {testimonials.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-black text-slate-900">Hear from our students</h2>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 pb-3">
                      {testimonials.map((t: any, i: number) => (
                        <div key={i} className="w-72 shrink-0 bg-white rounded-xl border border-slate-200 p-4 space-y-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                          <Quote className="h-5 w-5 text-blue-200" />
                          <p className="text-xs text-slate-600 leading-relaxed italic">"{t.text}"</p>
                          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-50">
                            {t.avatar ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: TB_BLUE }}>
                                {t.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-black text-slate-900">{t.name}</p>
                              {t.role && <p className="text-[10px] text-slate-400 font-bold">{t.role}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </section>
              )}

              {/* ── FAQ ── */}
              <section className="space-y-3 pb-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 space-y-2">
                    <h2 className="text-sm font-black text-slate-900">Frequently Asked Questions</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Can't find what you're looking for?{" "}
                      <Link href="/profile" className="font-bold hover:underline" style={{ color: TB_BLUE }}>Contact support.</Link>
                    </p>
                  </div>
                  <div className="md:flex-1 space-y-2">
                    {faqs.map((faq: any, i: number) => (
                      <FaqItem key={i} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </div>
              </section>

            </div>
          </>}
        </main>
      </div>
    </div>
  );
}
