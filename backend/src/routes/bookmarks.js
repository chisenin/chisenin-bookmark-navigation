import { authenticateRequest } from '../utils/auth.js';
import { bookmarkDB } from '../db/d1.js';
import { parseBody, createSuccessResponse, createErrorResponse } from '../utils/helpers.js';

export const bookmarkRoutes = {
    // 获取所有书签
    getAll: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 获取所有书签
            const bookmarks = await bookmarkDB.getAll(env.DB);
            return createSuccessResponse(bookmarks);
        } catch (error) {
            console.error('获取书签失败:', error);
            return createErrorResponse('获取书签失败: ' + error.message, 500);
        }
    },
    
    // 按ID获取书签
    getById: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 获取ID
            const id = request.params.id;
            if (!id) {
                return createErrorResponse('请提供书签ID', 400);
            }
            
            // 获取书签
            const bookmark = await bookmarkDB.getById(env.DB, id);
            if (!bookmark) {
                return createErrorResponse('书签不存在', 404);
            }
            
            return createSuccessResponse(bookmark);
        } catch (error) {
            console.error('获取书签失败:', error);
            return createErrorResponse('获取书签失败: ' + error.message, 500);
        }
    },
    
    // 创建书签
    create: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 解析请求体
            const body = await parseBody(request);
            
            // 验证必要字段
            if (!body.url || !body.title) {
                return createErrorResponse('URL和标题为必填项', 400);
            }
            
            // 创建书签
            const bookmark = await bookmarkDB.create(env.DB, body);
            return createSuccessResponse(bookmark, 201);
        } catch (error) {
            console.error('创建书签失败:', error);
            return createErrorResponse('创建书签失败: ' + error.message, 500);
        }
    },
    
    // 更新书签
    update: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 获取ID
            const id = request.params.id;
            if (!id) {
                return createErrorResponse('请提供书签ID', 400);
            }
            
            // 解析请求体
            const body = await parseBody(request);
            
            // 验证必要字段
            if (!body.url || !body.title) {
                return createErrorResponse('URL和标题为必填项', 400);
            }
            
            // 更新书签
            const bookmark = await bookmarkDB.update(env.DB, id, body);
            if (!bookmark) {
                return createErrorResponse('书签不存在', 404);
            }
            
            return createSuccessResponse(bookmark);
        } catch (error) {
            console.error('更新书签失败:', error);
            return createErrorResponse('更新书签失败: ' + error.message, 500);
        }
    },
    
    // 删除书签
    delete: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 获取ID
            const id = request.params.id;
            if (!id) {
                return createErrorResponse('请提供书签ID', 400);
            }
            
            // 删除书签
            const success = await bookmarkDB.delete(env.DB, id);
            if (!success) {
                return createErrorResponse('书签不存在', 404);
            }
            
            return createSuccessResponse({ message: '书签已删除' });
        } catch (error) {
            console.error('删除书签失败:', error);
            return createErrorResponse('删除书签失败: ' + error.message, 500);
        }
    },
    
    // 导出书签
    export: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 导出数据
            const data = await bookmarkDB.export(env.DB);
            return createSuccessResponse(data);
        } catch (error) {
            console.error('导出书签失败:', error);
            return createErrorResponse('导出书签失败: ' + error.message, 500);
        }
    }
};
