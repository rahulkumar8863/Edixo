import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Users, Award, Shield, Target } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <h1 className="text-5xl font-bold text-slate-900 mb-6">Empowering Education Through Technology</h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Q-Bank is on a mission to simplify teaching by providing an integrated ecosystem of advanced tools for educators and institutions.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
                        {[
                            { label: 'Verified Teachers', value: '10,000+' },
                            { label: 'Questions Generated', value: '50M+' },
                            { label: 'Partner Institutions', value: '1,200+' },
                            { label: 'PDFs/PPTs Created', value: '1M+' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-8 bg-slate-50 rounded-3xl">
                                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                                <div className="text-slate-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Our Values */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[
                                { icon: Users, title: 'Inclusivity', desc: 'Making education accessible to everyone, regardless of location.' },
                                { icon: Award, title: 'Quality', desc: 'Uncompromising standards for educational content and tools.' },
                                { icon: Shield, title: 'Trust', desc: 'A secure and reliable platform for institutions and users.' },
                                { icon: Target, title: 'Innovation', desc: 'Leveraging AI and modern technology to solve educational challenges.' },
                            ].map((value, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                                        <value.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                    <p className="text-slate-600">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Our Story */}
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px]" />
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-8">Our Journey</h2>
                                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                                    Founded in 2024, Q-Bank started as a small project to help local teachers manage their question papers more efficiently.
                                </p>
                                <p className="text-slate-300 text-lg leading-relaxed">
                                    Today, we are a comprehensive educational ecosystem that powers hundreds of coaching centers and helps thousands of teachers streamline their classroom content.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80" className="rounded-2xl" alt="Team" />
                                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80" className="rounded-2xl mt-8" alt="Office" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
