
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Bookmark,
  Smile,
  Frown,
  User as UserIcon,
  BookOpen,
  Target,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const marksDistributionData = [
  { marks: "0-5", students: 800 },
  { marks: "5-10", students: 1500 },
  { marks: "10-15", students: 2800 },
  { marks: "15-20", students: 4200 },
  { marks: "20-25", students: 5100 },
  { marks: "25-30", students: 4500 },
  { marks: "30-35", students: 3200 },
  { marks: "35-40", students: 1800 },
  { marks: "40-45", students: 900 },
  { marks: "45-50", students: 300 },
];

const leaderboardData = [
  { name: "A.D.", score: "48/50", rank: 1 },
  { name: "Vikas Kumar", score: "47/50", rank: 2 },
  { name: "TENSAI", score: "46/50", rank: 3 },
  { name: "Kuldeep Sen", score: "45/50", rank: 4 },
  { name: "Zain Ali", score: "44/50", rank: 5 },
  { name: "Rahul Raj", score: "43/50", rank: 6 },
  { name: "Sneha W.", score: "42/50", rank: 7 },
];

const mockSolutions = [
  { id: 1, status: "incorrect", time: "00:07", accuracy: "42%", text: "यदि P का 40 प्रतिशत = Q का 0.5 = R का 2/7 है, तो P : Q : R ज्ञात कीजिए।", points: -0.33 },
  { id: 2, status: "incorrect", time: "00:04", accuracy: "78%", text: "सरल करें: 1 / (5 + √3) + 1 / (5 - √3)", points: -0.33 },
  { id: 3, status: "correct", time: "00:14", accuracy: "82%", text: "एक ट्रेन 2 मिनट में 1.5 किमी की यात्रा करती है। यह 2 घंटे और 10 मिनट में कितनी दूरी तय करेगी?", points: 1.0 },
  { id: 4, status: "unattempted", time: "--:--", accuracy: "19%", text: "दो व्यक्ति, X and Y, एक मैदान किराए पर लेते हैं। X 10 भैंसों को 5 महीने के लिए...", points: 0 },
];

