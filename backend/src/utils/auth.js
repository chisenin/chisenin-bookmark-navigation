/**
 * 认证相关工具函数
 */

/**
 * 验证密码是否正确
 * @param {string} inputPassword - 用户输入的密码
 * @returns {boolean} 验证结果
 */
export function verifyPassword(inputPassword) {
    // 从环境变量获取存储的管理员密码
    const adminPassword = ENV.ADMIN_PASSWORD;
    
    // 直接比较密码（注意：生产环境中建议使用哈希比较）
    return inputPassword === adminPassword;
}

/**
 * 生成简单的认证令牌
 * @returns {string} 生成的令牌
 */
export function generateToken() {
    // 生成一个简单的令牌（实际应用中应使用更安全的方法）
    const token = btoa(Date.now() + '-' + Math.random().toString(36).substring(2));
    return token;
}

/**
 * 验证令牌是否有效
 * @param {string} token - 要验证的令牌
 * @returns {boolean} 验证结果
 */
export function verifyToken(token) {
    // 在实际应用中，这里应该有更严格的验证逻辑
    // 例如检查令牌是否过期，是否在已颁发令牌列表中等
    return !!token;
}
