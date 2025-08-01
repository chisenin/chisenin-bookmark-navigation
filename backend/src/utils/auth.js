import jwt from 'jsonwebtoken';

// 验证密码
export async function verifyPassword(env, password) {
    try {
        // 获取用户
        const userResult = await env.DB.prepare('SELECT * FROM users LIMIT 1').all();
        if (userResult.results.length === 0) {
            return false;
        }
        
        const user = userResult.results[0];
        
        // 使用Web Crypto API验证密码
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const hashBuffer = Uint8Array.from(atob(user.password_hash), c => c.charCodeAt(0));
        
        // 验证密码
        return await crypto.subtle.verify(
            'SHA-256',
            await crypto.subtle.importKey(
                'raw',
                hashBuffer,
                { name: 'SHA-256' },
                false,
                ['verify']
            ),
            hashBuffer,
            passwordBuffer
        );
    } catch (error) {
        console.error('密码验证失败:', error);
        return false;
    }
}

// 生成JWT令牌
export function generateToken(env) {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET环境变量未设置');
    }
    
    // 生成令牌，有效期7天
    return jwt.sign(
        { userId: 1 }, // 只有一个用户
        env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// 验证JWT令牌
export function verifyToken(env, token) {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET环境变量未设置');
    }
    
    try {
        // 验证令牌
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        console.error('令牌验证失败:', error);
        return null;
    }
}

// 验证请求中的令牌
export function authenticateRequest(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.split(' ')[1];
    return verifyToken(env, token);
}

// 哈希密码（此函数仅用于设置初始密码时使用）
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
