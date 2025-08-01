import { authAPI } from './api.js';

// DOM元素
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const authContainer = document.getElementById('auth-container');

// 登录状态变化事件
const loginEvents = new EventTarget();
export const LOGIN_SUCCESS = 'loginSuccess';
export const LOGOUT_SUCCESS = 'logoutSuccess';

// 检查登录状态
export async function checkAuthStatus() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return false;
        }
        
        const response = await authAPI.verify();
        if (response.valid) {
            updateAuthUI(true);
            return true;
        } else {
            localStorage.removeItem('authToken');
            updateAuthUI(false);
            return false;
        }
    } catch (error) {
        console.error('验证登录状态失败:', error);
        localStorage.removeItem('authToken');
        updateAuthUI(false);
        return false;
    }
}

// 更新认证UI
function updateAuthUI(isLoggedIn) {
    if (isLoggedIn) {
        // 已登录状态
        authContainer.innerHTML = `
            <button id="logout-btn" class="control-btn">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        loginEvents.dispatchEvent(new Event(LOGIN_SUCCESS));
    } else {
        // 未登录状态
        authContainer.innerHTML = `
            <button id="login-btn" class="control-btn">
                <i class="fas fa-sign-in-alt"></i>
            </button>
        `;
        document.getElementById('login-btn').addEventListener('click', () => {
            loginModal.classList.add('show');
        });
        loginEvents.dispatchEvent(new Event(LOGOUT_SUCCESS));
    }
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    
    try {
        const response = await authAPI.login(password);
        localStorage.setItem('authToken', response.token);
        loginModal.classList.remove('show');
        loginForm.reset();
        updateAuthUI(true);
        alert('登录成功');
    } catch (error) {
        alert(`登录失败: ${error.message}`);
    }
}

// 处理登出
async function handleLogout() {
    try {
        await authAPI.logout();
        updateAuthUI(false);
        alert('已登出');
    } catch (error) {
        console.error('登出失败:', error);
        alert('登出失败，请重试');
    }
}

// 初始化认证功能
export function initAuth() {
    // 检查初始登录状态
    checkAuthStatus();
    
    // 登录表单提交事件
    loginForm.addEventListener('submit', handleLogin);
    
    // 关闭登录模态框
    loginModal.querySelector('.close-btn').addEventListener('click', () => {
        loginModal.classList.remove('show');
        loginForm.reset();
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.classList.remove('show');
            loginForm.reset();
        }
    });
    
    return loginEvents;
}
