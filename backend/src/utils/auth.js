import jwt from 'jsonwebtoken';

// 验证密码
export async function verifyPassword(inputPassword) {
    const adminPassword = SECRETS.ADMIN_PASSWORD;
    
    if (!adminPassword) {
        throw new Error('管理员密码未配置');
    }
    
    // 直接比较密码（根据需求修改）
    return inputPassword === adminPassword;
}

// 生成JWT令牌
export function generateToken() {
    const secret = SECRETS.JWT_SECRET || 'default-secret-key'; // 使用环境变量或默认密钥
    const expiresIn = '7d'; // 令牌7天内有效
    
    return jwt.sign({ admin: true }, secret, { expiresIn });
}

// 验证JWT令牌
export function verifyToken(token) {
    try {
        const secret = SECRETS.JWT_SECRET || 'default-secret-key';
        jwt.verify(token, secret);
        return true;
    } catch (error) {
        return false;
    }
}

// 验证请求中的令牌
export async function authenticateRequest(request) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false };
    }
    
    const token = authHeader.split(' ')[1];
    const isValid = verifyToken(token);
    
    return { authenticated: isValid };
}
    