export default function AnalyticsPage() {
  const [activeSolutionFilter, setActiveSolutionFilter] = useState("all");
  const params = useParams();
  const testId = params?.id || "rrb-group-d-mock";

  const overallStats = [
    { label: "Rank", value: "22972/25787", icon: Trophy, color: "bg-red-500", text: "text-red-500" },
    { label: "Score", value: "11.5/50", icon: Award, color: "bg-purple-500", text: "text-purple-600" },
    { label: "Attempted", value: "7/25", icon: Zap, color: "bg-blue-500", text: "text-blue-600" },
    { label: "Accuracy", value: "85.71%", icon: CheckCircle2, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Percentile", value: "14.25%", icon: TrendingUp, color: "bg-indigo-500", text: "text-indigo-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-5 bg-white border-b shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Analysis & Performance</h1>
                <p className="text-xs text-slate-400 mt-0.5">Detailed sectional summary and rank prediction</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 px-4 rounded-xl text-sm font-semibold bg-white border-slate-200 gap-2">
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button className="h-9 px-4 rounded-xl text-sm font-bold bg-primary shadow-sm shadow-primary/20" onClick={() => window.history.back()}>
                  Re-attempt Test
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="analysis" className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="bg-white border-b sticky top-0 z-30">
              <div className="max-w-7xl mx-auto px-4 md:px-5">
                <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6 md:gap-8">
                  {["analysis", "solutions", "leaderboard"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="h-full rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary font-bold text-sm px-0 uppercase tracking-wider capitalize"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar">
              <div className="max-w-7xl mx-auto w-full">

                {/* ANALYSIS TAB */}
                <TabsContent value="analysis" className="m-0 p-4 md:p-5 space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {overallStats.map((stat) => (
                      <Card key={stat.label} className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl text-white shrink-0", stat.color)}>
                            <stat.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                            <p className={cn("text-sm font-bold leading-none truncate", stat.text)}>{stat.value}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Cutoff Alert */}
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">You scored <span className="text-primary italic">23.5 Marks</span> less than cutoff!</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Cutoff: 35.0 | Your Score: 11.5</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 self-stretch sm:self-auto">
                        <div className="text-center px-3 border-r">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Gap</p>
                          <p className="text-xl font-bold text-red-500">-23.5</p>
                        </div>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl px-4">
                          Unlock Coaching
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 space-y-4">
                      {/* Sectional Summary */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="p-4 border-b bg-slate-50/50">
                          <CardTitle className="text-sm font-bold">Sectional Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/30">
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-slate-400">Section</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-slate-400">Score</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-center text-slate-400">Accuracy</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-right text-slate-400">Time</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[
                                { name: "Quantitative Aptitude", score: "11.5/50", accuracy: "85.7%", time: "19:54 / 30m", color: "text-red-500" },
                                { name: "General Intelligence", score: "24.0/50", accuracy: "92.1%", time: "22:10 / 30m", color: "text-emerald-600" },
                                { name: "General Science", score: "18.5/50", accuracy: "78.4%", time: "12:45 / 30m", color: "text-blue-600" },
                              ].map((row) => (
                                <TableRow key={row.name} className="hover:bg-slate-50/50">
                                  <TableCell className="text-sm font-semibold py-3.5 text-slate-700">{row.name}</TableCell>
                                  <TableCell className={cn("text-sm font-bold", row.color)}>{row.score}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] h-5 px-2 font-bold">{row.accuracy}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-xs font-mono text-slate-400">{row.time}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {/* Marks Distribution */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> Marks Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] p-4 pt-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={marksDistributionData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                              <XAxis dataKey="marks" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '11px' }} />
                              <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                      {/* Strengths & Weaknesses */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold">Strengths & Weaknesses</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 space-y-2">
                            <p className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3" /> Critical Weakness
                            </p>
                            <h4 className="text-sm font-bold text-slate-800">Trigonometric Ratios</h4>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-red-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: '12%' }} />
                              </div>
                              <span className="text-xs font-bold text-red-500">12%</span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Area of Strength
                            </p>
                            <h4 className="text-sm font-bold text-slate-800">Time & Speed</h4>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                              </div>
                              <span className="text-xs font-bold text-emerald-500">92%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rank Predictor */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold">Rank Predictor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="w-full h-9 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 rounded-xl relative mb-8">
                            <div className="absolute top-1/2 left-[14%] -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-3 border-white shadow-lg z-10" />
                            <div className="absolute -top-8 left-[14%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                              Rank 22972
                            </div>
                          </div>
                          <p className="text-xs text-center text-slate-400 italic">
                            Projected rank: Top 88% of all aspirants
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* SOLUTIONS TAB */}
                <TabsContent value="solutions" className="m-0 p-4 md:p-5 space-y-4">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: "all", label: "All", count: 25 },
                      { id: "incorrect", label: "Incorrect", count: 2 },
                      { id: "unattempted", label: "Unattempted", count: 23 },
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        size="sm"
                        onClick={() => setActiveSolutionFilter(filter.id)}
                        className={cn(
                          "rounded-full h-9 px-5 text-sm font-bold transition-all shrink-0",
                          activeSolutionFilter === filter.id ? "bg-primary text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:border-primary/30"
                        )}
                      >
                        {filter.label} ({filter.count})
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">संख्यात्मक योग्यता (Quantitative Aptitude)</h3>
                    <p className="text-xs text-slate-400 font-semibold">25 Questions</p>
                  </div>

                  <div className="space-y-3">
                    {mockSolutions.map((q, idx) => (
                      <Card key={q.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm",
                                q.status === "incorrect" ? "bg-red-500" : q.status === "correct" ? "bg-emerald-500" : "bg-slate-200"
                              )}>
                                {q.id}
                              </div>
                              <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {q.time}</span>
                                <span className="w-px h-3 bg-slate-200" />
                                <span className="flex items-center gap-1">
                                  {q.status === "incorrect" ? <Frown className="h-3.5 w-3.5" /> : <Smile className="h-3.5 w-3.5" />}
                                  {q.accuracy} accuracy
                                </span>
                              </div>
                            </div>
                            <Bookmark className="h-4 w-4 text-slate-200 cursor-pointer hover:text-primary transition-colors" />
                          </div>

                          <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>

                          <Separator className="bg-slate-50" />

                          <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary p-0 hover:bg-transparent flex items-center gap-1" asChild>
                              <Link href={`/tests/solutions/${testId}?q=${idx}`}>
                                VIEW SOLUTION <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            {q.points !== 0 && (
                              <Badge className={cn("text-[10px] h-5 px-2 rounded-lg font-bold", q.points > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                                {q.points > 0 ? `+${q.points}` : q.points}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* LEADERBOARD TAB */}
                <TabsContent value="leaderboard" className="m-0 flex flex-col relative pb-20">
                  <div className="p-4 md:p-5 space-y-5">
                    <Button
                      variant="outline"
                      className="w-full max-w-lg mx-auto flex rounded-full h-11 bg-white border-slate-100 shadow-sm items-center justify-center gap-2 group"
                      onClick={() => window.location.reload()}
                    >
                      <span className="text-blue-600 font-bold text-sm">Reattempt Test</span>
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </Button>

                    {/* Podium */}
                    <div className="relative pt-8 pb-4 px-6 rounded-3xl bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-100 shadow-sm max-w-xl mx-auto">
                      <div className="flex items-end justify-center gap-6 md:gap-12">
                        {/* Rank 2 */}
                        <div className="flex flex-col items-center gap-2 mb-3">
                          <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                            <AvatarImage src="https://picsum.photos/seed/shallu/100" />
                            <AvatarFallback>S</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-black -mt-5 ml-10 border-2 border-white shadow-sm">2</div>
                          <div className="text-center -mt-1">
                            <p className="text-xs font-bold text-slate-800">Shallu</p>
                            <p className="text-[10px] text-slate-400 font-semibold">50/50</p>
                          </div>
                        </div>

                        {/* Rank 1 */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            <div className="absolute -inset-4 bg-amber-400/15 rounded-full animate-pulse" />
                            <Avatar className="h-20 w-20 border-4 border-amber-400 shadow-xl relative z-10 ring-4 ring-white/50">
                              <AvatarImage src="https://picsum.photos/seed/ayodhya/100" />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-black z-20 border-2 border-white shadow-sm">1</div>
                          </div>
                          <div className="text-center mt-1">
                            <p className="text-sm font-bold text-slate-900">Ayodhya</p>
                            <p className="text-xs text-slate-400 font-semibold">50/50</p>
                          </div>
                        </div>

                        {/* Rank 3 */}
                        <div className="flex flex-col items-center gap-2 mb-3">
                          <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                            <AvatarImage src="https://picsum.photos/seed/dhanesh/100" />
                            <AvatarFallback>D</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-black -mt-5 ml-10 border-2 border-white shadow-sm">3</div>
                          <div className="text-center -mt-1">
                            <p className="text-xs font-bold text-slate-800">Dhanesh</p>
                            <p className="text-[10px] text-slate-400 font-semibold">50/50</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard list */}
                    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border-none overflow-hidden">
                      <div className="divide-y divide-slate-50">
                        {leaderboardData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-300 w-5 text-center">{idx + 1}</span>
                              <Avatar className="h-9 w-9 border border-slate-100">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{item.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{item.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sticky bottom: Your rank */}
                  <div className="fixed bottom-0 left-0 right-0 p-3 bg-blue-50 border-t border-blue-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-900">22972</span>
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-slate-300 text-white"><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-bold text-slate-800">Aspirant (You)</span>
                          <div><span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Top 88%</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">11.5/50.0</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
