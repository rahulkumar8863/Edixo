"use client";

import Link from "next/link";
import {
  BookOpen,
  Globe,
  Layers,
  Coins,
  TrendingUp,
  Plus,
  Sparkles,
  Upload,
  ArrowUpRight,
  Copy,
  ExternalLink,
  History,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

// Stats data
const statsData = [
  {
    label: "Total Questions",
    value: "2,341",
    change: "+128 this month",
    icon: BookOpen,
    color: "orange",
  },
  {
    label: "Public Questions",
    value: "1,247",
    change: "+89 this month",
    icon: Globe,
    color: "blue",
  },
  {
    label: "Sets Created",
    value: "142",
    change: "+12 this month",
    icon: Layers,
    color: "purple",
  },
  {
    label: "Points Earned (Platform)",
    value: "48,201",
    change: "+3,420 this month",
    icon: Coins,
    color: "green",
  },
];

// Questions by Subject data
const questionsBySubject = [
  { subject: "Physics", questions: 642, color: "#F4511E" },
  { subject: "Chemistry", questions: 534, color: "#2563EB" },
  { subject: "Mathematics", questions: 498, color: "#16A34A" },
  { subject: "Biology", questions: 387, color: "#7C3AED" },
  { subject: "English", questions: 156, color: "#F59E0B" },
  { subject: "Others", questions: 124, color: "#6B7280" },
];

// Usage trend data
const usageTrend = [
  { day: "Mar 1", usage: 42, points: 210 },
  { day: "Mar 2", usage: 58, points: 290 },
  { day: "Mar 3", usage: 34, points: 170 },
  { day: "Mar 4", usage: 87, points: 435 },
  { day: "Mar 5", usage: 92, points: 460 },
  { day: "Mar 6", usage: 67, points: 335 },
  { day: "Mar 7", usage: 74, points: 370 },
];

// Recent usage data
const recentUsage = [
  {
    id: 1,
    question: "Which law states F = ma?",
    org: "Apex Academy",
    teacher: "Rajesh Kumar",
    date: "Mar 1, 2026",
    points: 5,
  },
  {
    id: 2,
    question: "A particle moves with uniform velocity...",
    org: "Brilliant Coaching",
    teacher: "Priya Singh",
    date: "Mar 1, 2026",
    points: 5,
  },
  {
    id: 3,
    question: "Calculate the pH of a 0.1M HCl solution...",
    org: "Excel Institute",
    teacher: "Amit Verma",
    date: "Mar 1, 2026",
    points: 8,
  },
  {
    id: 4,
    question: "The derivative of sin(x) is...",
    org: "Success Classes",
    teacher: "Neha Gupta",
    date: "Feb 28, 2026",
    points: 5,
  },
  {
    id: 5,
    question: "Which organelle is called the powerhouse...",
    org: "Knowledge Park",
    teacher: "Suresh Patel",
    date: "Feb 28, 2026",
    points: 5,
  },
];

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

export default function QuestionBankPage() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Global platform questions — manage, generate, and publish
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/question-generation">
                  <Button variant="outline" className="btn-secondary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </Link>
                <Button variant="outline" className="btn-secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Link href="/question-bank/create">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Question
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {stat.label}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {stat.value}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">{stat.change}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Questions by Subject */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Questions by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={questionsBySubject} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                        <YAxis type="category" dataKey="subject" stroke="#9CA3AF" fontSize={12} width={80} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="questions" fill="#F4511E" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Usage Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="usage"
                          stroke="#F4511E"
                          strokeWidth={2}
                          dot={{ fill: "#F4511E", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Usage Table */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Usage</CardTitle>
                <Link href="/question-bank/usage-log">
                  <Button variant="ghost" size="sm" className="text-brand-primary">
                    View All <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Question Preview</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Used By</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Teacher</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsage.map((usage) => (
                      <TableRow key={usage.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <span className="text-sm text-gray-700 italic truncate max-w-[300px] block">
                            {usage.question}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{usage.org}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-brand-primary">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{usage.teacher}</TableCell>
                        <TableCell className="text-sm text-gray-500">{usage.date}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                            <Coins className="w-3 h-3" />
                            {usage.points}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/question-bank/questions">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Manage Questions</div>
                      <div className="text-sm text-gray-500">View, edit, and organize all questions</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/sets">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Question Sets</div>
                      <div className="text-sm text-gray-500">Create and manage question sets</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/marketplace">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Marketplace</div>
                      <div className="text-sm text-gray-500">Browse public questions catalog</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/usage-log">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                      <History className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Usage Log</div>
                      <div className="text-sm text-gray-500">Track question usage & points</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
