
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Plus, Target, Clock, Loader2, ChevronRight, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function StudyPlansPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const plansQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "study_plans"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: plans, isLoading } = useCollection(plansQuery);

  const handleCreateDemo = async () => {
    if (!user || !db) return;
    setIsSeeding(true);

    const demoPlanId = `demo-${Date.now()}`;
    const demoPlanRef = doc(db, "users", user.uid, "study_plans", demoPlanId);

    const demoData = {
      id: demoPlanId,
      userId: user.uid,
      topic: "Trigonometry Mastery",
      summary: "A high-intensity 7-day roadmap focusing on JEE-level identities, ratios, and height-distance applications.",
      durationDays: 7,
      totalDays: 7,
      daysCompleted: 0,
      currentLevelPercentage: 45,
      targetLevelPercentage: 90,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dailyTasks: [
        {
          day: 1,
          tasks: [
            { type: "Watch", title: "Introduction to Ratios", duration: "25m", status: "pending" },
            { type: "Read", title: "Fundamental Identities", duration: "15m", status: "pending" },
            { type: "Practice", title: "Basic Ratio Quiz", duration: "20m", status: "pending" }
          ]
        },
        {
          day: 2,
          tasks: [
            { type: "Read", title: "Compound Angle Formulas", duration: "30m", status: "pending" },
            { type: "Watch", title: "Advanced Identity Proofs", duration: "40m", status: "pending" },
            { type: "Practice", title: "Identities Level 1", duration: "30m", status: "pending" }
          ]
        },
        {
          day: 3,
          tasks: [
            { type: "Quiz", title: "Mid-Plan Assessment", duration: "15m", status: "pending" },
            { type: "Practice", title: "Previous Year Drills", duration: "45m", status: "pending" }
          ]
        }
      ]
    };

    try {
      await setDoc(demoPlanRef, demoData);
      toast({
        title: "Demo Plan Created",
        description: "You can now explore the interactive Trigonometry plan.",
      });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: demoPlanRef.path,
        operation: 'create',
        requestResourceData: demoData
      }));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <header className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-headline font-bold text-slate-900">AI Study Plans</h1>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Your personalized roadmaps to exam mastery.
              </p>
            </header>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                className="h-11 px-4 text-xs font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                onClick={handleCreateDemo}
                disabled={isSeeding}
              >
                {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                Generate Demo
              </Button>
              <Button className="bg-primary hover:bg-primary/90 h-11 px-6 text-xs font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 group" asChild>
                <Link href="/study-plans/create">
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                  New Plan
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading your path...</p>
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan: any) => {
                const totalTasks = plan.dailyTasks?.flatMap((d: any) => d.tasks).length || 0;
                const completedTasks = plan.dailyTasks?.flatMap((d: any) => d.tasks).filter((t: any) => t.status === 'completed').length || 0;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <Link key={plan.id} href={`/study-plans/${plan.id}`} className="group block">
                    <Card className="relative overflow-hidden hover:shadow-xl transition-all rounded-[1.5rem] border-none bg-white shadow-sm ring-1 ring-slate-100 h-full">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10 group-hover:bg-primary transition-colors" />
                      
                      <CardHeader className="p-5 pb-3">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-[9px] font-bold h-5 px-2 rounded-md">
                            {plan.status?.toUpperCase() || 'ACTIVE'}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                            <Clock className="h-3.5 w-3.5" />
                            {plan.totalDays} Days
                          </div>
                        </div>
                        <CardTitle className="text-[15px] md:text-lg font-bold pt-3 group-hover:text-primary transition-colors line-clamp-1">
                          {plan.topic}
                        </CardTitle>
                        <CardDescription className="text-[11px] line-clamp-2 min-h-[32px] leading-relaxed">
                          {plan.summary}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="space-y-0.5">
                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-tight">Starting At</p>
                            <p className="text-sm font-bold text-slate-700">{plan.currentLevelPercentage}%</p>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <p className="text-[9px] uppercase font-bold text-primary tracking-tight">Target Goal</p>
                            <p className="text-sm font-bold text-primary">{plan.targetLevelPercentage}%</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-wider">Plan Progress</span>
                            <span className="text-primary">{progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-1000 ease-out" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1">
                          <span>{completedTasks}/{totalTasks} Tasks Done</span>
                          <span className="flex items-center gap-1 text-primary">
                            CONTINUE <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center bg-white rounded-[2.5rem] shadow-sm border-slate-200">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                <Target className="h-10 w-10 text-primary/40" />
              </div>
              <CardTitle className="text-xl font-headline font-bold text-slate-900">Start Your Success Journey</CardTitle>
              <CardDescription className="text-sm mt-2 mb-8 max-w-sm mx-auto leading-relaxed">
                Describe your weak areas or goals, and our AI will build a step-by-step 7-day schedule just for you.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 px-8 text-sm font-bold rounded-2xl border-primary text-primary hover:bg-primary/5"
                  onClick={handleCreateDemo}
                  disabled={isSeeding}
                >
                  {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Try Demo Plan
                </Button>
                <Button className="bg-primary hover:bg-primary/90 h-12 px-10 text-sm font-bold rounded-2xl shadow-xl shadow-primary/20" asChild>
                  <Link href="/study-plans/create">Build My First Plan</Link>
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
