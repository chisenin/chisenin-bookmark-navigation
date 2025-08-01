// 书签相关数据库操作
export const getAllBookmarks = async (db, includePrivate = true, categoryId = null) => {
    let query = 'SELECT * FROM bookmarks';
    const params = [];
    
    // 构建查询条件
    const conditions = [];
    if (!includePrivate) {
        conditions.push('is_private = 0');
    }
    if (categoryId) {
        conditions.push('category_id = ?');
        params.push(categoryId);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.prepare(query).bind(...params).all();
    return result.results;
};

export const getBookmarkById = async (db, id) => {
    const result = await db.prepare('SELECT * FROM bookmarksmarks WHERE id = ?').bind(id).all();
    return result.results.length > 0 ? result.results[0] : null;
};

export const createBookmark = async (db, bookmark) => {
    const result = await db.prepare(`
        INSERT INTO bookmarks (url, title, description, icon, is_private, category_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
        bookmark.url,
        bookmark.title,
        bookmark.description || null,
        bookmark.icon || null,
        bookmark.is_private ? 1 : 0,
        bookmark.category_id || null
    ).run();
    
    return { id: result.meta.last_row_id, ...bookmark };
};

export const updateBookmark = async (db, id, bookmark) => {
    const existing = await getBookmarkById(db, id);
    if (!existing) {
        return null;
    }
    
    await db.prepare(`
        UPDATE bookmarks
        SET url = ?, title = ?, description = ?, icon = ?, is_private = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).bind(
        bookmark.url,
        bookmark.title,
        bookmark.description || null,
        bookmark.icon || null,
        bookmark.is_private ? 1 : 0,
        bookmark.category_id || null,
        id
    ).run();
    
    return { id, ...bookmark };
};

export const deleteBookmark = async (db, id) => {
    const existing = await getBookmarkById(db, id);
    if (!existing) {
        return false;
    }
    
    await db.prepare('DELETE FROM bookmarks WHERE id = ?').bind(id).run();
    return true;
};

export const exportBookmarks = async (db) => {
    const bookmarks = await getAllBookmarks(db);
    const categories = await getAllCategories(db);
    
    return {
        bookmarks,
        categories,
        exportDate: new Date().toISOString()
    };
};

export const importBookmarks = async (db, data) => {
    if (!data || !data.bookmarks || !Array.isArray(data.bookmarks)) {
        throw new Error('无效的导入数据');
    }
    
    // 先导入分类
    if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
            await category.id = undefined; // 确保使用新的ID
            await createCategory(db, category);
        }
    }
    
    // 导入书签
    let importedCount = 0;
    const newCategoriesories = await getAllCategories(db);
    
    for (const bookmark of data.bookmarks) {
        // 查找分类ID映射（通过名称匹配）
        let categoryId = null;
        if (bookmark.category_id && data.categories) {
            const originalCategory = data.categories.find(c => c.id == bookmark.category_id);
            if (originalCategory) {
                const newCategory = newCategories.find(c => c.name === originalCategory.name);
                if (newCategory) {
                    categoryId = newCategory.id;
                }
            }
        }
        
        // 确保不使用原始ID
        const newBookmark = {
            ...bookmark,
            id: undefined,
            category_id: categoryId
        };
        
        await createBookmark(db, newBookmark);
        importedCount++;
    }
    
    return importedCount;
};

// 分类相关数据库操作
export const getAllCategories = async (db) => {
    const result = await db.prepare('SELECT * FROM categories ORDER BY name').all();
    return result.results;
};

export const getCategoryById = async (db, id) => {
    const result = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).all();
    return result.results.length > 0 ? result.results[0] : null;
};

export const createCategory = async (db, category) => {
    const result = await db.prepare(`
        INSERT INTO categories (name, description)
        VALUES (?, ?)
    `).bind(
        category.name,
        category.description || null
    ).run();
    
    return { id: result.meta.last_row_id, ...category };
};

export const updateCategory = async (db, id, category) => {
    const existing = await getCategoryById(db, id);
    if (!existing) {
        return null;
    }
    
    await db.prepare(`
        UPDATE categories
        SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).bind(
        category.name,
        category.description || null,
        id
    ).run();
    
    return { id, ...category };
};

export const deleteCategory = async (db, id) => {
    const existing = await getCategoryById(db, id);
    if (!existing) {
        return false;
    }
    
    await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return true;
};
