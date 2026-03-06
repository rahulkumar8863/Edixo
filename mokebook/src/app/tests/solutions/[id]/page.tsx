
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Clock, 
  Bookmark, 
  Languages, 
  Menu, 
  Filter, 
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const mockQuestions = [
  {
    id: 1,
    text: "जो सम्बन्ध \"रबर\" का \"वृक्ष\" से है, वही सम्बन्ध \"रेशम\" का किसके साथ है?",
    options: ["कपड़ा", "कीट", "फैब्रिक", "बुनाई"],
    correct: 1,
    time: "0sec",
    marks: "+1.0 -0.33",
    accuracy: "65%",
    explanation: `यहाँ अनुसरित तर्क है,
रबड़ : वृक्ष → रबड़, वृक्षों से प्राप्त होता है।
इसी प्रकार,
रेशम : कीड़ा → रेशम, कीट से प्राप्त होता है।
अतः, सही उत्तर "कीट" है।`
  },
  {
    id: 2,
    text: "यदि 2x + 5 = 15, तो x का मान क्या होगा?",
    options: ["5", "10", "7.5", "2.5"],
    correct: 0,
    time: "12sec",
    marks: "+1.0 -0.33",
    accuracy: "78%",
    explanation: "2x + 5 = 15 \n2x = 10 \nx = 5"
  }
];

export default function SolutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const qIndexParam = searchParams.get('q');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reattemptMode, setReattemptMode] = useState(false);

  useEffect(() => {
    if (qIndexParam) {
      setCurrentIdx(parseInt(qIndexParam));
    }
  }, [qIndexParam]);

  const q = mockQuestions[currentIdx] || mockQuestions[0];

  const nextQuestion = () => {
    if (currentIdx < mockQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xs md:text-sm font-bold uppercase tracking-tight truncate max-w-[200px]">
            RRB Group D: General Intelligen...
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Languages className="h-5 w-5" />
          <Menu className="h-5 w-5" />
        </div>
      </header>

      {/* Palette Bar */}
      <div className="h-12 border-b flex items-center px-4 justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {mockQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold transition-all shrink-0",
                currentIdx === idx ? "bg-slate-300 text-white border-slate-400 ring-2 ring-slate-200" : "bg-white text-slate-400 border-slate-200"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 ml-2">
          <Filter className="h-3.5 w-3.5" /> Filters
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Question Header Stats */}
        <div className="px-4 py-3 flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs">
              {currentIdx + 1}
            </div>
            <span>{q.time}</span>
            <span className="tracking-widest">{q.marks}</span>
          </div>
          <div className="flex items-center gap-4">
            <AlertCircle className="h-4 w-4" />
            <Bookmark className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
          <p className="text-[15px] md:text-lg text-slate-800 leading-relaxed font-medium">
            {q.text}
          </p>

          <Separator className="bg-slate-100" />

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all relative",
                    isCorrect ? "border-green-500 bg-green-50/30 ring-1 ring-green-500" : "border-slate-100 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 italic">{i + 1}.</span>
                    <span className="text-[14px] font-medium text-slate-700">{opt}</span>
                  </div>
                  {isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Answer Stats Banner */}
          <div className="flex items-center justify-between py-4 px-1">
            <span className="text-sm font-bold text-slate-900">Correct Answers Is: {q.correct + 1}</span>
            <span className="text-sm font-medium text-slate-500">{q.accuracy} got this right</span>
          </div>

          {/* Solution Section */}
          <div className="space-y-4">
            <div className="bg-slate-50 py-3 px-4 border-y border-slate-100">
              <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Solution</h3>
            </div>
            <div className="px-4 text-[14px] text-slate-700 leading-relaxed whitespace-pre-line">
              {q.explanation}
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-8 border-t border-slate-50">
            <span className="text-[11px] font-bold text-slate-400">Was this solution helpful?</span>
            <div className="flex items-center gap-4">
              <ThumbsUp className="h-4 w-4 text-slate-300 cursor-pointer" />
              <ThumbsDown className="h-4 w-4 text-slate-300 cursor-pointer" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t px-4 flex items-center justify-between bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Label className="text-[11px] font-bold text-slate-500 uppercase">Reattempt Mode</Label>
          <Switch 
            checked={reattemptMode} 
            onCheckedChange={setReattemptMode}
            className="data-[state=checked]:bg-primary h-5 w-9" 
          />
        </div>
        
        <Button 
          onClick={nextQuestion}
          className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg p-0 flex items-center justify-center transition-transform active:scale-95"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  );
}
