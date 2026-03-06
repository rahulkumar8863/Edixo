import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 mb-6">Last Updated: February 12, 2026</p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">1. Information We Collect</h2>
                        <p className="text-slate-600 mb-6 font-sans">
                            We collect information you provide directly to us when you create an account, use our tools, or communicate with us.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">2. How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-3 text-slate-600 mb-6">
                            <li>To provide and maintain our services</li>
                            <li>To process your transactions and send related information</li>
                            <li>To send you technical notices, updates, and support messages</li>
                            <li>To monitor and analyze trends, usage, and activities</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">3. Data Security</h2>
                        <p className="text-slate-600 mb-6">
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">4. Your Rights</h2>
                        <p className="text-slate-600 mb-6">
                            You may choose to restrict the collection or use of your personal information. If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
