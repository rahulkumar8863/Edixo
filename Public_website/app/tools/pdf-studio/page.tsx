'use client';
import { useRouter } from 'next/navigation';
import { CreatorDashboard } from '../../../components/qbank/CreatorDashboard';

export default function PDFStudioPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#E5E7EB] mx-4 my-4" style={{ height: 'calc(100vh - 2rem)' }}>
                    <CreatorDashboard
                        initialTab="export"
                        onLaunchPresentation={(id) => router.push(`/tools/ppt-studio?setId=${id}`)}
                        onLaunchPDF={(id) => router.push(`/tools/pdf-studio?setId=${id}`)}
                        onLaunchRefine={(id) => router.push(`/tools/refine?setId=${id}`)}
                    />
                </div>
            </div>
        </div>
    );
}
