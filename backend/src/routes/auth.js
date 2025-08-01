import { Router } from 'itty-router';
import { verifyPassword, generateToken } from '../utils/auth.js';

const router = Router();

// 登录路由
router.post('/login', async (request) => {
    try {
        const { password } = await request.json();
        
        // 验证密码
        const isValid = await verifyPassword(password);
        if (!isValid) {
            return new Response(JSON.stringify({ error: '密码不正确' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 生成JWT令牌
        const token = generateToken();
        
        return new Response(JSON.stringify({ token }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 验证令牌路由
router.get('/verify', async (request) => {
    try {
        // 从请求头获取令牌
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ valid: false }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const token = authHeader.split(' ')[1];
        const isValid = await verifyToken(token);
        
        return new Response(JSON.stringify({ valid: isValid }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// 导出路由
export const authRoutes = router;
    
