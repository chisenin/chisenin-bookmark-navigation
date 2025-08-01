import { authenticateRequest } from '../utils/auth.js';
import { categoryDB } from '../db/d1.js';
import { parseBody, createSuccessResponse, createErrorResponse } from '../utils/helpers.js';

export const categoryRoutes = {
    // 获取所有分类
    getAll: async (request, env) => {
        try {
            // 验证身份
            const payload = authenticateRequest(request, env);
            if (!payload) {
                return createErrorResponse('请先登录', 401);
            }
            
            // 获取所有分类
            const categories = await categoryDB.getAll(env.DB);
            return createSuccessResponse(categories);
        } catch (error) {
            console.error('获取分类失败:', error);
            return createErrorResponse('获取分类失败: ' + error.message, 500);
        }
    },
    
    // 按ID获取分类
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
                return createErrorResponse('请提供分类ID', 400);
            }
            
            // 获取分类
            const category = await categoryDB.getById(env.DB, id);
            if (!category) {
                return createErrorResponse('分类不存在', 404);
            }
            
            return createSuccessResponse(category);
        } catch (error) {
            console.error('获取分类失败:', error);
            return createErrorResponse('获取分类失败: ' + error.message, 500);
        }
    },
    
    // 创建分类
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
            if (!body.name) {
                return createErrorResponse('分类名称为必填项', 400);
            }
            
            // 创建分类
            const category = await categoryDB.create(env.DB, body);
            return createSuccessResponse(category, 201);
        } catch (error) {
            console.error('创建分类失败:', error);
            return createErrorResponse('创建分类失败: ' + error.message, 500);
        }
    },
    
    // 更新分类
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
                return createErrorResponse('请提供分类ID', 400);
            }
            
            // 解析请求体
            const body = await parseBody(request);
            
            // 验证必要字段
            if (!body.name) {
                return createErrorResponse('分类名称为必填项', 400);
            }
            
            // 更新分类
            const category = await categoryDB.update(env.DB, id, body);
            if (!category) {
                return createErrorResponse('分类不存在', 404);
            }
            
            return createSuccessResponse(category);
        } catch (error) {
            console.error('更新分类失败:', error);
            return createErrorResponse('更新分类失败: ' + error.message, 500);
        }
    },
    
    // 删除分类
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
                return createErrorResponse('请提供分类ID', 400);
            }
            
            // 删除分类
            const success = await categoryDB.delete(env.DB, id);
            if (!success) {
                return createErrorResponse('分类不存在', 404);
            }
            
            return createSuccessResponse({ message: '分类已删除' });
        } catch (error) {
            console.error('删除分类失败:', error);
            return createErrorResponse('删除分类失败: ' + error.message, 500);
        }
    }
};
