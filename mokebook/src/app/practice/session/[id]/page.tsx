"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Zap,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const mockQuestions = [
  {
    id: 1,
    text: "Which of the following describes the rate of change of momentum of an object?",
    options: ["Force", "Inertia", "Velocity", "Acceleration"],
    correct: 0,
    explanation: "According to Newton's Second Law, the rate of change of momentum is proportional to the applied force."
  },
  {
    id: 2,
    text: "The value of acceleration due to gravity (g) is minimum at:",
    options: ["Equator", "Poles", "Center of Earth", "None of these"],
    correct: 0,
    explanation: "Due to the centrifugal force and the Earth's bulge, 'g' is minimum at the equator."
  }
];

export default function PracticeSessionPage() {
  const router = useRouter();
  const { id } = useParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [instantFeedbackEnabled, setInstantFeedbackEnabled] = useState(true);

  const q = mockQuestions[currentIdx];

  const handleOptionSelect = (idx: number) => {
    if (showFeedback && instantFeedbackEnabled) return;
    setSelectedOption(idx);
    if (instantFeedbackEnabled) {
      setShowFeedback(true);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < mockQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      router.push("/practice");
    }
  };

  const progress = ((currentIdx + 1) / mockQuestions.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
      {/* Practice Header */}
      <header className="h-14 bg-white border-b px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary fill-primary" /> Practice: {String(id).toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Question {currentIdx + 1} of {mockQuestions.length}</span>
              <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                <Progress value={progress} className="h-full rounded-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/20">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">04:12</span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="instant-feedback" className="text-[10px] font-bold text-muted-foreground uppercase hidden sm:block">Instant Feedback</Label>
            <Switch 
              id="instant-feedback"
              checked={instantFeedbackEnabled} 
              onCheckedChange={setInstantFeedbackEnabled}
              className="data-[state=checked]:bg-primary h-5 w-9"
            />
          </div>
        </div>
      </header>

      {/* Session Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <Card className="shadow-sm border-none">
            <CardContent className="p-6 md:p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2">SINGLE CHOICE</Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-muted-foreground">
                    <Flag className="h-3 w-3 mr-1" /> REPORT
                  </Button>
                </div>
                <h2 className="text-lg md:text-xl font-medium leading-relaxed text-slate-800">
                  {q.text}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correct;
                  const isSelected = i === selectedOption;
                  
                  let stateClasses = "bg-white border-slate-200 hover:border-primary/50";
                  if (showFeedback) {
                    if (isCorrect) stateClasses = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                    else if (isSelected) stateClasses = "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
                    else stateClasses = "bg-slate-50 border-slate-200 opacity-60";
                  } else if (isSelected) {
                    stateClasses = "bg-primary/5 border-primary text-primary ring-1 ring-primary";
                  }

                  return (
                    <button
                      key={i}
                      disabled={showFeedback && instantFeedbackEnabled}
                      onClick={() => handleOptionSelect(i)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border text-left transition-all group relative",
                        stateClasses
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0",
                        isSelected || (showFeedback && isCorrect) ? "bg-white border-transparent" : "bg-slate-50 border-slate-200 group-hover:border-primary/50"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium">{opt}</span>
                      
                      {showFeedback && (
                        <div className="ml-auto">
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-800 uppercase tracking-wider">
                    <HelpCircle className="h-3.5 w-3.5 text-primary" /> Explanation
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Session Footer */}
      <footer className="h-16 bg-white border-t px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold text-muted-foreground hover:bg-slate-100">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {!showFeedback && !instantFeedbackEnabled ? (
            <Button 
              className="bg-primary hover:bg-primary/90 h-10 px-8 font-bold text-xs"
              disabled={selectedOption === null}
              onClick={() => setShowFeedback(true)}
            >
              Check Answer
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90 h-10 px-8 font-bold text-xs"
              onClick={nextQuestion}
            >
              {currentIdx < mockQuestions.length - 1 ? "Next Question" : "Finish Practice"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
