import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 mb-6">Last Updated: February 12, 2026</p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 mb-6">
                            By accessing and using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">2. Use License</h2>
                        <p className="text-slate-600 mb-6">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Q-Bank's website for personal, non-commercial transitory viewing only.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">3. Disclaimer</h2>
                        <p className="text-slate-600 mb-6">
                            The materials on Q-Bank's website are provided on an 'as is' basis. Q-Bank makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">4. Limitations</h2>
                        <p className="text-slate-600 mb-6">
                            In no event shall Q-Bank or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Q-Bank's website.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
