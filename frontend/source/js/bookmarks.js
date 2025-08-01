import { bookmarksAPI, categoriesAPI } from './api.js';
import { checkAuthStatus } from './auth.js';

// DOM元素
const bookmarksContainer = document.getElementById('bookmarks-container');
const categoryTags = document.getElementById('category-tags');
const bookmarkModal = document.getElementById('bookmark-modal');
const bookmarkForm = document.getElementById('bookmark-form');
const bookmarkModalTitle = document.getElementById('bookmark-modal-title');
const categoryModal = document.getElementById('category-modal');
const categoryForm = document.getElementById('category-form');
const categoryModalTitle = document.getElementById('category-modal-title');
const bookmarkCategorySelect = document.getElementById('bookmark-category');
const addBookmarkBtn = document.getElementById('add-bookmark-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const searchInput = document.getElementById('search-input');
const backupBtn = document.getElementById('backup-btn');

// 数据存储
let bookmarks = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

// 渲染所有书签
export function renderBookmarks() {
    // 清空容器
    bookmarksContainer.innerHTML = '';
    
    // 筛选书签
    let filteredBookmarks = [...bookmarks];
    
    // 按分类筛选
    if (currentCategory !== 'all') {
        filteredBookmarks = filteredBookmarks.filter(bookmark => bookmark.category_id === currentCategory);
    }
    
    // 按搜索词筛选
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
            bookmark.title.toLowerCase().includes(searchLower) || 
            bookmark.url.toLowerCase().includes(searchLower) ||
            bookmark.description.toLowerCase().includes(searchLower)
        );
    }
    
    // 检查是否有书签
    if (filteredBookmarks.length === 0) {
        bookmarksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <p>没有找到书签</p>
            </div>
        `;
        return;
    }
    
    // 渲染书签
    filteredBookmarks.forEach(bookmark => {
        const category = categories.find(c => c.id === bookmark.category_id);
        const bookmarkCard = document.createElement('div');
        bookmarkCard.className = 'bookmark-card';
        bookmarkCard.innerHTML = `
            ${bookmark.is_private ? '<span class="bookmark-private"><i class="fas fa-lock"></i></span>' : ''}
            <div class="bookmark-icon">
                ${bookmark.icon ? `<img src="${bookmark.icon}" alt="${bookmark.title}的图标">` : `<i class="fas fa-globe"></i>`}
            </div>
            <a href="${bookmark.url}" target="_blank" class="bookmark-title">${bookmark.title}</a>
            <div class="bookmark-url">${new URL(bookmark.url).hostname}</div>
            ${bookmark.description ? `<div class="bookmark-description">${bookmark.description}</div>` : ''}
            <div class="bookmark-category">${category ? category.name : '未分类'}</div>
            <div class="bookmark-actions">
                <button class="bookmark-action-btn edit-btn" data-id="${bookmark.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="bookmark-action-btn delete-btn" data-id="${bookmark.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        bookmarksContainer.appendChild(bookmarkCard);
        
        // 添加编辑和删除事件
        bookmarkCard.querySelector('.edit-btn').addEventListener('click', () => editBookmark(bookmark.id));
        bookmarkCard.querySelector('.delete-btn').addEventListener('click', () => deleteBookmark(bookmark.id));
    });
}

// 渲染分类标签
function renderCategories() {
    // 保存当前选中的分类
    const activeCategory = currentCategory;
    
    // 清空分类标签容器（保留"全部"标签）
    const allTag = categoryTags.querySelector('.tag[data-category="all"]');
    categoryTags.innerHTML = '';
    categoryTags.appendChild(allTag);
    
    // 渲染分类标签
    categories.forEach(category => {
        const tag = document.createElement('button');
        tag.className = `tag ${activeCategory === category.id ? 'active' : ''}`;
        tag.dataset.category = category.id;
        tag.textContent = category.name;
        tag.addEventListener('click', () => {
            // 更新当前分类
            currentCategory = category.id;
            // 更新活跃状态
            document.querySelectorAll('.category-tags .tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            // 重新渲染书签
            renderBookmarks();
        });
        categoryTags.appendChild(tag);
    });
    
    // 更新分类选择下拉框
    bookmarkCategorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        bookmarkCategorySelect.appendChild(option);
    });
}

// 获取所有书签
export async function fetchBookmarks() {
    try {
        const isLoggedIn = await checkAuthStatus();
        if (isLoggedIn) {
            bookmarks = await bookmarksAPI.getAll();
            renderBookmarks();
        }
    } catch (error) {
        console.error('获取书签失败:', error);
        alert(`获取书签失败: ${error.message}`);
    }
}

// 获取所有分类
export async function fetchCategories() {
    try {
        const isLoggedIn = await checkAuthStatus();
        if (isLoggedIn) {
            categories = await categoriesAPI.getAll();
            renderCategories();
        }
    } catch (error) {
        console.error('获取分类失败:', error);
        alert(`获取分类失败: ${error.message}`);
    }
}

// 添加新书签
async function addBookmark() {
    // 重置表单
    bookmarkForm.reset();
    document.getElementById('bookmark-id').value = '';
    bookmarkModalTitle.textContent = '添加书签';
    bookmarkModal.classList.add('show');
}

