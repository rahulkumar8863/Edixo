"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { CreatorDashboard } from '../../../components/qbank/CreatorDashboard';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';

export default function ToolsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
            }
        }
    }, [loading, user, router]);

    if (loading || (!user && typeof window !== 'undefined')) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="text-sm font-medium text-slate-600">
                    Checking your session...
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#E5E7EB] mx-4 my-4" style={{ height: 'calc(100vh - 2rem)' }}>
                    <CreatorDashboard
                        onLaunchPresentation={(id) => router.push(`/tools/ppt-studio?setId=${id}`)}
                        onLaunchPDF={(id) => router.push(`/tools/pdf-studio?setId=${id}`)}
                        onLaunchRefine={(id) => router.push(`/tools/refine?setId=${id}`)}
                    />
                </div>
            </div>
        </div>
    );
}
