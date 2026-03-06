
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Clock, 
  BarChart3, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Share2,
  Bookmark,
  Smile,
  Frown,
  ArrowLeft,
  Filter,
  User as UserIcon,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from "recharts";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sectionData = [
  { name: "Science", score: 85, total: 100, color: "#10b981" },
  { name: "Maths", score: 45, total: 100, color: "#ef4444" },
  { name: "Reasoning", score: 72, total: 100, color: "#f59e0b" },
  { name: "Awareness", score: 60, total: 100, color: "#3b82f6" },
];

const marksDistributionData = [
  { marks: "0-5", students: 800 },
  { marks: "5-10", students: 1500 },
  { marks: "10-15", students: 2800 },
  { marks: "15-20", students: 4200 },
  { marks: "20-25", students: 5100 },
];

const mockSolutions = [
  {
    id: 1,
    status: "incorrect",
    time: "00:07",
    accuracy: "42%",
    text: "यदि P का 40 प्रतिशत = Q का 0.5 = R का 2/7 है, तो P : Q : R ज्ञात कीजिए।",
    points: -0.33
  },
  {
    id: 2,
    status: "incorrect",
    time: "00:04",
    accuracy: "78%",
    text: "सरल करें: 1 / (5 + √3) + 1 / (5 - √3)",
    points: -0.33
  },
  {
    id: 3,
    status: "correct",
    time: "00:14",
    accuracy: "82%",
    text: "एक ट्रेन 2 मिनट में 1.5 किमी की यात्रा करती है। यह 2 घंटे और 10 मिनट में कितनी दूरी तय करेगी?",
    points: 1.0
  },
  {
    id: 4,
    status: "unattempted",
    time: "--:--",
    accuracy: "19%",
    text: "दो व्यक्ति, X and Y, एक मैदान किराए पर लेते हैं। X 10 भैंसों को 5 महीने के लिए और 12 भेड़ों को 3 महीने के लिए रखता है। Y 15 भेड़ों को 4 महीने के...",
    points: 0
  }
];

const topRankers = [
  { name: "Ayodhya", score: "50/50.0", rank: 1, image: "https://picsum.photos/seed/ayodhya/100" },
  { name: "Shallu", score: "50/50.0", rank: 1, image: "https://picsum.photos/seed/shallu/100" },
  { name: "Dhanesh", score: "50/50.0", rank: 1, image: "https://picsum.photos/seed/dhanesh/100" },
];

const rankList = [
  { name: "GopiShankar", score: "50/50", rank: 1, image: "https://picsum.photos/seed/gopi/100" },
  { name: "Hiranmay Ghosh", score: "50/50", rank: 1, image: "https://picsum.photos/seed/hiran/100" },
  { name: "NANDINI KUSHWAH", score: "50/50", rank: 1, image: "https://picsum.photos/seed/nandini/100" },
  { name: "Saurabh", score: "50/50", rank: 1, image: "https://picsum.photos/seed/saurabh/100" },
  { name: "Archana Sen", score: "50/50", rank: 1, image: "https://picsum.photos/seed/archana/100" },
  { name: "Daksh Sehrawat", score: "50/50", rank: 1, image: "https://picsum.photos/seed/daksh/100" },
];

