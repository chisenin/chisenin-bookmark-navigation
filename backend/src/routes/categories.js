import { Router } from 'itty-router';
import { authenticateRequest } from '../utils/auth.js';
import { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../db/d1.js';

const router = Router();

// 获取所有分类
router.get('/', async () => {
    try {
        const categories = await getAllCategories();
        return new Response(JSON.stringify(categories), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 获取单个分类
router.get('/:id', async (request) => {
    const { id } = request.params;
    
    try {
        const category = await getCategoryById(id);
        
        if (!category) {
            return new Response(JSON.stringify({ error: '分类不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify(category), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 创建分类
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
        
        if (!data.name) {
            return new Response(JSON.stringify({ error: '分类名称不能为空' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const category = await createCategory(data);
        
        return new Response(JSON.stringify(category), {
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

// 更新分类
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
        
        if (!data.name) {
            return new Response(JSON.stringify({ error: '分类名称不能为空' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const category = await updateCategory(id, data);
        
        if (!category) {
            return new Response(JSON.stringify({ error: '分类不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify(category), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 删除分类
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
        const result = await deleteCategory(id);
        
        if (!result) {
            return new Response(JSON.stringify({ error: '分类不存在' }), {
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

export const categoryRoutes = router;
    
