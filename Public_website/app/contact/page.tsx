import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-slate-900 mb-4">Get in Touch</h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Have questions or need support? Our team is here to help you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
                                <p className="text-slate-600 text-lg mb-10">
                                    Fill out the form or reach us via our contact channels. We usually respond within 24 hours.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">Email Us</h3>
                                        <p className="text-slate-600">support@qbank.com</p>
                                        <p className="text-slate-600">info@qbank.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">Call Us</h3>
                                        <p className="text-slate-600">+91 98765 43210</p>
                                        <p className="text-slate-600">Mon-Sat, 9am - 6pm</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">Visit Us</h3>
                                        <p className="text-slate-600">123 Education Lane, Tech Hub</p>
                                        <p className="text-slate-600">New Delhi, India - 110001</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-10 md:p-12 border border-slate-100">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="w-full px-5 py-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="w-full px-5 py-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all bg-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                                    <input type="text" placeholder="How can we help?" className="w-full px-5 py-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                    <textarea rows={5} placeholder="Your message here..." className="w-full px-5 py-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all bg-white resize-none" />
                                </div>
                                <button className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
