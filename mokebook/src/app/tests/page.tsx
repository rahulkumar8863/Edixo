"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Clock,
  Zap,
  TrendingUp,
  HelpCircle,
  Award,
  BarChart3,
  Users,
  Flame
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const recentSeries = [
  { id: 1, name: "RRB Group D Mock Test Series", progress: 45, tests: "45/100", icon: Zap, color: "bg-red-500", image: "https://picsum.photos/seed/rrb1/640/360" },
  { id: 2, name: "SSC CGL Tier-I Mega Pack", progress: 12, tests: "12/45", icon: Award, color: "bg-blue-500", image: "https://picsum.photos/seed/ssc1/640/360" },
  { id: 3, name: "Current Affairs 2024 Daily", progress: 88, tests: "88/100", icon: TrendingUp, color: "bg-orange-500", image: "https://picsum.photos/seed/ca1/640/360" },
];

const liveQuizzes = [
  { id: 1, title: "General Knowledge for Railways", questions: 20, marks: 20, duration: "10m", live: true, image: "https://picsum.photos/seed/quiz1/640/360" },
  { id: 2, title: "SSC MTS Quant Booster: #24", questions: 25, marks: 50, duration: "20m", live: true, image: "https://picsum.photos/seed/quiz2/640/360" },
  { id: 3, title: "Daily Vocabulary Challenge", questions: 10, marks: 10, duration: "5m", live: false, image: "https://picsum.photos/seed/quiz3/640/360" },
];

const categories = ["SSC", "JEE", "NEET", "UPSC", "Railway", "Banking", "Teaching"];

export default function TestSeriesPage() {
  const [categorySearch, setCategorySearch] = useState("");

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto thin-scrollbar">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Test Series</h1>
              <p className="text-sm text-slate-500 mt-1">Find and attempt your target exam mocks</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search exams (JEE, NEET, SSC)..."
                className="pl-10 h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 hover:border-slate-300"
              />
            </div>
          </div>

          {/* Enrolled Series */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Enrolled Series
              </h2>
              <Button variant="link" size="sm" className="text-primary text-xs font-semibold h-auto p-0 hover:no-underline" asChild>
                <Link href="/tests/my-series">View All →</Link>
              </Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max gap-3 pb-3">
                {recentSeries.map((series) => (
                  <Link key={series.id} href={`/tests/series/${series.id}`} className="block group">
                    <Card className="w-[220px] md:w-[260px] shadow-sm hover:shadow-md transition-all border-none bg-white overflow-hidden rounded-2xl h-full card-hover">
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          src={series.image}
                          alt={series.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-white">
                          <div className={`p-1.5 rounded-lg ${series.color} shadow-sm`}>
                            <series.icon className="h-3 w-3" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wide">Mock Series</span>
                        </div>
                      </div>
                      <CardContent className="p-3.5 space-y-3">
                        <h3 className="text-sm font-bold whitespace-normal line-clamp-2 leading-tight text-slate-800 group-hover:text-primary transition-colors">
                          {series.name}
                        </h3>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">{series.tests} Completed</span>
                            <span className="text-primary">{series.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${series.progress}%` }} />
                          </div>
                        </div>
                        <div className="w-full h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-all">
                          Continue
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          {/* Live & Free Quizzes */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" /> Live & Free
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveQuizzes.map((quiz) => (
                <Link key={quiz.id} href={`/tests/instructions/live-${quiz.id}`} className="group block">
                  <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all border-none bg-white flex flex-col h-full rounded-2xl card-hover">
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden">
                      <Image src={quiz.image} alt={quiz.title} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        {quiz.live && (
                          <Badge className="bg-red-500 text-[10px] h-5 px-2 font-bold animate-pulse rounded-lg">
                            🔴 LIVE
                          </Badge>
                        )}
                        <Badge className="bg-emerald-500 border-none text-[10px] h-5 px-2 font-bold rounded-lg text-white">
                          FREE
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" /> {quiz.questions} Qs</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {quiz.duration}</span>
                      </div>
                      <div className="w-full h-10 flex items-center justify-center rounded-xl bg-accent text-white text-sm font-bold shadow-sm shadow-accent/20 group-hover:bg-accent/90 transition-colors">
                        Register Free
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse Categories */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">Browse Categories</h2>
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Filter category..."
                  className="pl-9 h-9 bg-white border-slate-100 rounded-xl text-sm"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="shadow-sm overflow-hidden border-none bg-white rounded-2xl">
              <Tabs defaultValue="Railway" className="flex flex-col md:flex-row min-h-[280px]">
                <TabsList className="flex md:flex-col items-start justify-start h-auto w-full md:w-48 bg-slate-50 p-2 md:border-r gap-1 overflow-x-auto no-scrollbar border-b md:border-b-0">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <TabsTrigger
                        key={cat}
                        value={cat}
                        className="flex-shrink-0 md:w-full justify-start text-sm font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-xl whitespace-nowrap transition-all"
                      >
                        {cat}
                      </TabsTrigger>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-slate-400 font-medium italic text-center w-full">No results</div>
                  )}
                </TabsList>

                <div className="flex-1 p-4 md:p-6">
                  <TabsContent value="Railway" className="mt-0 outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Link key={i} href={`/tests/series/rrb-ntpc-${i}`} className="group block">
                          <Card className="hover:border-primary/30 border border-slate-100 transition-all cursor-pointer bg-white overflow-hidden flex flex-col h-full shadow-sm rounded-2xl card-hover">
                            <div className="relative aspect-video w-full overflow-hidden">
                              <Image
                                src={`https://picsum.photos/seed/railway${i}/640/360`}
                                alt="Railway Exam"
                                fill
                                className="object-cover transition-transform group-hover:scale-105 duration-500"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                              <div className="absolute top-2.5 right-2.5">
                                <Badge className="text-[10px] h-5 bg-white/90 backdrop-blur font-bold rounded-lg text-slate-700 border-none shadow-sm">
                                  <Users className="h-2.5 w-2.5 mr-1" /> 12k+ Enrolled
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                              <div className="flex justify-between items-start">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                  <Zap className="h-4 w-4" />
                                </div>
                                <Badge className="bg-slate-900 text-[10px] font-bold rounded-lg">2024 PATTERN</Badge>
                              </div>
                              <h4 className="text-sm font-bold line-clamp-2 text-slate-800 group-hover:text-primary transition-colors leading-snug">
                                RRB NTPC Graduate Level 2024 Exam Booster
                              </h4>
                              <p className="text-xs text-slate-400 font-medium">152 Tests · 12 Free Mocks</p>
                              <div className="w-full h-9 flex items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shadow-sm mt-auto group-hover:bg-primary/90 transition-colors">
                                View Series
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>

                  {categories.filter(c => c !== "Railway").map(cat => (
                    <TabsContent key={cat} value={cat} className="mt-0 outline-none text-center py-16">
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
                          <BookOpen className="h-8 w-8 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-800">Explore {cat}</p>
                          <p className="text-sm text-slate-400">Full catalog for {cat} is coming soon.</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-9 text-sm font-semibold border-primary text-primary rounded-xl px-5" asChild>
                          <Link href="/tests/my-series">Browse My Content</Link>
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}