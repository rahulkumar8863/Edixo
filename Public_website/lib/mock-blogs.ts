export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    date: string;
    image: string;
    slug: string;
}

export const MOCK_BLOGS: BlogPost[] = [
    {
        id: '1',
        title: 'How to Crack UPSC in Your First Attempt',
        excerpt: 'Comprehensive guide and strategy from toppers to ace the civil services examination.',
        content: '<p>The Civil Services Examination (CSE) conducted by the Union Public Service Commission (UPSC) is one of the toughest exams in India. However, with the right strategy and dedication, it is possible to crack it in the first attempt.</p><h3>1. Understand the Syllabus</h3><p>Before you dive into your books, thoroughly understand the UPSC syllabus. It covers everything from history to current affairs.</p><h3>2. Consistency is Key</h3><p>Develop a habit of studying daily. Consistency is more important than studying for 15 hours one day and doing nothing the next.</p>',
        author: 'Admin',
        category: 'Exam Strategy',
        date: 'February 10, 2026',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        slug: 'crack-upsc-first-attempt'
    },
    {
        id: '2',
        title: 'Top 10 Mathematical Shortcuts for SSC CGL',
        excerpt: 'Save precious time during your competitive exams with these rapid calculation techniques.',
        content: '<p>Time management is the most critical factor in clearing SSC CGL. These 10 mathematical shortcuts will help you solve problems in seconds instead of minutes.</p>',
        author: 'Edixo Team',
        category: 'Mathematics',
        date: 'February 8, 2026',
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
        slug: 'top-10-math-shortcuts'
    },
    {
        id: '3',
        title: 'The Future of Digital Education in India',
        excerpt: 'How AI and hybrid learning models are transforming the educational landscape.',
        content: '<p>Digital education is no longer a luxury; it has become a necessity. With the rise of AI-driven platforms like Q-Bank, students now have access to high-quality content at their fingertips.</p>',
        author: 'Founder',
        category: 'Education Technology',
        date: 'February 5, 2026',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        slug: 'future-digital-education-india'
    }
];
