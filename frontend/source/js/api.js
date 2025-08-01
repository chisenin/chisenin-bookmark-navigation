// API基础URL，从环境变量获取或使用默认值
const API_BASE_URL = typeof BOOKMARK_API_URL !== 'undefined' ? BOOKMARK_API_URL : 'https://your-worker-subdomain.workers.dev';

// 通用API请求函数
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // 如果需要认证，添加令牌
    if (requiresAuth) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('未登录，请先登录');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
    };
    
    // 如果有数据，添加到请求体
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        // 解析响应
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = { message: await response.text() };
        }
        
        // 处理错误状态
        if (!response.ok) {
            throw new Error(responseData.message || `请求失败: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 认证相关API
export const authAPI = {
    login: (password) => apiRequest('/auth/login', 'POST', { password }, false),
    verify: () => apiRequest('/auth/verify'),
    logout: () => {
        localStorage.removeItem('authToken');
        return Promise.resolve();
    }
};

// 书签相关API
export const bookmarksAPI = {
    getAll: () => apiRequest('/bookmarks'),
    getById: (id) => apiRequest(`/bookmarks/${id}`),
    create: (bookmark) => apiRequest('/bookmarks', 'POST', bookmark),
    update: (id, bookmark) => apiRequest(`/bookmarks/${id}`, 'PUT', bookmark),
    delete: (id) => apiRequest(`/bookmarks/${id}`, 'DELETE'),
    export: () => apiRequest('/bookmarks/export')
};

// 分类相关API
export const categoriesAPI = {
    getAll: () => apiRequest('/categories'),
    getById: (id) => apiRequest(`/categories/${id}`),
    create: (category) => apiRequest('/categories', 'POST', category),
    update: (id, category) => apiRequest(`/categories/${id}`, 'PUT', category),
    delete: (id) => apiRequest(`/categories/${id}`, 'DELETE')
};
