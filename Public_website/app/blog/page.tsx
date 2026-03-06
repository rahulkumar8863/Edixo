import { MOCK_BLOGS } from '@/lib/mock-blogs';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link'; // Assuming Link is from next/link
import { User, Calendar, ArrowRight } from 'lucide-react'; // Assuming these icons are from lucide-react

export default function BlogList() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-primary-light to-white py-20 pt-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold text-gray-900 mb-4">
                                Q-Bank Blog
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Insights, tips, and best practices for modern education
                            </p>
                        </div>
                    </div>
                </div>

                {/* Blog Posts */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Category Filter */}
                    <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                        {['All Posts', 'AI & Education', 'Teaching Tips', 'Industry Insights', 'Exam Strategy'].map((cat) => (
                            <button
                                key={cat}
                                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${cat === 'All Posts'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-600 hover:bg-primary-light hover:text-primary border border-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {MOCK_BLOGS.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Category */}
                                    <span className="inline-block px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full mb-3">
                                        {post.category}
                                    </span>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {post.author}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {post.date}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Read More */}
                                    <div className="mt-4 flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                                        Read more
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="text-center mt-12">
                        <button className="px-8 py-4 rounded-xl bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white font-semibold transition-all">
                            Load More Posts
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
