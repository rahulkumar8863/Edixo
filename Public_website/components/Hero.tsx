import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
            Professional <span className="text-primary">Teaching Tools</span> &amp; Question Bank
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Teachers ke liye powerful Q-Bank, PDF Studio, PPT Generator aur 
            Smart Board tools – sab kuch ek hi platform par.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/tools/creator" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              Start Creating Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Advanced Question Bank
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Smart Board &amp; Whiteboard
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Automated PDF/PPT Generation
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40 z-0">
         <div className="absolute top-20 left-20 w-96 h-96 bg-primary-light rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
         <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}

