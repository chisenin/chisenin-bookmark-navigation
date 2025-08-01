// 解析请求体
export async function parseBody(request) {
    try {
        const contentType = request.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            return await request.json();
        }
        return {};
    } catch (error) {
        console.error('解析请求体失败:', error);
        throw new Error('无效的请求体格式');
    }
}

// 创建成功响应
export function createSuccessResponse(data, status = 200) {
    return new Response(JSON.stringify({
        success: true,
        data
    }), {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// 创建错误响应
export function createErrorResponse(message, status = 400) {
    return new Response(JSON.stringify({
        success: false,
        message
    }), {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
