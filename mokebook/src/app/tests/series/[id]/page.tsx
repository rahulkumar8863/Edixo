"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, 
  Clock, 
  HelpCircle, 
  Calendar,
  Globe,
  Zap,
  Star,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const years = [
  { label: "2024 - 2026", count: "101 Tests", active: true },
  { label: "2022", count: "99 Tests", active: false },
  { label: "2018", count: "73 Tests", active: false },
];

const mockTests = [
  { 
    id: "rrb-group-d-paper-1", 
    title: "RRB Group D Official Paper (Held On: 27 Nov, 2025 Shift 1)", 
    questions: 100, 
    marks: 100.0, 
    time: "90 mins", 
    languages: "English, Hindi + 8 more",
    availableOn: "17 Mar, 2026"
  },
  { 
    id: "rrb-group-d-paper-2", 
    title: "RRB Group D Official Paper (Held On: 27 Nov, 2025 Shift 2)", 
    questions: 100, 
    marks: 100.0, 
    time: "90 mins", 
    languages: "English, Hindi + 8 more",
    availableOn: "19 Mar, 2026"
  },
];

export default function SeriesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeYear, setActiveYear] = useState("2024 - 2026");

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <Navbar />
      <div className="flex-1 flex w-full max-w-full">
        <Sidebar />
        <main className="flex-1 md:ml-0 p-3 md:p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Breadcrumbs & Header */}
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()} 
              className="h-7 px-0 text-[11px] font-bold text-muted-foreground hover:bg-transparent hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg md:text-2xl font-headline font-bold text-slate-900 leading-tight">
                    RRB Group D Mock Test Series 2025-26 (New)
                  </h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-bold h-5 shrink-0">
                    NEW
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-[11px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary fill-primary" /> 273 Total Tests</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 4.8 (12k Ratings)</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> English, Hindi</span>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 h-10 w-full md:w-auto px-6 rounded-xl">
                Unlock All Tests
              </Button>
            </header>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar border-b">
            <Tabs defaultValue="pyp" className="w-full">
              <div className="flex w-full min-w-max">
                <TabsList className="bg-transparent h-auto p-0 rounded-none mb-0 flex gap-4">
                  <TabsTrigger value="chapter" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[12px] md:text-[13px] font-bold px-4 py-3 whitespace-nowrap transition-all">
                    Chapter Test
                  </TabsTrigger>
                  <TabsTrigger value="pyp" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[12px] md:text-[13px] font-bold px-4 py-3 whitespace-nowrap transition-all">
                    Previous Year Paper
                  </TabsTrigger>
                  <TabsTrigger value="sectional" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[12px] md:text-[13px] font-bold px-4 py-3 whitespace-nowrap transition-all">
                    Sectional Test
                  </TabsTrigger>
                  <TabsTrigger value="full" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[12px] md:text-[13px] font-bold px-4 py-3 whitespace-nowrap transition-all">
                    Full Test
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            <div className="lg:col-span-8 space-y-6 overflow-hidden">
              {/* Promo Banner */}
              <Card className="bg-gradient-to-r from-primary to-accent text-white border-none shadow-xl overflow-hidden relative">
                <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shrink-0">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-headline font-bold text-base md:text-lg leading-tight">Mockbook PRO MAX</h3>
                      <p className="text-white/80 text-[10px] md:text-xs font-medium">Unlock 12,000+ tests & video solutions.</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold h-9 w-full sm:w-auto px-5 rounded-xl shadow-md shrink-0">
                    Upgrade Now
                  </Button>
                </CardContent>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </Card>

              {/* Suggested Next Test */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-5 bg-primary rounded-full" />
                  <h2 className="text-sm md:text-base font-headline font-bold text-slate-900">Suggested Next Test</h2>
                </div>
                
                <Card className="border-primary/10 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-green-50 text-white border-none text-[9px] font-bold h-5 px-2 rounded-md">FREE</Badge>
                      <Link 
                        href={`/tests/instructions/rrb-suggested-1`}
                        className="text-primary font-bold text-[11px] md:text-xs flex items-center gap-1 hover:underline underline-offset-4"
                      >
                        Start Test <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-[15px] md:text-lg leading-tight line-clamp-2">
                        RRB Group D Previous Year Paper (Held on: 17 Aug 2022 Shift 1)
                      </h3>
                      <p className="text-[10px] md:text-[11px] font-medium text-slate-400">100 Questions • 90 Minutes • 100.0 Marks</p>
                    </div>
                  </CardContent>
                  <div className="bg-slate-50/50 px-5 py-3 border-t flex flex-wrap gap-x-6 gap-y-2 text-[10px] md:text-[11px] font-bold">
                    <div className="flex items-center gap-1.5 text-primary cursor-pointer hover:underline">
                      <ChevronRight className="h-3 w-3" /> View Syllabus
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Globe className="h-3.5 w-3.5" /> Available in: English, Hindi + 8 more
                    </div>
                  </div>
                </Card>
              </section>

              {/* Year Selection */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm md:text-base font-headline font-bold text-slate-900">Select Exam Year</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                  {years.map((y) => (
                    <button 
                      key={y.label}
                      onClick={() => setActiveYear(y.label)}
                      className={cn(
                        "p-3 md:p-4 rounded-2xl min-w-[110px] md:min-w-[120px] flex flex-col gap-1 transition-all text-left border relative group shrink-0",
                        activeYear === y.label 
                          ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                          : "bg-white text-slate-400 border-slate-100 hover:border-primary/30"
                      )}
                    >
                      <span className="text-xs md:text-sm font-bold">{y.label}</span>
                      <span className={cn("text-[9px] md:text-[11px] font-medium", activeYear === y.label ? "opacity-90" : "text-slate-400")}>{y.count}</span>
                      
                      {activeYear === y.label && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Test List */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-headline font-bold text-slate-900">Official Papers ({activeYear})</h2>
                </div>
                <div className="grid gap-3">
                  {mockTests.map((test) => (
                    <Card key={test.id} className="border border-slate-100 shadow-none rounded-2xl overflow-hidden bg-white group hover:border-primary/30 transition-all">
                      <CardContent className="p-4 md:p-5 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-[14px] md:text-[15px] leading-snug group-hover:text-primary transition-colors">
                              {test.title}
                            </h3>
                            <p className="text-[10px] md:text-[11px] font-medium text-slate-400">
                              {test.questions} Questions • {test.time} • {test.marks.toFixed(1)} Marks
                            </p>
                          </div>
                          <Button 
                            className="bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white font-bold h-9 w-full md:w-auto px-6 rounded-xl transition-all shadow-sm shrink-0"
                            onClick={() => router.push(`/tests/instructions/${test.id}`)}
                          >
                            Start Test
                          </Button>
                        </div>
                      </CardContent>
                      <div className="bg-slate-50/50 px-4 md:px-5 py-2.5 border-t flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500">
                          <Globe className="h-3.5 w-3.5 text-primary" />
                          <span>{test.languages}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>Available on {test.availableOn}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sticky Sidebar */}
            <aside className="lg:col-span-4 space-y-6 w-full overflow-hidden">
              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                <CardHeader className="p-4 md:p-5 bg-slate-50 border-b">
                  <CardTitle className="text-sm md:text-base font-headline font-bold">Why Join This Series?</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-5 space-y-4">
                  {[
                    { icon: Zap, label: "Latest 2024 Exam Pattern", desc: "Curated by top-rankers." },
                    { icon: ShieldCheck, label: "Deep AI Analytics", desc: "Detailed sectional summary." },
                    { icon: Globe, label: "Multi-Language Support", desc: "Hindi, English & 8+ local languages." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[12px] md:text-[13px] font-bold text-slate-900 leading-tight">{item.label}</p>
                        <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-primary/5 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Need Help?</h4>
                  <p className="text-[10px] md:text-[11px] text-muted-foreground px-4 leading-snug">Talk to our exam mentors for personalized guidance.</p>
                </div>
                <Button variant="outline" className="w-full border-primary/20 text-primary font-bold h-9 rounded-xl hover:bg-primary/5 text-xs">
                  Chat with Mentor
                </Button>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}