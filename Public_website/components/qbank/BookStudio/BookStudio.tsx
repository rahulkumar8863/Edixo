"use client";

import React, { useState } from 'react';
import { Book, PenTool, Search, Layout, Save, Download, ChevronRight, Settings, Sparkles, BookOpen, Loader2 } from 'lucide-react';
// subjectConfig is not directly used in this file but kept for future use
// import { getSubjectConfig } from '../../config/subjectConfig';
import { ResearchPanel } from './ResearchPanel';
import { aiOrchestrator, availableModels } from '../../services/aiOrchestrator';
import { MarkdownEditor } from './MarkdownEditor';

interface BookConfig {
    title: string;
    subject: string;
    audience: string;
    language: string;
    style: string;
}

interface Chapter {
    id: string;
    title: string;
    sections: string[];
    content: string;
    status: 'draft' | 'generating' | 'review' | 'completed';
}

export const BookStudio: React.FC = () => {
    const [activeView, setActiveView] = useState<'config' | 'outline' | 'write' | 'review'>('config');
    const [config, setConfig] = useState<BookConfig>({
        title: '',
        subject: 'Mathematics',
        audience: 'Class 9-10',
        language: 'English',
        style: 'Textbook'
    });

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

    const updateChapterContent = (id: string, newContent: string) => {
        setChapters(chapters.map(c => c.id === id ? { ...c, content: newContent } : c));
    };

    const handleGenerateChapterContent = async (chapterId: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        setIsGenerating(true);
        try {
            // Mock content generation for now as aiOrchestrator might not have this specific method ready
            setTimeout(() => {
                const mockContent = `# ${chapter.title}\n\n## Introduction\nThis is an AI-generated draft for ${chapter.title}.\n\n## Key Concepts\n- Concept 1\n- Concept 2\n\n## Summary\nConclusion of the chapter.`;
                updateChapterContent(chapterId, mockContent);
                setIsGenerating(false);
            }, 2000);
        } catch (error) {
            setIsGenerating(false);
        }
    };

    const handleGenerateOutline = async () => {
        if (!config.title) return;
        setIsGenerating(true);
        try {
            // Use Gemini 2.0 Flash by default for speed
            const model = availableModels[0];
            const structure = await aiOrchestrator.generateBookStructure(
                config.title,
                config.subject,
                config.audience,
                [config.style], // topics
                model
            );

            if (structure && structure.chapters) {
                const newChapters = structure.chapters.map((c: any, i: number) => ({
                    id: Date.now().toString() + i,
                    title: c.title,
                    sections: c.sections || [],
                    status: 'draft'
                }));
                setChapters(newChapters);
            }
        } catch (error) {
            console.error("Failed to generate outline:", error);
            alert("Failed to generate outline. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Components for each view
    const renderConfigView = () => (
        <div className="max-w-xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Compact Header */}
            <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-primary rounded-xl mx-auto flex items-center justify-center text-white shadow-md shadow-primary/20">
                    <Book size={20} />
                </div>
                <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">Book Studio</h2>
                <p className="text-sm text-muted">AI-Powered Educational Book Authoring</p>
            </div>

            {/* Config Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4">
                {/* Book Title */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Book Title</label>
                    <input
                        value={config.title}
                        onChange={e => setConfig({ ...config, title: e.target.value })}
                        placeholder="e.g. Comprehensive Guide to Physics"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-semibold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                    />
                </div>

                {/* Subject + Audience Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                        <select
                            value={config.subject}
                            onChange={e => setConfig({ ...config, subject: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-semibold text-slate-700 outline-none focus:border-primary transition-all"
                        >
                            <option>Mathematics</option>
                            <option>Science</option>
                            <option>History</option>
                            <option>Geography</option>
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Polity</option>
                            <option>Economics</option>
                            <option>Reasoning</option>
                            <option>Current Affairs</option>
                            <option>Computer Science</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Audience</label>
                        <select
                            value={config.audience}
                            onChange={e => setConfig({ ...config, audience: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-semibold text-slate-700 outline-none focus:border-primary transition-all"
                        >
                            <option>Primary (Class 1-5)</option>
                            <option>Middle (Class 6-8)</option>
                            <option>Secondary (Class 9-10)</option>
                            <option>Senior Secondary (11-12)</option>
                            <option>Competitive Exams</option>
                        </select>
                    </div>
                </div>

                {/* Language + Style Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Language</label>
                        <select
                            value={config.language}
                            onChange={e => setConfig({ ...config, language: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-semibold text-slate-700 outline-none focus:border-primary transition-all"
                        >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Bilingual</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Book Style</label>
                        <select
                            value={config.style}
                            onChange={e => setConfig({ ...config, style: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-semibold text-slate-700 outline-none focus:border-primary transition-all"
                        >
                            <option>Textbook</option>
                            <option>Study Guide</option>
                            <option>Practice Manual</option>
                            <option>Reference Book</option>
                        </select>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={() => setActiveView('outline')}
                    disabled={!config.title}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-hover transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                    Initialize Studio <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderOutlineView = () => (
        <div className="grid grid-cols-12 gap-4 h-full">
            {/* Sidebar: AI Research Panel */}
            <div className="col-span-3 h-full">
                <ResearchPanel
                    subject={config.subject}
                    onAddToOutline={(topic) => {
                        const newChapter: Chapter = {
                            id: Date.now().toString(),
                            title: topic,
                            sections: [],
                            content: '',
                            status: 'draft'
                        };
                        setChapters([...chapters, newChapter]);
                    }}
                />
            </div>

            {/* Main: Outline Editor */}
            <div className="col-span-9 bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Book Structure</h2>
                        <p className="text-xs text-muted mt-0.5">Design your table of contents</p>
                    </div>
                    <button
                        onClick={() => setActiveView('write')}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-all shadow-sm"
                    >
                        Start Writing
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {chapters.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <Layout size={36} className="mb-3 opacity-40" />
                            <p className="text-sm font-semibold">No chapters yet</p>
                            <button
                                onClick={handleGenerateOutline}
                                disabled={isGenerating}
                                className="mt-3 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-primary shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isGenerating ? 'Designing...' : 'Generate with AI'}
                            </button>
                        </div>
                    ) : (
                        chapters.map((chapter, idx) => (
                            <div key={idx} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 group hover:border-primary/30 transition-all">
                                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-800 truncate">{chapter.title}</h3>
                                    {chapter.sections.length > 0 && (
                                        <p className="text-[11px] text-muted truncate">{chapter.sections.join(' · ')}</p>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                    chapter.status === 'completed' ? 'bg-green-50 text-success' :
                                    chapter.status === 'generating' ? 'bg-orange-50 text-primary' :
                                    'bg-slate-50 text-slate-400'
                                }`}>{chapter.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full p-4 bg-background overflow-hidden flex flex-col">
            {/* Navigation Breadcrumb */}
            {activeView !== 'config' && (
                <div className="flex items-center gap-1.5 mb-4 px-1">
                    <button onClick={() => setActiveView('config')} className="flex items-center gap-1.5 text-muted hover:text-slate-700 font-semibold text-xs transition-all px-2 py-1 rounded-lg hover:bg-white">
                        <Settings size={13} /> Config
                    </button>
                    <ChevronRight size={12} className="text-slate-300" />
                    <button onClick={() => setActiveView('outline')} className={`flex items-center gap-1.5 font-semibold text-xs transition-all px-2.5 py-1 rounded-lg ${activeView === 'outline' ? 'text-primary bg-primary/5 ring-1 ring-primary/20' : 'text-muted hover:text-slate-700 hover:bg-white'}`}>
                        <Layout size={13} /> Outline
                    </button>
                    <ChevronRight size={12} className="text-slate-300" />
                    <button onClick={() => setActiveView('write')} className={`flex items-center gap-1.5 font-semibold text-xs transition-all px-2.5 py-1 rounded-lg ${activeView === 'write' ? 'text-primary bg-primary/5 ring-1 ring-primary/20' : 'text-muted hover:text-slate-700 hover:bg-white'}`}>
                        <PenTool size={13} /> Write
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {activeView === 'config' && renderConfigView()}
                {activeView === 'outline' && renderOutlineView()}
                {activeView === 'write' && (
                    <div className="h-full flex flex-col gap-3">
                        {chapters.length > 0 ? (
                            <div className="grid grid-cols-12 gap-4 h-full">
                                {/* Chapter List Sidebar */}
                                <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-3 overflow-y-auto">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Chapters</h3>
                                    <div className="space-y-1">
                                        {chapters.map((chapter, idx) => (
                                            <button
                                                key={chapter.id}
                                                onClick={() => setActiveChapterId(chapter.id)}
                                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${activeChapterId === chapter.id
                                                    ? 'bg-primary/5 text-primary border border-primary/20'
                                                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                                                    }`}
                                            >
                                                <span className="opacity-40 mr-1.5 font-bold">{idx + 1}.</span>{chapter.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Editor Area */}
                                <div className="col-span-9 h-full flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-slate-900">
                                            {chapters.find(c => c.id === activeChapterId)?.title || 'Select a chapter'}
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => activeChapterId && handleGenerateChapterContent(activeChapterId)}
                                                disabled={isGenerating}
                                                className="px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-[11px] font-bold hover:bg-primary/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Sparkles size={12} />
                                                {isGenerating ? 'Writing...' : 'Auto-Write'}
                                            </button>
                                            <button className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5">
                                                <Save size={12} /> Save
                                            </button>
                                        </div>
                                    </div>

                                    {activeChapterId && (
                                        <MarkdownEditor
                                            value={chapters.find(c => c.id === activeChapterId)?.content || ''}
                                            onChange={(val) => updateChapterContent(activeChapterId, val)}
                                            className="flex-1"
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                <BookOpen size={32} className="opacity-30" />
                                <p className="text-sm font-medium">No chapters yet. Go to Outline first.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

