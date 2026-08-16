-- ====================================================================
-- FlareNav - Cloudflare D1 (SQLite) Schema
-- Lightweight, self-hosted personal bookmark & navigation system
-- ====================================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  is_pinned INTEGER DEFAULT 0,
  is_private INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#64748b',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookmark <-> Tag Junction Table
CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (bookmark_id, tag_id),
  FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- System Settings / Config
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Click / Access Analytics
CREATE TABLE IF NOT EXISTS click_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bookmark_id TEXT NOT NULL,
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT DEFAULT '',
  FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_pinned ON bookmarks(is_pinned);
CREATE INDEX IF NOT EXISTS idx_bookmarks_clicks ON bookmarks(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag ON bookmark_tags(tag_id);

-- Initial Seed Data
INSERT OR IGNORE INTO categories (id, name, icon, color, sort_order, is_pinned) VALUES
  ('cat_ai', 'AI 工具 & 智能体', 'Sparkles', '#8b5cf6', 1, 1),
  ('cat_dev', '开发与技术', 'Code2', '#3b82f6', 2, 1),
  ('cat_design', '设计与灵感', 'Palette', '#ec4899', 3, 1),
  ('cat_cloud', '云服务与部署', 'Cloud', '#06b6d4', 4, 0),
  ('cat_tools', '效率与日常', 'Zap', '#f59e0b', 5, 0),
  ('cat_read', '阅读与资讯', 'BookOpen', '#10b981', 6, 0);

INSERT OR IGNORE INTO bookmarks (id, category_id, title, url, description, icon_url, is_pinned, sort_order, click_count) VALUES
  ('bm_1', 'cat_ai', 'ChatGPT', 'https://chatgpt.com', 'OpenAI 旗下的对话式通用人工智能大语言模型', 'https://chatgpt.com/favicon.ico', 1, 1, 48),
  ('bm_2', 'cat_ai', 'Claude', 'https://claude.ai', 'Anthropic 开发的顶级大语言模型与助手', 'https://claude.ai/favicon.ico', 1, 2, 36),
  ('bm_3', 'cat_ai', 'Google AI Studio', 'https://aistudio.google.com', 'Google Gemini 原型构建与 API 交互控制台', 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg', 1, 3, 52),
  ('bm_4', 'cat_ai', 'v0 by Vercel', 'https://v0.dev', '基于自然语言提示词的生成式 UI 与前端组件开发平台', 'https://v0.dev/favicon.ico', 0, 4, 18),
  ('bm_5', 'cat_dev', 'GitHub', 'https://github.com', '全球最大的开源代码托管与协作平台', 'https://github.githubassets.com/favicons/favicon.svg', 1, 1, 89),
  ('bm_6', 'cat_dev', 'Cloudflare Dashboard', 'https://dash.cloudflare.com', 'Cloudflare DNS, Pages, Workers, D1 统一管理控制台', 'https://dash.cloudflare.com/favicon.ico', 1, 2, 42),
  ('bm_7', 'cat_dev', 'MDN Web Docs', 'https://developer.mozilla.org', '权威的 Web 核心技术与 JavaScript/CSS API 标准文档', 'https://developer.mozilla.org/favicon.ico', 0, 3, 27),
  ('bm_8', 'cat_dev', 'Tailwind CSS', 'https://tailwindcss.com', '现代原子化 CSS 样式框架与设计系统', 'https://tailwindcss.com/favicons/favicon.ico', 0, 4, 31),
  ('bm_9', 'cat_design', 'Figma', 'https://www.figma.com', '行业领先的协作式 UI/UX 界面设计工具', 'https://static.figma.com/app/icon/1/favicon.png', 1, 1, 45),
  ('bm_10', 'cat_design', 'Dribbble', 'https://dribbble.com', '全球优秀设计师作品与创意灵感社区', 'https://dribbble.com/favicon.ico', 0, 2, 15),
  ('bm_11', 'cat_cloud', 'Cloudflare Pages Docs', 'https://developers.cloudflare.com/pages/', 'Cloudflare Pages 与 Functions 官方部署与集成指南', 'https://developers.cloudflare.com/favicon.ico', 0, 1, 20),
  ('bm_12', 'cat_tools', 'Notion', 'https://www.notion.so', '一体化笔记、文档协作与知识库工作空间', 'https://www.notion.so/images/favicon.ico', 1, 1, 64),
  ('bm_13', 'cat_read', 'Hacker News', 'https://news.ycombinator.com', 'Y Combinator 旗下的极客科技与创投资讯聚合站', 'https://news.ycombinator.com/favicon.ico', 0, 1, 33);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_title', 'FlareNav 个人导航'),
  ('site_subtitle', '基于 Cloudflare Pages + D1 (SQLite) 架构'),
  ('admin_password_hash', 'admin123'),
  ('allow_public_submit', '0');
