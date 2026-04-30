# TongAI - 个人作品官网

全栈 AI 开发工程师个人官网，前后端分离架构。

## 项目结构

```
tongai/
├── docs/                    # 需求文档
├── frontend/                # React 前端
│   ├── src/
│   │   ├── api/             # Axios API 封装（projects / posts / ai / auth / comments）
│   │   ├── components/
│   │   │   ├── common/      # Layout、Header、Footer、AdminLayout、ProtectedRoute、AiChatWidget
│   │   │   └── ui/          # Button、Badge、Card、LoadingSpinner、ErrorMessage
│   │   ├── hooks/           # useAsync
│   │   ├── pages/
│   │   │   ├── Home/        # 首页
│   │   │   ├── Projects/    # 作品集列表 & 详情
│   │   │   ├── Posts/       # 博文列表 & 详情（含评论）
│   │   │   ├── AI/          # AI 体验专区（RAG + Agent Demo）
│   │   │   ├── About/       # 关于我
│   │   │   └── Admin/       # 管理后台（登录、仪表盘、作品/博文/知识库/评论管理）
│   │   ├── router/          # React Router v6 路由配置
│   │   ├── store/           # Zustand（authStore、uiStore）
│   │   ├── types/           # TypeScript 类型定义
│   │   └── utils/           # cn / formatDate / estimateReadingTime 等
│   └── ...
└── backend/                 # FastAPI 后端（待创建）
```

## 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 6 | 类型安全 |
| Vite | 8 | 构建工具 |
| TailwindCSS | 4 | 样式 |
| React Router | 7 | 客户端路由 |
| Zustand | 5 | 状态管理（主题、登录态） |
| Axios | 1 | HTTP 请求 + 拦截器 |
| lucide-react | - | 图标库 |

## 前端路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/projects` | 作品列表 |
| `/projects/:slug` | 作品详情 |
| `/posts` | 博文列表 |
| `/posts/:slug` | 博文详情 |
| `/ai` | AI 体验专区 |
| `/about` | 关于我 |
| `/admin/login` | 管理后台登录 |
| `/admin/dashboard` | 仪表盘（需鉴权） |
| `/admin/projects` | 作品管理 |
| `/admin/posts` | 博文管理 |
| `/admin/knowledge` | 知识库管理 |
| `/admin/comments` | 评论审核 |

## 快速开始

```bash
# 切换 Node 版本（需 v20+）
nvm use v22

# 安装依赖
cd frontend
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

后端接口代理：开发时 `/api` 前缀会自动代理到 `http://localhost:8000`，无需额外配置跨域。