// 编辑书签
async function editBookmark(id) {
    try {
        const bookmark = await bookmarksAPI.getById(id);
        document.getElementById('bookmark-id').value = bookmark.id;
        document.getElementById('bookmark-url').value = bookmark.url;
        document.getElementById('bookmark-title').value = bookmark.title;
        document.getElementById('bookmark-description').value = bookmark.description || '';
        document.getElementById('bookmark-icon').value = bookmark.icon || '';
        document.getElementById('bookmark-category').value = bookmark.category_id;
        document.getElementById('bookmark-private').checked = bookmark.is_private;
        
        bookmarkModalTitle.textContent = '编辑书签';
        bookmarkModal.classList.add('show');
    } catch (error) {
        console.error('获取书签详情失败:', error);
        alert(`获取书签详情失败: ${error.message}`);
    }
}

// 保存书签
async function saveBookmark(event) {
    event.preventDefault();
    
    const id = document.getElementById('bookmark-id').value;
    const bookmark = {
        url: document.getElementById('bookmark-url').value,
        title: document.getElementById('bookmark-title').value,
        description: document.getElementById('bookmark-description').value,
        icon: document.getElementById('bookmark-icon').value,
        category_id: document.getElementById('bookmark-category').value,
        is_private: document.getElementById('bookmark-private').checked
    };
    
    try {
        if (id) {
            // 更新现有书签
            await bookmarksAPI.update(id, bookmark);
            alert('书签更新成功');
        } else {
            // 创建新书签
            await bookmarksAPI.create(bookmark);
            alert('书签添加成功');
        }
        
        // 关闭模态框并刷新书签列表
        bookmarkModal.classList.remove('show');
        fetchBookmarks();
    } catch (error) {
        console.error('保存书签失败:', error);
        alert(`保存书签失败: ${error.message}`);
    }
}

// 删除书签
async function deleteBookmark(id) {
    if (!confirm('确定要删除这个书签吗？')) {
        return;
    }
    
    try {
        await bookmarksAPI.delete(id);
        alert('书签已删除');
        fetchBookmarks();
    } catch (error) {
        console.error('删除书签失败:', error);
        alert(`删除书签失败: ${error.message}`);
    }
}

// 添加新分类
function addCategory() {
    // 重置表单
    categoryForm.reset();
    document.getElementById('category-id').value = '';
    categoryModalTitle.textContent = '添加分类';
    categoryModal.classList.add('show');
}

// 保存分类
async function saveCategory(event) {
    event.preventDefault();
    
    const id = document.getElementById('category-id').value;
    const category = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value
    };
    
    try {
        if (id) {
            // 更新现有分类
            await categoriesAPI.update(id, category);
            alert('分类更新成功');
        } else {
            // 创建新分类
            await categoriesAPI.create(category);
            alert('分类添加成功');
        }
        
        // 关闭模态框并刷新分类列表
        categoryModal.classList.remove('show');
        fetchCategories();
    } catch (error) {
        console.error('保存分类失败:', error);
        alert(`保存分类失败: ${error.message}`);
    }
}

// 导出书签数据
async function exportBookmarks() {
    try {
        const data = await bookmarksAPI.export();
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('书签导出成功');
    } catch (error) {
        console.error('导出书签失败:', error);
        alert(`导出书签失败: ${error.message}`);
    }
}

// 初始化书签功能
export function initBookmarks(loginEvents) {
    // 加载数据
    fetchCategories();
    fetchBookmarks();
    
    // 登录状态变化时重新加载数据
    loginEvents.addEventListener('loginSuccess', () => {
        fetchCategories();
        fetchBookmarks();
    });
    
    loginEvents.addEventListener('logoutSuccess', () => {
        bookmarks = [];
        categories = [];
        renderBookmarks();
        renderCategories();
    });
    
    // 事件监听
    addBookmarkBtn.addEventListener('click', addBookmark);
    addCategoryBtn.addEventListener('click', addCategory);
    bookmarkForm.addEventListener('submit', saveBookmark);
    categoryForm.addEventListener('submit', saveCategory);
    backupBtn.addEventListener('click', exportBookmarks);
    
    // 搜索功能
    searchInput.addEventListener('input', (event) => {
        currentSearch = event.target.value;
        renderBookmarks();
    });
    
    // 关闭书签模态框
    bookmarkModal.querySelector('.close-btn').addEventListener('click', () => {
        bookmarkModal.classList.remove('show');
    });
    
    // 关闭分类模态框
    categoryModal.querySelector('.close-btn').addEventListener('click', () => {
        categoryModal.classList.remove('show');
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === bookmarkModal) {
            bookmarkModal.classList.remove('show');
        }
        if (event.target === categoryModal) {
            categoryModal.classList.remove('show');
        }
    });
    
    // 全部标签点击事件
    categoryTags.querySelector('.tag[data-category="all"]').addEventListener('click', () => {
        currentCategory = 'all';
        document.querySelectorAll('.category-tags .tag').forEach(tag => tag.classList.remove('active'));
        event.target.classList.add('active');
        renderBookmarks();
    });
}
