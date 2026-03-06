"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsOverview() {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
      <CardHeader className="p-3 pb-0">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 h-8 p-0.5">
            <TabsTrigger value="performance" className="text-[10px] py-1">Stats</TabsTrigger>
            <TabsTrigger value="tasks" className="text-[10px] py-1">Tasks</TabsTrigger>
            <TabsTrigger value="practice" className="text-[10px] py-1">Awards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="pt-3 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Last Mock</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-2xl font-headline font-bold text-primary leading-none">235/360</h3>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[8px] h-3.5 px-1 font-bold">
                    <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> +2%
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Accuracy</p>
                <h3 className="text-xl font-headline font-bold leading-none">62%</h3>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-medium opacity-80">
                <span>Target (270)</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-1.5" />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="pt-3 pb-3 space-y-2">
            {[
              { title: "Physics Quiz", time: "10m", done: true },
              { title: "Review Errors", time: "20m", done: false },
              { title: "Trig Intro", time: "45m", done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/40 border border-white/50">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", task.done ? "bg-green-500" : "bg-primary")} />
                  <span className={cn("text-[11px] font-medium", task.done && "line-through text-muted-foreground")}>
                    {task.title}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">{task.time}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="practice" className="pt-3 pb-3 flex items-center justify-around">
            <div className="text-center space-y-1">
              <Flame className="h-6 w-6 text-primary mx-auto fill-primary" />
              <p className="text-sm font-headline font-bold">18d</p>
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Streak</p>
            </div>
            <div className="text-center space-y-1">
              <Trophy className="h-6 w-6 text-accent mx-auto" />
              <p className="text-sm font-headline font-bold">45</p>
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Badges</p>
            </div>
            <div className="text-center space-y-1">
              <Target className="h-6 w-6 text-blue-500 mx-auto" />
              <p className="text-sm font-headline font-bold">1.2k</p>
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Points</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
