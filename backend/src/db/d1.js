// 书签相关数据库操作
export const bookmarkDB = {
    // 获取所有书签
    getAll: async (db) => {
        const result = await db.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC').all();
        return result.results;
    },
    
    // 按ID获取书签
    getById: async (db, id) => {
        const result = await db.prepare('SELECT * FROM bookmarks WHERE id = ?').bind(id).all();
        return result.results.length > 0 ? result.results[0] : null;
    },
    
    // 创建书签
    create: async (db, bookmark) => {
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
    },
    
    // 更新书签
    update: async (db, id, bookmark) => {
        const existing = await bookmarkDB.getById(db, id);
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
    },
    
    // 删除书签
    delete: async (db, id) => {
        const existing = await bookmarkDB.getById(db, id);
        if (!existing) {
            return false;
        }
        
        await db.prepare('DELETE FROM bookmarks WHERE id = ?').bind(id).run();
        return true;
    },
    
    // 导出所有书签数据
    export: async (db) => {
        const bookmarks = await bookmarkDB.getAll(db);
        const categories = await categoryDB.getAll(db);
        
        return {
            bookmarks,
            categories,
            exportDate: new Date().toISOString()
        };
    }
};

// 分类相关数据库操作
export const categoryDB = {
    // 获取所有分类
    getAll: async (db) => {
        const result = await db.prepare('SELECT * FROM categories ORDER BY name').all();
        return result.results;
    },
    
    // 按ID获取分类
    getById: async (db, id) => {
        const result = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).all();
        return result.results.length > 0 ? result.results[0] : null;
    },
    
    // 创建分类
    create: async (db, category) => {
        const result = await db.prepare(`
            INSERT INTO categories (name, description)
            VALUES (?, ?)
        `).bind(
            category.name,
            category.description || null
        ).run();
        
        return { id: result.meta.last_row_id, ...category };
    },
    
    // 更新分类
    update: async (db, id, category) => {
        const existing = await categoryDB.getById(db, id);
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
    },
    
    // 删除分类
    delete: async (db, id) => {
        const existing = await categoryDB.getById(db, id);
        if (!existing) {
            return false;
        }
        
        await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
        return true;
    }
};
