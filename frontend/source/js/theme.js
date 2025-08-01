// DOM元素
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// 初始化主题
export function initTheme() {
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        enableDarkMode();
    } else {
        enableLightMode();
    }
    
    // 添加主题切换事件
    themeToggle.addEventListener('click', toggleTheme);
}

// 切换主题
function toggleTheme() {
    if (htmlElement.classList.contains('dark')) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

// 启用暗色模式
function enableDarkMode() {
    htmlElement.classList.add('dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', 'dark');
}

// 启用亮色模式
function enableLightMode() {
    htmlElement.classList.remove('dark');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', 'light');
}
