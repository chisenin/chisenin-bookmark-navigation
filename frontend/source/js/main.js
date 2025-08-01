import { initAuth } from './auth.js';
import { initBookmarks } from './bookmarks.js';
import { initTheme } from './theme.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题
    initTheme();
    
    // 初始化认证
    const loginEvents = initAuth();
    
    // 初始化书签功能
    initBookmarks(loginEvents);
});
