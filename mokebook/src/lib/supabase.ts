import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Mockbook] Supabase env vars missing. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Typed helpers for Mockbook tables ─────────────────────────────

export type ExamFolder = {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type ExamCategory = {
    id: string;
    folder_id: string;
    name: string;
    description?: string;
    icon?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type ExamSubCategory = {
    id: string;
    category_id: string;
    name: string;
    description?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type MockTest = {
    id: string;
    sub_category_id: string;
    title: string;
    description?: string;
    duration_minutes: number;
    total_questions: number;
    total_marks: number;
    negative_marking: number;
    is_active: boolean;
    is_free: boolean;
    scheduled_at?: string;
    created_at: string;
    updated_at: string;
};

// ── CRUD helpers ───────────────────────────────────────────────────

export const mockbookDB = {
    // Exam Folders
    getFolders: () => supabase.from('exam_folders').select('*').order('sort_order'),
    createFolder: (data: Partial<ExamFolder>) => supabase.from('exam_folders').insert(data).select().single(),
    updateFolder: (id: string, data: Partial<ExamFolder>) => supabase.from('exam_folders').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    deleteFolder: (id: string) => supabase.from('exam_folders').delete().eq('id', id),

    // Exam Categories
    getCategories: (folderId?: string) => {
        const q = supabase.from('exam_categories').select('*').order('sort_order');
        return folderId ? q.eq('folder_id', folderId) : q;
    },
    createCategory: (data: Partial<ExamCategory>) => supabase.from('exam_categories').insert(data).select().single(),
    updateCategory: (id: string, data: Partial<ExamCategory>) => supabase.from('exam_categories').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    deleteCategory: (id: string) => supabase.from('exam_categories').delete().eq('id', id),

    // Sub Categories
    getSubCategories: (categoryId?: string) => {
        const q = supabase.from('exam_sub_categories').select('*').order('sort_order');
        return categoryId ? q.eq('category_id', categoryId) : q;
    },
    createSubCategory: (data: Partial<ExamSubCategory>) => supabase.from('exam_sub_categories').insert(data).select().single(),
    updateSubCategory: (id: string, data: Partial<ExamSubCategory>) => supabase.from('exam_sub_categories').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    deleteSubCategory: (id: string) => supabase.from('exam_sub_categories').delete().eq('id', id),

    // Mock Tests
    getMockTests: (subCategoryId?: string) => {
        const q = supabase.from('mock_tests').select('*').order('created_at', { ascending: false });
        return subCategoryId ? q.eq('sub_category_id', subCategoryId) : q;
    },
    createMockTest: (data: Partial<MockTest>) => supabase.from('mock_tests').insert(data).select().single(),
    updateMockTest: (id: string, data: Partial<MockTest>) => supabase.from('mock_tests').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    deleteMockTest: (id: string) => supabase.from('mock_tests').delete().eq('id', id),
};
