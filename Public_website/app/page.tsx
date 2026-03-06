"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import FeatureShowcase from "@/components/FeatureShowcase";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLaunchClick = () => {
    if (user) {
      router.push("/tools/creator");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <section className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm md:text-base">
          <div>
            <p className="text-2xl md:text-3xl font-extrabold mb-1">6+ hrs</p>
            <p className="text-white/80">weekly time saved per teacher</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold mb-1">10k+</p>
            <p className="text-white/80">mock questions organized in Q-Bank</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold mb-1">95%</p>
            <p className="text-white/80">teachers say tests banwana easy hua</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold mb-1">5k+</p>
            <p className="text-white/80">PDF/PPT sets generated monthly</p>
          </div>
        </div>
      </section>
      <FeatureShowcase />
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Q-Bank ka flow kaise kaam karta hai?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
              Simple 3-step flow jisse aap apna mock test system bina extra tech team ke chala sakte hain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Questions create ya import karein
              </h3>
              <p className="text-sm text-slate-600">
                Apne notes, PDFs ya existing papers se questions add karein. Topics, difficulty aur tags ke saath ek jagah store karein.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Mock tests aur practice sets banayein
              </h3>
              <p className="text-sm text-slate-600">
                Few clicks me full-length mocks, section tests ya PYQ sets assemble karein. PDF, PPT ya online attempt mode choose karein.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Export aur Class me use karein
              </h3>
              <p className="text-sm text-slate-600">
                Generated content ko PDF/PPT me export karein ya Smart Board tool use karke direct class me teach karein.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Teachers aur Institutions ke liye Q-Bank
            </h2>
            <p className="text-slate-600 mb-10 max-w-3xl mx-auto">
              Q-Bank platform teachers aur coaching centers ke liye design kiya gaya hai taki aap apna 
              content management aur teaching workflow digital aur efficient bana sakein.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Question Bank Management
              </h3>
              <p className="text-slate-600 mb-4 text-sm">
                Advanced system jahan aap apne thousands of questions ko organize aur filter kar sakte hain.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• AI-based automated question generation</li>
                <li>• Topic, Difficulty aur Exam-wise categorization</li>
                <li>• Bulk upload aur storage service integration</li>
                <li>• Bilingual (Hindi/English) support built-in</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Export & Teaching Tools
              </h3>
              <p className="text-slate-600 mb-4 text-sm">
                Generated content ko professional formats me export karein ya direct teach karein.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• One-click PDF Question Paper generator</li>
                <li>• Automated PPT Presentation maker for classes</li>
                <li>• Smart Board integration for interactive teaching</li>
                <li>• Custom templates aur branding options</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/download"
              className="px-8 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm sm:text-base hover:bg-slate-800 transition-colors shadow-sm"
            >
              Download Whiteboard
            </Link>
            <Link
              href="/tools"
              className="px-8 py-3 rounded-xl bg-slate-100 text-slate-800 font-semibold text-sm sm:text-base hover:bg-slate-200 transition-colors"
            >
              Explore Teacher Tools
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Teachers Q-Bank ko kyun prefer karte hain?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base">
              Manual paper setting, WhatsApp files aur scattered PDFs se better ek centralized mock test workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Exam-style paper control
              </h3>
              <p className="text-sm text-slate-300">
                Section-wise marks, difficulty mix, bilingual layout aur export options jisse test exactly exam pattern jaisa dikhe.
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Multi-coaching friendly setup
              </h3>
              <p className="text-sm text-slate-300">
                Alag branches, alag teachers aur alag batches ke liye bhi question bank shared raha, leakage ke bina.
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Real-time feedback on attempts
              </h3>
              <p className="text-sm text-slate-300">
                Kaun se topic se sabse zyada galtiyan ho rahi hain, aur content optimization ki kahan zarurat hai – sab ek dashboard se.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Public Website par milne wale main sections
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-3xl mx-auto">
              Yeh website educators ke liye design ki gayi hai jahan se aap blogs, teaching tools 
              aur content generation utility access kar sakte hain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Blogs &amp; Content Hub</h3>
              <p className="text-slate-600 text-sm mb-3">
                Exam-related articles, teaching tips aur updates jo teachers ke liye useful hain.
              </p>
              <ul className="text-slate-700 text-sm space-y-1">
                <li>• Teaching methodology blogs</li>
                <li>• Exam pattern updates</li>
                <li>• SEO friendly content</li>
              </ul>
              <Link href="/blog" className="mt-4 inline-flex text-primary text-sm font-semibold hover:underline">
                Read Blogs
              </Link>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Teacher Utility Tools</h3>
              <p className="text-slate-600 text-sm mb-3">
                Daily-use educational tools jo teachers ka kaam fast aur easy banate hain.
              </p>
              <ul className="text-slate-700 text-sm space-y-1">
                <li>• PDF / PPT generators</li>
                <li>• Content refinement tools</li>
                <li>• Quick utility calculators</li>
              </ul>
              <Link href="/tools" className="mt-4 inline-flex text-primary text-sm font-semibold hover:underline">
                Explore Tools
              </Link>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Question Bank Access</h3>
              <p className="text-slate-600 text-sm mb-3">
                Advanced question bank system jahan se aap mock tests aur study materials assemble kar sakte hain.
              </p>
              <ul className="text-slate-700 text-sm space-y-1">
                <li>• Database of 50k+ questions</li>
                <li>• Smart filtering & search</li>
                <li>• Export to PDF/PPT</li>
              </ul>
              <Link href="/tools/creator" className="mt-4 inline-flex text-primary text-sm font-semibold hover:underline">
                Access Q-Bank
              </Link>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">SEO Pages &amp; Static Info</h3>
              <p className="text-slate-600 text-sm mb-3">
                About, Contact, Privacy Policy jaise pages jo trust build karte hain aur SEO me help karte hain.
              </p>
              <ul className="text-slate-700 text-sm space-y-1">
                <li>• Exam-specific landing pages</li>
                <li>• Location-based pages (future)</li>
                <li>• Index / no-index control backend se</li>
              </ul>
              <Link href="/about" className="mt-4 inline-flex text-primary text-sm font-semibold hover:underline">
                View Static Pages
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Features />
      <Pricing />
      <section className="py-14 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Apne next mock test set ko Q-Bank se bana kar dekhein
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              Teacher login se turant start karein, aur pehla full-length paper minutes me ready karein.
            </p>
          </div>
          <button
            onClick={handleLaunchClick}
            className="px-8 py-3 rounded-xl bg-white text-primary font-semibold text-sm md:text-base hover:bg-slate-100 transition-colors shadow-md"
          >
            Start as Teacher
          </button>
        </div>
      </section>
      <Footer />
    </main>
  );
}
