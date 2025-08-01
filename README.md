# 书签管理导航站

一个基于Hexo和Cloudflare的个人书签管理导航站，支持书签分类、公开/私有设置、主题切换等功能，无需服务器，完全部署在Cloudflare平台上。

## 功能说明

- **书签管理**：添加、编辑、删除和查看书签，支持自定义图标和描述
- **分类系统**：创建和管理多个分类，将书签有序组织
- **隐私设置**：书签可以设置为公开或私有，私有书签仅登录用户可见
- **用户认证**：简单的密码登录机制，无需注册流程
- **数据备份**：支持书签数据的导出，确保数据不会丢失
- **响应式设计**：适配各种屏幕尺寸，在桌面和移动设备上都有良好体验
- **主题切换**：支持明暗两种主题，适应不同使用环境和个人偏好
- **安全可靠**：所有敏感信息通过环境变量传递，不在代码中硬编码
- **无需服务器**：利用Cloudflare的全球网络，无需维护自己的服务器
- **易于扩展**：随着需求增长，可以方便地扩展功能
- **成本效益**：Cloudflare提供慷慨的免费额度，适合个人使用

## 部署指南

该项目采用前后端分离架构，需要分别部署到Cloudflare Pages（前端）和Cloudflare Workers（后端）。

### 准备工作

1. 创建一个GitHub仓库，将本项目的所有文件上传到仓库中
2. 注册/登录Cloudflare账号

### 后端部署（Cloudflare Workers + D1）

1. **创建D1数据库**：
   - 登录Cloudflare控制台
   - 导航到"D1"服务
   - 点击"创建数据库"，名称填写`bookmarks`
   - 记录数据库ID，后续会用到

2. **创建Worker**：
   - 导航到"Workers & Pages"
   - 点击"创建应用" -> "创建Worker"
   - 输入Worker名称（如`bookmark-api`），点击"部署"
   - 部署完成后，点击"编辑代码"，然后替换为项目中`backend`目录下的代码

3. **配置Worker**：
   - 在Worker编辑页面，点击"设置" -> "变量"
   - 在"环境变量"部分，添加以下变量：
     - `ADMIN_PASSWORD_HASH`：管理员密码的SHA-256哈希值
     - `JWT_SECRET`：随机生成的字符串，用于JWT令牌加密
     - `CORS_ORIGIN`：前端部署的域名（如`https://your-frontend.pages.dev`）
   - 在"D1数据库绑定"部分，点击"添加绑定"：
     - 变量名称填写`DB`
     - 选择之前创建的`bookmarks`数据库
   - 点击"保存并部署"

4. **生成密码哈希**：
   - 密码哈希需要使用SHA-256算法
   - 可以使用在线工具生成，或运行`backend/src/utils/auth.js`中的`hashPassword`函数
   - 将生成的哈希值填入`ADMIN_PASSWORD_HASH`环境变量

5. **获取API URL**：
   - 部署完成后，Worker会有一个默认域名（如`bookmark-api.yourname.workers.dev`）
   - 记录这个URL，前端部署时需要用到

### 前端部署（Cloudflare Pages）

1. **创建Pages项目**：
   - 导航到"Workers & Pages"
   - 点击"创建应用" -> "Pages" -> "连接到Git"
   - 选择你的GitHub仓库
   - 项目名称可以自定义（如`bookmark-nav`）

2. **配置构建设置**：
   - 框架预设：选择"Hexo"
   - 构建命令：`cd frontend && npm install && npm run build`
   - 构建输出目录：`frontend/public`
   - 环境变量：添加`BOOKMARK_API_URL`，值为后端Worker的URL

3. **部署网站**：
   - 点击"部署"，等待部署完成
   - 部署完成后，你将获得一个Pages域名（如`bookmark-nav.pages.dev`）

4. **访问网站**：
   - 打开Pages域名，使用你设置的管理员密码登录
   - 开始使用书签管理功能

### 环境变量说明

| 变量名称 | 用途 | 部署位置 |
|---------|------|---------|
| `ADMIN_PASSWORD_HASH` | 管理员密码的SHA-256哈希 | Worker |
| `JWT_SECRET` | JWT令牌加密密钥 | Worker |
| `CORS_ORIGIN` | 允许跨域请求的前端域名 | Worker |
| `BOOKMARK_API_URL` | 后端API的URL | Pages |

## 使用指南

1. **登录**：使用部署时设置的管理员密码登录
2. **添加分类**：点击"添加分类"按钮创建书签分类
3. **添加书签**：点击"添加书签"按钮，填写URL、标题等信息
4. **管理书签**：可以编辑或删除已添加的书签
5. **切换主题**：点击顶部的月亮/太阳图标切换明暗主题
6. **导出数据**：点击下载图标导出书签数据备份

## 技术栈

- **前端**：Hexo、JavaScript、CSS
- **后端**：Cloudflare Workers、D1数据库
- **部署**：Cloudflare Pages、Workers
- **其他**：JWT认证、RESTful API

## 许可证

本项目采用MIT许可证开源。
