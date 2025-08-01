import { Router } from 'itty-router';
import { authRoutes } from './routes/auth.js';
import { bookmarkRoutes } from './routes/bookmarks.js';
import { categoryRoutes } from './routes/categories.js';

// 创建路由
const router = Router();

// 允许跨域请求
router.all('*', (request, env, ctx) => {
    const headers = {
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    // 继续处理其他请求
    return router.handle(request, env, ctx)
        .then(response => {
            // 添加CORS头到响应
            if (response) {
                Object.entries(headers).forEach(([key, value]) => {
                    response.headers.set(key, value);
                });
            }
            return response;
        });
});

// 根路由
router.get('/', () => new Response('Bookmark API is running', { status: 200 }));

// 挂载路由
router.post('/auth/login', authRoutes.login);
router.get('/auth/verify', authRoutes.verify);

router.get('/bookmarks', bookmarkRoutes.getAll);
router.get('/bookmarks/:id', bookmarkRoutes.getById);
router.post('/bookmarks', bookmarkRoutes.create);
router.put('/bookmarks/:id', bookmarkRoutes.update);
router.delete('/bookmarks/:id', bookmarkRoutes.delete);
router.get('/bookmarks/export', bookmarkRoutes.export);

router.get('/categories', categoryRoutes.getAll);
router.get('/categories/:id', categoryRoutes.getById);
router.post('/categories', categoryRoutes.create);
router.put('/categories/:id', categoryRoutes.update);
router.delete('/categories/:id', categoryRoutes.delete);

// 404处理
router.all('*', () => new Response('Not found', { status: 404 }));

// 初始化数据库
async function initDB(env) {
    try {
        // 创建用户表
        await env.DB.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建分类表
        await env.DB.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建书签表
        await env env.DB.exec(`
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                icon TEXT,
                is_private BOOLEAN DEFAULT 0,
                category_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        
        // 创建索引
        await env.DB.exec(`
            CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category_id)
        `);
        
        // 检查是否有管理员用户
        const userResult = await env.DB.prepare('SELECT * FROM users').all();
        if (userResult.results.length === 0 && env.ADMIN_PASSWORD) {
            // 创建初始管理员用户（使用简单哈希，实际环境应使用更安全的哈希方式）
            const passwordHash = btoa(env.ADMIN_PASSWORD); // 简单编码，实际应使用bcrypt等
            await env.DB.prepare('INSERT INTO users (password_hash) VALUES (?)')
                .bind(passwordHash)
                .run();
        }
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
}

// 导出Worker
export default {
    async fetch(request, env, ctx) {
        // 初始化数据库（首次运行时）
        await initDB(env);
        
        // 处理请求
        return router.handle(request, env, ctx);
    }
};