export default function TestResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Production Header */}
          <header className="bg-slate-900 text-white px-4 h-14 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-white h-9 w-9" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col -space-y-0.5">
                <h1 className="text-xs md:text-sm font-bold uppercase tracking-tight truncate max-w-[200px]">
                  PYST 3: SSC CGL 2025 Tier-I Si...
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="text-white h-9 w-9">
                 <Share2 className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" className="text-white h-9 w-9">
                 <Zap className="h-4 w-4" />
               </Button>
            </div>
          </header>

          <Tabs defaultValue="analysis" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 bg-white h-12 p-0 rounded-none border-b shadow-sm shrink-0">
              <TabsTrigger value="analysis" className="h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-bold text-xs">Analysis</TabsTrigger>
              <TabsTrigger value="solutions" className="h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-bold text-xs">Solutions</TabsTrigger>
              <TabsTrigger value="leaderboard" className="h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-bold text-xs">Leaderboard</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="analysis" className="m-0 p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: "Rank", value: "22972/25787", icon: Trophy, color: "bg-red-500", text: "text-red-500" },
                    { label: "Score", value: "11.5/50", icon: Target, color: "bg-purple-500", text: "text-purple-500" },
                    { label: "Attempted", value: "7/25", icon: Zap, color: "bg-blue-400", text: "text-blue-400" },
                    { label: "Accuracy", value: "85.71%", icon: CheckCircle2, color: "bg-green-500", text: "text-green-500" },
                    { label: "Percentile", value: "14.25%", icon: TrendingUp, color: "bg-indigo-500", text: "text-indigo-500" },
                  ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm bg-white">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl text-white shadow-sm shrink-0", stat.color)}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                          <p className={cn("text-sm font-bold leading-none", stat.text)}>{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm">Sectional Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="text-[10px] h-10 font-bold uppercase">Section Name</TableHead>
                          <TableHead className="text-[10px] h-10 font-bold uppercase">Score</TableHead>
                          <TableHead className="text-[10px] h-10 font-bold uppercase">Accuracy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sectionData.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell className="text-[11px] font-bold py-3">{row.name}</TableCell>
                            <TableCell className="text-[11px] font-bold">{row.score}/100</TableCell>
                            <TableCell>
                              <Badge className={cn("text-[9px] h-5 px-2", row.score > 70 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                                {row.score}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> Marks Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px] p-4 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marksDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="marks" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: 'hsl(var(--primary))'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solutions" className="m-0 flex flex-col h-full">
                <div className="p-4 space-y-4">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: "all", label: "All", count: 25 },
                      { id: "incorrect", label: "Incorrect", count: 2 },
                      { id: "unattempted", label: "Unattempted", count: 23 },
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        size="sm"
                        variant={activeFilter === filter.id ? "default" : "outline"}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          "rounded-full h-8 px-4 text-[11px] font-bold transition-all",
                          activeFilter === filter.id ? "bg-blue-600 shadow-md shadow-blue-200" : "bg-white text-slate-500"
                        )}
                      >
                        {filter.label} ({filter.count})
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">संख्यात्मक योग्यता</h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">25 Questions</p>
                  </div>

                  <div className="space-y-3">
                    {mockSolutions.map((q) => (
                      <Card key={q.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-110",
                                q.status === "incorrect" ? "bg-red-500" : q.status === "correct" ? "bg-green-500" : "bg-slate-300"
                              )}>
                                {q.id}
                              </div>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{q.time}</span>
                                </div>
                                <div className="h-3 w-px bg-slate-200" />
                                <div className="flex items-center gap-1">
                                  {q.status === "incorrect" ? <Frown className="h-3 w-3" /> : <Smile className="h-3 w-3" />}
                                  <span>{q.accuracy} got it right</span>
                                </div>
                              </div>
                            </div>
                            <Bookmark className="h-4 w-4 text-slate-300 cursor-pointer hover:text-primary transition-colors" />
                          </div>
                          
                          <p className="text-[13px] font-medium text-slate-700 leading-relaxed">
                            {q.text}
                          </p>

                          <div className="pt-2 flex items-center justify-between">
                             <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary p-0 hover:bg-transparent">
                               VIEW SOLUTION <ChevronRight className="h-3 w-3 ml-0.5" />
                             </Button>
                             {q.points !== 0 && (
                               <Badge className={cn("text-[9px] h-5", q.points > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                                 {q.points > 0 ? `+${q.points}` : q.points}
                               </Badge>
                             )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="leaderboard" className="m-0 flex flex-col h-full bg-white relative">
                <div className="p-4 space-y-6 pb-24">
                  {/* Reattempt Banner */}
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      className="w-full max-w-md rounded-full h-12 bg-white border-slate-100 shadow-sm flex items-center justify-center gap-2 group relative overflow-hidden"
                      onClick={() => router.push(`/tests/instructions/${id}`)}
                    >
                      <span className="text-blue-500 font-bold text-sm">Reattempt Test</span>
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-white" />
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                         <BookOpen className="h-8 w-8 text-blue-500 rotate-12" />
                      </div>
                    </Button>
                  </div>

                  {/* Podium */}
                  <div className="relative pt-8 pb-4 px-4 rounded-3xl bg-[#fffef0] border border-yellow-50">
                    <div className="flex items-end justify-center gap-4 md:gap-12">
                      {/* Rank 2 */}
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white shadow-md">
                            <AvatarImage src={topRankers[0].image} />
                            <AvatarFallback>{topRankers[0].name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">1</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-800">{topRankers[0].name}</p>
                          <p className="text-[10px] font-medium text-slate-500">{topRankers[0].score}</p>
                        </div>
                      </div>

                      {/* Rank 1 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-yellow-400/10 rounded-full animate-pulse" />
                          <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-orange-400 shadow-xl relative z-10">
                            <AvatarImage src={topRankers[1].image} />
                            <AvatarFallback>{topRankers[1].name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-400 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-bold z-20">1</div>
                        </div>
                        <div className="text-center pt-2">
                          <p className="text-sm font-bold text-slate-900">{topRankers[1].name}</p>
                          <p className="text-[11px] font-medium text-slate-600">{topRankers[1].score}</p>
                        </div>
                      </div>

                      {/* Rank 3 */}
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white shadow-md">
                            <AvatarImage src={topRankers[2].image} />
                            <AvatarFallback>{topRankers[2].name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">1</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-800">{topRankers[2].name}</p>
                          <p className="text-[10px] font-medium text-slate-500">{topRankers[2].score}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rank List */}
                  <div className="divide-y border-t mt-4">
                    {rankList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-400 w-4">{item.rank}</span>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={item.image} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{item.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky Current User Rank */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#e8f0fe] border-t border-blue-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-900">19138</span>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-slate-300 text-white"><UserIcon className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-slate-800">Aradhana Singh(You)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">-1.0/50.0</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">Marks</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
