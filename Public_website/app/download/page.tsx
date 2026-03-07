"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Monitor, Smartphone, Laptop, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-slate-900 mb-6">Download Teaching Tools</h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Get the powerful Whiteboard app for your desktop or tablet and start teaching like a pro.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {/* Whiteboard Desktop */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8">
                                <Monitor className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Whiteboard for Windows</h2>
                            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                                Optimized for high-performance live teaching with low latency and infinite canvas.
                            </p>
                            <div className="space-y-3 mb-10 w-full text-left">
                                <div className="flex items-center text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                    Infinite Canvas & Recording
                                </div>
                                <div className="flex items-center text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                    Q-Bank Asset Integration
                                </div>
                                <div className="flex items-center text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                    Offline Mode Support
                                </div>
                            </div>
                            <button
                                onClick={() => alert('Download starting... (v1.0.0)')}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                Download .exe
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Whiteboard Tablet */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-8">
                                <Smartphone className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Whiteboard for Android</h2>
                            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                                Perfect for teaching using tablets or smart boards with stylus support.
                            </p>
                            <div className="space-y-3 mb-10 w-full text-left">
                                <div className="flex items-center text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                    Smooth Stylus Input
                                </div>
                                <div className="flex items-center text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                    Palm Rejection Ready
                                </div>
                                <div className="flex items-center text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                                    Cloud Sync enabled
                                </div>
                            </div>
                            <button
                                onClick={() => alert('Download starting for Android...')}
                                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                Download .apk
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
