import { Router } from 'itty-router';
import { authenticateRequest } from '../utils/auth.js';
import { 
    getAllBookmarks, 
    getBookmarkById, 
    createBookmark, 
    updateBookmark, 
    deleteBookmark,
    exportBookmarks,
    importBookmarks
} from '../db/d1.js';

const router = Router();

// 获取所有书签
router.get('/', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    const includePrivate = authenticated;
    const categoryId = request.query.category_id;
    
    try {
        const bookmarks = await getAllBookmarks(includePrivate, categoryId);
        return new Response(JSON.stringify(bookmarks), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 获取单个书签
router.get('/:id', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    const { id } = request.params;
    
    try {
        const bookmark = await getBookmarkById(id);
        
        if (!bookmark) {
            return new Response(JSON.stringify({ error: '书签不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 检查是否为私有书签且未认证
        if (bookmark.is_private && !authenticated) {
            return new Response(JSON.stringify({ error: '无权访问' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify(bookmark), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 创建书签
router.post('/', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    
    if (!authenticated) {
        return new Response(JSON.stringify({ error: '需要登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const data = await request.json();
        const bookmark = await createBookmark(data);
        
        return new Response(JSON.stringify(bookmark), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 更新书签
router.put('/:id', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    const { id } = request.params;
    
    if (!authenticated) {
        return new Response(JSON.stringify({ error: '需要登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const data = await request.json();
        const bookmark = await updateBookmark(id, data);
        
        if (!bookmark) {
            return new Response(JSON.stringify({ error: '书签不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify(bookmark), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 删除书签
router.delete('/:id', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    const { id } = request.params;
    
    if (!authenticated) {
        return new Response(JSON.stringify({ error: '需要登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const result = await deleteBookmark(id);
        
        if (!result) {
            return new Response(JSON.stringify({ error: '书签不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 导出书签
router.get('/export', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    
    if (!authenticated) {
        return new Response(JSON.stringify({ error: '需要登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const data = await exportBookmarks();
        return new Response(JSON.stringify(data), {
            headers: { 
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename="bookmarks_export.json"'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 导入书签
router.post('/import', async (request) => {
    const { authenticated } = await authenticateRequest(request);
    
    if (!authenticated) {
        return new Response(JSON.stringify({ error: '需要登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const data = await request.json();
        const result = await importBookmarks(data);
        
        return new Response(JSON.stringify({ 
            success: true, 
            imported: result 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

export const bookmarkRoutes = router;
    
