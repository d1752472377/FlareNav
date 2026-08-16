# FlareNav - 轻量级自托管个人导航标签系统

基于 **Cloudflare Pages + Cloudflare D1 (SQLite)** 全栈 Serverless 架构的个人导航与书签系统，配套 **Chrome 浏览器收藏扩展 (Manifest V3)** 与全自动元数据抓取。

---

## ✨ 核心特性

- ⚡ **100% Serverless 架构**：依托 Cloudflare 全球边缘网络，前端 Pages 托管，后端 Pages Functions 提供 REST API，数据持久化在 Cloudflare D1 (分布式 SQLite) 上，**零服务器运维成本，终身免费额度充足**。
- 🧩 **配套 Chrome 浏览器收藏插件 (Manifest V3)**：
  - 一键收录当前网页，自动抓取 Favicon、网页标题与页面摘要；
  - 插件弹窗内支持即时搜索与书签直达；
  - 支持右键菜单一键推送到 FlareNav。
- 🔍 **多引擎聚合检索**：内置站内书签秒级检索 + Google / Bing / GitHub / DuckDuckGo / 百度 / B站 快捷切换。
- 📱 **多布局响应式体验**：支持 Bento 磁贴、标准网格、紧凑列表 3 种布局切换，自适应移动端与桌面端。
- 🎨 **主题系统**：暗黑、明亮、OLED 纯黑、Cyber 极客主题无缝切换。
- 📥 **数据导入与导出**：支持 Chrome / Edge / Firefox 标准 Netscape HTML 书签批量导入导出，以及 JSON / D1 SQL Dump 备份。
- 🔐 **安全管理模式**：基于 `ADMIN_SECRET_KEY` 鉴权，支持置顶推荐、分类管理、访问热度统计。

---

## 📁 目录结构

```text
├── schema.sql                 # Cloudflare D1 (SQLite) 数据库表结构定义
├── wrangler.toml              # Cloudflare Pages / D1 部署配置文件
├── functions/                 # Cloudflare Pages Functions (Edge API 路由)
│   └── api/
│       └── [[route]].ts       # 全功能 D1 REST API 处理器
├── extension/                 # Chrome 浏览器扩展 (Manifest V3)
│   ├── manifest.json          # 扩展清单文件
│   ├── popup.html / popup.js  # 插件弹窗 UI 与交互逻辑
│   ├── options.html / .js     # 插件服务器与密钥配置页
│   ├── background.js          # 后台 Service Worker 与右键菜单
│   └── README.md              # 插件加载说明
├── src/                       # 前端 React + Tailwind CSS 源码
│   ├── components/            # UI 组件库 (导航栏, 侧边栏, 磁贴网格, 模态框等)
│   ├── services/              # API 与 D1 同步服务
│   ├── types.ts               # TypeScript 类型定义
│   └── App.tsx                # 应用核心入口
└── server.ts                  # 本地全栈开发与 D1 模拟服务器 (Express)
```

---

## 🚀 部署到 Cloudflare Pages (只需 3 分钟)

### 第一步：创建 Cloudflare D1 数据库
确保已安装 Node.js，在终端执行：
```bash
# 登录 Cloudflare 账号
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create flarenav_db
```
执行后复制命令行输出的 `database_id`，粘贴到 `wrangler.toml` 文件中对应字段。

### 第二步：初始化 SQLite 数据表
```bash
npx wrangler d1 execute flarenav_db --file=./schema.sql --remote
```

### 第三步：推送到 GitHub 并连接 Cloudflare Pages
1. 将当前项目推送到您的 GitHub 仓库；
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages > Create application > Pages > Connect to Git**；
3. 选择刚才推送的仓库，配置构建参数：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 进入 Pages 项目详情页：**Settings > Functions > D1 database bindings**，添加绑定：
   - **Variable name**: `DB`
   - **D1 database**: 选择 `flarenav_db`
5. （可选）在 **Settings > Environment variables** 中添加 `ADMIN_SECRET_KEY` 作为您的自定义管理密钥（默认值为 `admin123`）。

---

## 🔌 安装配套 Chrome 插件

1. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/` 并回车；
2. 打开右上角的 **「开发者模式」 (Developer mode)**；
3. 点击左上角 **「加载已解压的扩展程序」 (Load unpacked)**；
4. 选择本项目根目录下的 `extension/` 文件夹；
5. 加载完成后，点击插件图标进入设置，填入您的 Cloudflare Pages 线上地址与管理密钥即可！
