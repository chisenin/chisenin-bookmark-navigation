import { verifyPassword, generateToken } from '../utils/auth';

/**
 * 处理登录请求
 * @param {Request} request - 请求对象
 * @returns {Response} 响应对象
 */
export async function handleLogin(request) {
    try {
        const { password } = await request.json();
        
        // 验证密码
        const isValid = verifyPassword(password);
        
        if (isValid) {
            // 生成认证令牌
            const token = generateToken();
            
            // 设置cookie
            return new Response(JSON.stringify({
                success: true,
                token
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
                }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: '密码不正确'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: '登录失败',
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 处理登出请求
 * @returns {Response} 响应对象
 */
export function handleLogout() {
    // 清除cookie
    return new Response(JSON.stringify({
        success: true,
        message: '已成功登出'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
        }
    });
}

/**
 * 处理验证请求
 * @param {Request} request - 请求对象
 * @returns {Response} 响应对象
 */
export function handleVerify(request) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    
    if (tokenMatch && tokenMatch[1]) {
        return new Response(JSON.stringify({
            success: true,
            authenticated: true
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify({
        success: true,
        authenticated: false
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
