"use client";

import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, BookOpen, AlertCircle, ChevronDown } from 'lucide-react';

interface AnswerResult {
    answer: string;
    explanation: string;
    keyPoints: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    subject: string;
    confidence: number;
}

export const AnswerGenerator: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [detailLevel, setDetailLevel] = useState<'Brief' | 'Detailed' | 'Step-by-Step'>('Detailed');
    const [language, setLanguage] = useState('Bilingual');
    const [generatedAnswer, setGeneratedAnswer] = useState<AnswerResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [aiModel, setAiModel] = useState('gemini-pro');

    const aiModels = [
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
        { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
        { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' }
    ];

    const handleGenerate = async () => {
        if (!question.trim()) return;
        setLoading(true);
        try {
            // Simulate AI response - in real implementation, this would call your AI service
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockResult: AnswerResult = {
                answer: "This is a comprehensive answer to your question that explains the concept clearly and provides relevant examples.",
                explanation: "The detailed explanation breaks down the concept into digestible parts, showing the underlying principles and their applications.",
                keyPoints: [
                    "Key concept 1 with detailed explanation",
                    "Key concept 2 with practical example",
                    "Key concept 3 with real-world application"
                ],
                difficulty: 'Medium',
                subject: 'General Knowledge',
                confidence: 95
            };
            
            setGeneratedAnswer(mockResult);
        } catch (error: any) {
            alert(`Failed to generate answer: ${error.message || 'Please try again'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedAnswer) return;
        const text = `Q: ${question}\n\nA: ${generatedAnswer.answer}\n\nExplanation:\n${generatedAnswer.explanation}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
            <div className="text-center space-y-6 mb-12">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 text-primary rounded-3xl mb-4 ring-2 ring-primary/20 shadow-lg">
                    <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl">
                        <BookOpen size={28} className="text-white" />
                    </div>
                </div>
                <h2 className="text-4xl font-black text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">AI Answer Studio</h2>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
                    Generate comprehensive explanations, step-by-step solutions, and key insights for any academic query.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-border p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            Question Input
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Your Question
                                </label>
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Enter your question here..."
                                    className="w-full h-36 p-4 border-2 border-border rounded-xl bg-background text-foreground focus:ring-4 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none placeholder:text-muted-foreground/70"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Detail Level
                                    </label>
                                    <select
                                        value={detailLevel}
                                        onChange={(e) => setDetailLevel(e.target.value as any)}
                                        className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="Brief">Brief</option>
                                        <option value="Detailed">Detailed</option>
                                        <option value="Step-by-Step">Step-by-Step</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Language
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Bilingual">Bilingual</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    AI Model
                                </label>
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    {aiModels.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name} ({model.provider})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !question.trim()}
                                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-4 rounded-xl font-bold hover:from-primary/90 hover:to-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        <span className="text-lg">Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span className="text-lg">Generate Answer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-6">
                    {generatedAnswer && (
                        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-foreground">Generated Answer</h3>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Answer:</h4>
                                    <p className="text-foreground bg-muted p-3 rounded-lg">
                                        {generatedAnswer.answer}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Explanation:</h4>
                                    <p className="text-foreground bg-muted p-3 rounded-lg">
                                        {generatedAnswer.explanation}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Key Points:</h4>
                                    <ul className="space-y-1">
                                        {generatedAnswer.keyPoints.map((point, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span className="text-foreground">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Difficulty</p>
                                        <p className="font-semibold text-foreground">{generatedAnswer.difficulty}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Subject</p>
                                        <p className="font-semibold text-foreground">{generatedAnswer.subject}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Confidence</p>
                                        <p className="font-semibold text-foreground">{generatedAnswer.confidence}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!generatedAnswer && (
                        <div className="bg-white rounded-2xl border border-border p-8 text-center">
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Answer Generated Yet</h3>
                            <p className="text-muted-foreground">
                                Enter a question and click "Generate Answer" to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};