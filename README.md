# 书签管理导航站

一个基于Hexo和Cloudflare的书签管理导航站，支持书签管理、分类、主题切换等功能，采用前后端分离架构，部署在Cloudflare Pages和Workers上。

## 功能说明

- **书签管理**：添加、编辑、删除和查看书签，支持自定义图标和描述
- **分类系统**：创建和管理多个分类，将书签有序组织
- **隐私设置**：书签可以设置为公开或私有，私有书签仅登录用户可见
- **用户认证**：简单的密码登录机制，适合个人使用
- **数据备份**：支持书签数据的导出和导入
- **响应式设计**：适配各种屏幕尺寸
- **主题切换**：支持明暗两种主题
- **安全可靠**：敏感信息通过环境变量传递，不在代码中硬编码
- **无需服务器**：利用Cloudflare全球网络，无需维护自己的服务器

## 目录结构
bookmark-nav/
├── frontend/              # Hexo前端
│   ├── _config.yml        # Hexo配置
│   ├── package.json       # 依赖配置
│   ├── source/            # 源文件
│   │   ├── css/
│   │   │   └── style.css  # 样式文件
│   │   ├── js/
│   │   │   ├── api.js     # API交互
│   │   │   ├── auth.js    # 认证相关
│   │   │   ├── bookmarks.js # 书签管理
│   │   │   ├── theme.js   # 主题切换
│   │   │   └── main.js    # 主逻辑
│   │   └── index.html     # 主页
│   └── themes/
│       └── custom/
│           └── layout/
│               └── index.ejs # 主布局
├── backend/               # Cloudflare Worker后端
│   ├── wrangler.toml      # Worker配置
│   ├── package.json       # 依赖配置
│   └── src/
│       ├── index.js       # Worker入口
│       ├── routes/
│       │   ├── auth.js    # 认证路由
│       │   ├── bookmarks.js # 书签路由
│       │   └── categories.js # 分类路由
│       ├── db/
│       │   └── d1.js      # D1数据库操作
│       └── utils/
│           ├── auth.js    # 认证工具
│           └── helpers.js # 辅助函数
├── .gitignore             # Git忽略文件
└── README.md              # 说明文档
## 部署指南

### 准备工作

1. 创建一个GitHub仓库用于存储代码
2. 注册Cloudflare账号
3. 在Cloudflare控制台中创建一个D1数据库

### 后端部署（Cloudflare Workers）

1. 将代码推送到GitHub仓库

2. 在Cloudflare控制台中：
   - 导航到Workers & Pages
   - 点击"创建应用"，选择"Worker"
   - 选择"连接到Git"，关联你的GitHub仓库
   - 选择backend目录作为Worker根目录

3. 配置环境变量：
   - 在Worker设置中，导航到"环境变量"
   - 添加变量`ADMIN_PASSWORD`，值为你的管理员密码
   - （可选）添加`JWT_SECRET`，值为一个随机字符串

4. 关联D1数据库：
   - 在Worker设置中，导航到"资源"
   - 点击"添加绑定"，选择"D1数据库"
   - 变量名称填写`DB`，选择你创建的D1数据库

5. 部署Worker，记录分配的域名（如`your-worker.username.workers.dev`）

### 前端部署（Cloudflare Pages）

1. 在Cloudflare控制台中：
   - 导航到Workers & Pages
   - 点击"创建应用"，选择"Pages"
   - 选择"连接到Git"，关联你的GitHub仓库
   - 选择frontend目录作为Pages根目录

2. 配置构建设置：
   - 框架预设：选择"Hexo"
   - 构建命令：`npm install && npm run build`
   - 输出目录：`public`

3. 配置环境变量：
   - 添加变量`API_URL`，值为你的Worker域名（如`https://your-worker.username.workers.dev`）

4. 部署Pages应用

### 初始化数据库

1. 在Cloudflare控制台中，导航到你的D1数据库
2. 打开"控制台"标签页
3. 执行以下SQL语句创建必要的表：
-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建书签表
CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category_id INTEGER,
    is_private BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category_id);
## 使用说明

1. 访问你的Cloudflare Pages域名，打开导航站
2. 点击右上角的"登录"按钮，使用你设置的管理员密码登录
3. 登录后可以：
   - 添加新的分类
   - 添加、编辑、删除书签
   - 切换明暗主题
   - 导出/导入书签数据

## 安全注意事项

- 管理员密码直接存储在环境变量中，建议使用强密码
- 所有API通信通过Cloudflare的HTTPS进行加密
- 定期备份你的书签数据
- 不要与他人共享你的管理员密码
