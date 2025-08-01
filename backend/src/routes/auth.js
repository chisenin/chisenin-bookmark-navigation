import { verifyPassword, generateToken, authenticateRequest } from '../utils/auth.js';
import { parseBody, createSuccessResponse, createErrorResponse } from '../utils/helpers.js';

export const authRoutes = {
    // 用户登录
    login: async (request, env) => {
        try {
            const body = await parseBody(request);
            
            if (!body.password) {
                return createErrorResponse('请提供密码', 400);
            }
            
            // 验证密码
            const isPasswordValid = await verifyPassword(env, body.password);
            if (!isPasswordValid) {
                return createErrorResponse('密码不正确', 401);
            }
            
            // 生成JWT令牌
            const token = generateToken(env);
            
            return createSuccessResponse({ token });
        } catch (error) {
            console.error('登录失败:', error);
            return createErrorResponse('登录失败: ' + error.message, 500);
        }
    },
    
    // 验证令牌
    verify: async (request, env) => {
        try {
            // 验证令牌
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('无效的令牌', 401);
            }
            
            return createSuccessResponse({ valid: true, payload });
        } catch (error) {
            console.error('验证令牌失败:', error);
            return createErrorResponse('验证令牌失败: ' + error.message, 500);
        }
    }
};
