const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error || 'API Request Failed');
    }
    return data;
}

export const api = {
    get: (endpoint: string) => request(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: (endpoint: string, body: any) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

// ── CRUD helpers ───────────────────────────────────────────────────

export const mockbookDB = {
    // Exam Folders
    getFolders: () => api.get('/mockbook/folders'),
    createFolder: (data: any) => api.post('/mockbook/folders', data),
    updateFolder: (id: string, data: any) => api.patch(`/mockbook/folders/${id}`, data),
    deleteFolder: (id: string) => api.delete(`/mockbook/folders/${id}`),

    // Exam Categories
    getCategories: (folderId?: string) => api.get(`/mockbook/categories${folderId ? `?folderId=${folderId}` : ''}`),
    createCategory: (data: any) => api.post('/mockbook/categories', data),
    updateCategory: (id: string, data: any) => api.patch(`/mockbook/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/mockbook/categories/${id}`),

    // Sub Categories
    getSubCategories: (categoryId?: string) => api.get(`/mockbook/subcategories${categoryId ? `?categoryId=${categoryId}` : ''}`),
    createSubCategory: (data: any) => api.post('/mockbook/subcategories', data),
    updateSubCategory: (id: string, data: any) => api.patch(`/mockbook/subcategories/${id}`, data),
    deleteSubCategory: (id: string) => api.delete(`/mockbook/subcategories/${id}`),

    // Mock Tests (Uses tests module)
    getMockTests: (subCategoryId?: string) => api.get(`/tests${subCategoryId ? `?subCategoryId=${subCategoryId}` : ''}`),
    createMockTest: (data: any) => api.post('/tests', data),
    updateMockTest: (id: string, data: any) => api.patch(`/tests/${id}/status`, data), // Adjusting to match tests route
    deleteMockTest: (id: string) => api.delete(`/tests/${id}`),
};
