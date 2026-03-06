import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MOCK_BLOGS } from '@/lib/mock-blogs';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';

export default function BlogPost({ params }: { params: { slug: string } }) {
    const post = MOCK_BLOGS.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 pt-20">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-primary hover:gap-2 transition-all mb-8"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Blog
                        </Link>

                        {/* Category */}
                        <span className="inline-block px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full mb-6">
                            {post.category}
                        </span>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600">
                            <span className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                {post.author}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                {post.date}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                5 min read
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Featured Image */}
                    <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-[400px] object-cover"
                        />
                    </div>

                    {/* Article Body */}
                    <div className="prose prose-lg max-w-none">
                        <div
                            className="text-gray-700 leading-relaxed space-y-6"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* CTA */}
                        <div className="mt-16 p-10 bg-gradient-to-br from-primary via-primary-hover to-primary rounded-3xl text-white shadow-xl shadow-primary/20">
                            <h3 className="text-2xl font-bold mb-4">
                                Ready to transform your question banking?
                            </h3>
                            <p className="text-white/90 mb-8 max-w-xl">
                                Join thousands of educators and institutions who are scaling their educational content with Q-Bank's AI-powered studio.
                            </p>
                            <Link
                                href="/#pricing"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl bg-white text-primary hover:bg-gray-50 transition-all shadow-lg"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>

                    {/* Share & Tags */}
                    <div className="mt-16 pt-10 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[post.category, 'Education', 'Question Banks', 'AI'].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold hover:bg-primary-light hover:text-primary cursor-pointer transition-colors"
                                >
                                    #{tag.replace(/\s+/g, '')}
                                </span>
                            ))}
                        </div>
                    </div>
                </article>

                {/* Related Posts */}
                <div className="bg-slate-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10">Related Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {MOCK_BLOGS.filter(p => p.id !== post.id).slice(0, 3).map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="group bg-white p-6 rounded-2xl hover:shadow-xl transition-all border border-gray-100"
                                >
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary mb-3 text-lg line-clamp-2">
                                        {related.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {related.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
