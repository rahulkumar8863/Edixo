"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Bot, BarChart3, BookOpen,
  Trophy, Flame, TrendingUp, Clock,
  Users, Sparkles, ChevronRight, Play,
  CheckCircle2, Star, Zap, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useOrganization } from "@/providers/OrganizationProvider";

function useCountUp(target: number, duration = 2000, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s: number | null = null;
    const raf = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

function useTyped(words: string[], speed = 80, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setWordIdx((i) => i + 1); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, speed, pause]);
  return text;
}

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { org, loading: orgLoading } = useOrganization();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && !isUserLoading) {
      router.push("/tests");
    }
  }, [user, isUserLoading, router]);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);
  const students = useCountUp(50000, 2000, statsActive);
  const mocks = useCountUp(12000, 2000, statsActive);
  const success = useCountUp(92, 1600, statsActive);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const typedWord = useTyped(["SSC CGL", "JEE Mains", "NEET", "UPSC", "Railway", "Banking"], 90, 1600);

  if (!mounted || orgLoading || (user && !isUserLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#1a73e8 transparent #1a73e8 #1a73e8" }} />
          <p className="text-sm font-semibold text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    { title: "AI Study Planner", desc: "Dynamic roadmap based on your strengths and weaknesses.", icon: Bot, iconBg: "#eff6ff", iconColor: "#1a73e8", badge: "AI" },
    { title: "Real-time Analytics", desc: "Granular subject-wise insights with percentile & rank.", icon: BarChart3, iconBg: "#f0fdf4", iconColor: "#16a34a", badge: null },
    { title: "Premium Mock Tests", desc: "High-quality mocks crafted by top exam experts.", icon: BookOpen, iconBg: "#fff7ed", iconColor: "#ea580c", badge: "1200+" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #e8f0fe 50%, #fff 100%)" }}>
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231a73e8' fill-opacity='1'%3E%3Crect x='0' y='0' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: "40px 40px" }}
        />

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold tracking-wide mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              Next-Gen Mock Test Platform
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-4">
              Crack{" "}
              <span className="relative inline-block" style={{ color: "#1a73e8" }}>
                {typedWord || "\u00a0"}
                <span className="inline-block w-0.5 h-[0.8em] align-middle ml-0.5 bg-blue-500 animate-pulse" />
              </span>
              <br />
              with <span style={{ color: "#1a73e8" }}>AI Precision.</span>
            </h1>

            <p className="text-sm md:text-base text-slate-500 max-w-xl leading-relaxed mb-6 font-medium">
              Personalized study plans, real-time analytics, and thousands of premium mock tests tailored to your success.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 h-10 px-7 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #1a73e8, #0057d9)", boxShadow: "0 4px 14px rgba(26,115,232,0.35)" }}
              >
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tests"
                className="flex items-center gap-2 h-10 px-7 rounded-lg font-bold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 bg-white"
              >
                Explore Courses
              </Link>
            </div>

            {/* Stats row */}
            <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 w-full max-w-2xl">
              {[
                { label: "Active Students", value: students >= 50000 ? "50K+" : `${students.toLocaleString()}+` },
                { label: "Mock Tests", value: mocks >= 12000 ? "12K+" : `${mocks.toLocaleString()}+` },
                { label: "Success Rate", value: `${success}%` },
                { label: "AI Study Plans", value: "25K+" }
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-10 md:py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Everything you need to crack your exam</h2>
          <p className="text-slate-500 text-sm font-medium max-w-lg mx-auto">Powerful tools built specifically for competitive exam preparation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-5 rounded-xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: f.iconBg }}
              >
                <f.icon className="h-5 w-5" style={{ color: f.iconColor }} />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-black text-slate-900">{f.title}</h3>
                {f.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: "#1a73e8" }}>{f.badge}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-10 md:py-14 px-4 md:px-8" style={{ background: "#F0F2F8" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Why students trust us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle2, label: "Exam Pattern Mocks", color: "#1a73e8" },
              { icon: BarChart3, label: "Deep Analytics", color: "#16a34a" },
              { icon: Bot, label: "AI Study Plans", color: "#7c3aed" },
              { icon: Shield, label: "1M+ Students", color: "#ea580c" },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-4 flex flex-col items-center text-center gap-2 border border-slate-100"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.color + "14" }}>
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-2xl p-8 md:p-10 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a73e8, #0047cc)" }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <h2 className="text-xl md:text-2xl font-black mb-2 relative">Start your free preparation today</h2>
            <p className="text-blue-100 text-sm font-medium mb-5 relative max-w-md mx-auto">
              Join 50,000+ students who are already cracking competitive exams with us.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-10 px-7 rounded-lg font-bold text-sm bg-white hover:bg-blue-50 transition-all"
              style={{ color: "#1a73e8" }}
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            {org?.logoUrl ? (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
              </div>
            ) : (
              <span
                className="text-white p-1.5 rounded-lg text-xs font-black w-8 h-8 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a73e8, #0057d9)" }}
              >
                {org?.name?.charAt(0) || "M"}
              </span>
            )}
            <span className="text-base font-bold text-slate-900">{org?.name || "Mockbook"}</span>
          </div>

          <div className="flex gap-6 text-sm font-semibold text-slate-500">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>

          <p className="text-sm text-slate-400">© 2026 {org?.name || "Mockbook"}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
