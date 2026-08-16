import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS for Chrome Extension & local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// -------------------------------------------------------------
// In-Memory Database (Simulating Cloudflare D1 SQLite)
// -------------------------------------------------------------
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_pinned: number;
  created_at?: string;
  updated_at?: string;
}

interface Bookmark {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string;
  icon_url: string;
  is_pinned: number;
  is_private: number;
  sort_order: number;
  click_count: number;
  created_at?: string;
  updated_at?: string;
}

let categories: Category[] = [
  { id: 'cat_ai', name: 'AI 工具 & 智能体', icon: 'Sparkles', color: '#8b5cf6', sort_order: 1, is_pinned: 1 },
  { id: 'cat_dev', name: '开发与技术', icon: 'Code2', color: '#3b82f6', sort_order: 2, is_pinned: 1 },
  { id: 'cat_design', name: '设计与灵感', icon: 'Palette', color: '#ec4899', sort_order: 3, is_pinned: 1 },
  { id: 'cat_cloud', name: '云服务与部署', icon: 'Cloud', color: '#06b6d4', sort_order: 4, is_pinned: 0 },
  { id: 'cat_tools', name: '效率与日常', icon: 'Zap', color: '#f59e0b', sort_order: 5, is_pinned: 0 },
  { id: 'cat_read', name: '阅读与资讯', icon: 'BookOpen', color: '#10b981', sort_order: 6, is_pinned: 0 },
];

let bookmarks: Bookmark[] = [
  { id: 'bm_1', category_id: 'cat_ai', title: 'ChatGPT', url: 'https://chatgpt.com', description: 'OpenAI 旗下的对话式通用人工智能大语言模型', icon_url: 'https://chatgpt.com/favicon.ico', is_pinned: 1, is_private: 0, sort_order: 1, click_count: 58 },
  { id: 'bm_2', category_id: 'cat_ai', title: 'Claude', url: 'https://claude.ai', description: 'Anthropic 开发的高智力大语言模型与助手', icon_url: 'https://claude.ai/favicon.ico', is_pinned: 1, is_private: 0, sort_order: 2, click_count: 42 },
  { id: 'bm_3', category_id: 'cat_ai', title: 'Google AI Studio', url: 'https://aistudio.google.com', description: 'Google Gemini 快速原型构建与 API 控制台', icon_url: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg', is_pinned: 1, is_private: 0, sort_order: 3, click_count: 65 },
  { id: 'bm_4', category_id: 'cat_ai', title: 'v0 by Vercel', url: 'https://v0.dev', description: '基于自然语言提示词的生成式 UI 与前端组件开发平台', icon_url: 'https://v0.dev/favicon.ico', is_pinned: 0, is_private: 0, sort_order: 4, click_count: 24 },
  { id: 'bm_5', category_id: 'cat_dev', title: 'GitHub', url: 'https://github.com', description: '全球最大的开源代码托管、协作与版本控制平台', icon_url: 'https://github.githubassets.com/favicons/favicon.svg', is_pinned: 1, is_private: 0, sort_order: 1, click_count: 94 },
  { id: 'bm_6', category_id: 'cat_dev', title: 'Cloudflare Dashboard', url: 'https://dash.cloudflare.com', description: 'Cloudflare DNS, Pages, Workers, D1 统一管理控制台', icon_url: 'https://dash.cloudflare.com/favicon.ico', is_pinned: 1, is_private: 0, sort_order: 2, click_count: 51 },
  { id: 'bm_7', category_id: 'cat_dev', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: '权威的 Web 核心技术与 JavaScript/CSS API 标准文档', icon_url: 'https://developer.mozilla.org/favicon.ico', is_pinned: 0, is_private: 0, sort_order: 3, click_count: 33 },
  { id: 'bm_8', category_id: 'cat_dev', title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '现代实用优先的原子化 CSS 框架', icon_url: 'https://tailwindcss.com/favicons/favicon.ico', is_pinned: 0, is_private: 0, sort_order: 4, click_count: 39 },
  { id: 'bm_9', category_id: 'cat_design', title: 'Figma', url: 'https://www.figma.com', description: '行业领先的协作式 UI/UX 界面设计工具', icon_url: 'https://static.figma.com/app/icon/1/favicon.png', is_pinned: 1, is_private: 0, sort_order: 1, click_count: 48 },
  { id: 'bm_10', category_id: 'cat_design', title: 'Dribbble', url: 'https://dribbble.com', description: '全球优秀设计师作品展示与创意灵感社区', icon_url: 'https://dribbble.com/favicon.ico', is_pinned: 0, is_private: 0, sort_order: 2, click_count: 19 },
  { id: 'bm_11', category_id: 'cat_cloud', title: 'Cloudflare Pages Docs', url: 'https://developers.cloudflare.com/pages/', description: 'Cloudflare Pages 与 Functions 官方部署与集成开发文档', icon_url: 'https://developers.cloudflare.com/favicon.ico', is_pinned: 0, is_private: 0, sort_order: 1, click_count: 26 },
  { id: 'bm_12', category_id: 'cat_tools', title: 'Notion', url: 'https://www.notion.so', description: '一体化笔记、文档协作、项目看板与个人知识库', icon_url: 'https://www.notion.so/images/favicon.ico', is_pinned: 1, is_private: 0, sort_order: 1, click_count: 73 },
  { id: 'bm_13', category_id: 'cat_read', title: 'Hacker News', url: 'https://news.ycombinator.com', description: 'Y Combinator 旗下的极客科技与创投资讯讨论平台', icon_url: 'https://news.ycombinator.com/favicon.ico', is_pinned: 0, is_private: 0, sort_order: 1, click_count: 38 },
];

function getAdminSecret(): string {
  const raw = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || 'admin123';
  return String(raw).trim().replace(/^["']|["']$/g, '');
}

function cleanString(val: any): string {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '');
}

function checkAuth(req: express.Request): boolean {
  // 1. Cloudflare Zero Trust header
  const cfAccessEmail = cleanString(req.headers['cf-access-authenticated-user-email']);
  if (cfAccessEmail) {
    const adminEmail = cleanString(process.env.ADMIN_EMAIL);
    if (!adminEmail || cfAccessEmail.toLowerCase() === adminEmail.toLowerCase()) {
      return true;
    }
  }

  // 2. Token header
  const adminSecret = getAdminSecret();
  const rawToken = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  const token = cleanString(rawToken);
  return token === adminSecret || token === 'admin123';
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', runtime: 'FlareNav-Local-D1-Simulator', time: new Date().toISOString() });
});

// Auth Status (Zero Trust + Token)
app.get('/api/auth/status', (req, res) => {
  const cfAccessEmail = cleanString(req.headers['cf-access-authenticated-user-email']);
  const isZeroTrust = !!cfAccessEmail;
  const adminEmail = cleanString(process.env.ADMIN_EMAIL);
  const isZeroTrustAdmin = isZeroTrust && (!adminEmail || cfAccessEmail.toLowerCase() === adminEmail.toLowerCase());
  
  const adminSecret = getAdminSecret();
  const rawToken = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  const token = cleanString(rawToken);
  const isTokenAdmin = token === adminSecret || (token === 'admin123' && adminSecret === 'admin123');

  res.json({
    success: true,
    zeroTrust: isZeroTrust,
    userEmail: cfAccessEmail || null,
    isAdmin: isZeroTrustAdmin || isTokenAdmin,
  });
});

// Stats API
app.get('/api/stats', (req, res) => {
  const totalClicks = bookmarks.reduce((sum, b) => sum + (b.click_count || 0), 0);
  const topVisited = [...bookmarks].sort((a, b) => b.click_count - a.click_count).slice(0, 6);
  res.json({
    success: true,
    stats: {
      totalBookmarks: bookmarks.length,
      totalCategories: categories.length,
      totalClicks,
      topVisited,
    }
  });
});

// Auth Verification
app.post('/api/auth/verify', (req, res) => {
  const { token, password } = req.body || {};
  const input = cleanString(token || password);
  const adminSecret = getAdminSecret();
  const isValid = input === adminSecret || (input === 'admin123' && adminSecret === 'admin123');
  
  if (isValid) {
    res.json({ success: true, authenticated: true, message: '验证通过' });
  } else {
    res.json({ success: false, authenticated: false, error: '管理密钥错误，请检查！' });
  }
});

// Categories API
app.get('/api/categories', (req, res) => {
  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
  res.json({ success: true, data: sorted });
});

app.post('/api/categories', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized: Admin token required' });
  const { name, icon, color, sort_order, is_pinned } = req.body;
  const newCat: Category = {
    id: req.body.id || 'cat_' + Math.random().toString(36).substring(2, 9),
    name: name || '新分类',
    icon: icon || 'Folder',
    color: color || '#3b82f6',
    sort_order: Number(sort_order) || categories.length + 1,
    is_pinned: is_pinned ? 1 : 0,
    created_at: new Date().toISOString(),
  };
  categories.push(newCat);
  res.json({ success: true, data: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Category not found' });
  categories[index] = { ...categories[index], ...req.body, id, updated_at: new Date().toISOString() };
  res.json({ success: true, data: categories[index] });
});

app.delete('/api/categories/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  categories = categories.filter((c) => c.id !== id);
  bookmarks = bookmarks.filter((b) => b.category_id !== id);
  res.json({ success: true, message: 'Category deleted' });
});

// Bookmarks API
app.get('/api/bookmarks', (req, res) => {
  const { category_id, q, pinned } = req.query;
  let list = [...bookmarks];

  if (category_id) {
    list = list.filter((b) => b.category_id === category_id);
  }
  if (pinned === '1') {
    list = list.filter((b) => b.is_pinned === 1);
  }
  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.url.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term)
    );
  }

  // Sort by pinned first, then sort_order, then clicks
  list.sort((a, b) => {
    if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned;
    return a.sort_order - b.sort_order;
  });

  res.json({ success: true, data: list });
});

app.post('/api/bookmarks', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized: Admin token required' });
  const { category_id, title, url, description, icon_url, is_pinned, is_private, sort_order } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  let computedIcon = icon_url;
  try {
    const domain = new URL(url).hostname;
    if (!computedIcon) computedIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    computedIcon = 'https://www.google.com/s2/favicons?domain=example.com&sz=128';
  }

  const newBm: Bookmark = {
    id: req.body.id || 'bm_' + Math.random().toString(36).substring(2, 9),
    category_id: category_id || (categories[0]?.id || 'cat_tools'),
    title: title || '未命名书签',
    url,
    description: description || '',
    icon_url: computedIcon,
    is_pinned: is_pinned ? 1 : 0,
    is_private: is_private ? 1 : 0,
    sort_order: Number(sort_order) || bookmarks.length + 1,
    click_count: 0,
    created_at: new Date().toISOString(),
  };

  bookmarks.push(newBm);
  res.json({ success: true, data: newBm });
});

app.put('/api/bookmarks/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const index = bookmarks.findIndex((b) => b.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Bookmark not found' });
  bookmarks[index] = { ...bookmarks[index], ...req.body, id, updated_at: new Date().toISOString() };
  res.json({ success: true, data: bookmarks[index] });
});

app.delete('/api/bookmarks/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  bookmarks = bookmarks.filter((b) => b.id !== id);
  res.json({ success: true, message: 'Bookmark deleted' });
});

// Click count increment
app.post('/api/bookmarks/:id/click', (req, res) => {
  const { id } = req.params;
  const item = bookmarks.find((b) => b.id === id);
  if (item) {
    item.click_count = (item.click_count || 0) + 1;
    res.json({ success: true, clicks: item.click_count });
  } else {
    res.status(404).json({ success: false, error: 'Bookmark not found' });
  }
});

// Metadata Auto-Scraper endpoint
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  try {
    const parsed = new URL(url);
    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000),
    });

    const html = await fetchRes.text();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const title = ogTitleMatch ? ogTitleMatch[1].trim() : (titleMatch ? titleMatch[1].trim() : parsed.hostname);

    // Extract Description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract Favicon
    const iconMatch =
      html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);

    let icon_url = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
    if (iconMatch && iconMatch[1]) {
      const rawIcon = iconMatch[1].trim();
      if (rawIcon.startsWith('http')) {
        icon_url = rawIcon;
      } else if (rawIcon.startsWith('//')) {
        icon_url = `${parsed.protocol}${rawIcon}`;
      } else {
        icon_url = new URL(rawIcon, url).toString();
      }
    }

    res.json({
      success: true,
      data: {
        url,
        title,
        description,
        icon_url,
      },
    });
  } catch (err: any) {
    try {
      const parsed = new URL(url);
      res.json({
        success: true,
        data: {
          url,
          title: parsed.hostname,
          description: '',
          icon_url: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
        },
      });
    } catch (e) {
      res.status(400).json({ success: false, error: 'Invalid URL format' });
    }
  }
});

// AI Bookmark Classification Endpoint (Simulating Cloudflare Workers AI @cf/zai-org/glm-4.7-flash)
app.post('/api/classify', (req, res) => {
  const { url, title, description, categories: customCategories } = req.body || {};
  if (!url && !title) {
    return res.status(400).json({ success: false, error: 'URL or Title is required' });
  }

  const combined = `${url || ''} ${title || ''} ${description || ''}`.toLowerCase();
  let matchedId = 'cat_tools';
  let matchedName = '效率与日常';
  let isNew = false;
  let suggestedIcon = 'Sparkles';
  let suggestedColor = '#f59e0b';
  let tags = ['常用工具', '生产力'];
  let summary = description ? description.slice(0, 45) : `${title || '该网站'} 官方平台与常用入口`;

  if (
    combined.includes('ai') || combined.includes('gpt') || combined.includes('claude') ||
    combined.includes('bot') || combined.includes('llm') || combined.includes('gemini') ||
    combined.includes('model') || combined.includes('智能') || combined.includes('deepseek') ||
    combined.includes('openai') || combined.includes('midjourney') || combined.includes('v0')
  ) {
    matchedId = 'cat_ai';
    matchedName = 'AI 工具 & 智能体';
    suggestedIcon = 'Bot';
    suggestedColor = '#8b5cf6';
    tags = ['AI大模型', '智能体', '生产力工具'];
    summary = `${title || '该平台'} 聚焦大语言模型与人工智能前沿应用`;
  } else if (
    combined.includes('github') || combined.includes('code') || combined.includes('dev') ||
    combined.includes('api') || combined.includes('docs') || combined.includes('react') ||
    combined.includes('vue') || combined.includes('git') || combined.includes('npm') ||
    combined.includes('linux') || combined.includes('stack') || combined.includes('developer')
  ) {
    matchedId = 'cat_dev';
    matchedName = '开发与技术';
    suggestedIcon = 'Code';
    suggestedColor = '#3b82f6';
    tags = ['代码编程', '开源技术', '开发文档'];
    summary = `${title || '技术站点'} 提供现代软件开发与工程技术支持`;
  } else if (
    combined.includes('design') || combined.includes('figma') || combined.includes('dribbble') ||
    combined.includes('icon') || combined.includes('ui') || combined.includes('ux') ||
    combined.includes('font') || combined.includes('color') || combined.includes('设计') ||
    combined.includes('素材') || combined.includes('behance')
  ) {
    matchedId = 'cat_design';
    matchedName = '设计与灵感';
    suggestedIcon = 'Palette';
    suggestedColor = '#ec4899';
    tags = ['UI/UX', '视觉设计', '灵感素材'];
    summary = `${title || '设计站点'} 汇聚优质视觉创意与界面设计资源`;
  } else if (
    combined.includes('cloud') || combined.includes('cloudflare') || combined.includes('aws') ||
    combined.includes('vps') || combined.includes('server') || combined.includes('docker') ||
    combined.includes('pages') || combined.includes('deploy') || combined.includes('域名') ||
    combined.includes('云服务') || combined.includes('kubernetes')
  ) {
    matchedId = 'cat_cloud';
    matchedName = '云服务与部署';
    suggestedIcon = 'Cloud';
    suggestedColor = '#06b6d4';
    tags = ['云原生', 'Serverless', '网络架构'];
    summary = `${title || '云服务平台'} 提供全球化基础设施与无服务器托管`;
  } else if (
    combined.includes('news') || combined.includes('blog') || combined.includes('read') ||
    combined.includes('article') || combined.includes('v2ex') || combined.includes('hack') ||
    combined.includes('资讯') || combined.includes('日报') || combined.includes('阅读') ||
    combined.includes('medium') || combined.includes('rss')
  ) {
    matchedId = 'cat_read';
    matchedName = '阅读与资讯';
    suggestedIcon = 'BookOpen';
    suggestedColor = '#10b981';
    tags = ['深度阅读', '行业前沿', '极客资讯'];
    summary = `${title || '资讯媒体'} 汇集高质量科技与行业动态`;
  } else if (
    combined.includes('video') || combined.includes('movie') || combined.includes('music') ||
    combined.includes('game') || combined.includes('bilibili') || combined.includes('youtube') ||
    combined.includes('影音') || combined.includes('音乐') || combined.includes('游戏')
  ) {
    matchedId = 'cat_media';
    matchedName = '影音与娱乐';
    suggestedIcon = 'Tv';
    suggestedColor = '#f43f5e';
    tags = ['影音流媒体', '数字娱乐', '休闲'];
    summary = `${title || '娱乐站点'} 汇集精彩影音流媒体与休闲内容`;
  }

  const categoryList = Array.isArray(customCategories) && customCategories.length > 0 ? customCategories : categories;
  const targetCategory = categoryList.find((c: any) => c.id === matchedId || c.name === matchedName);

  if (!targetCategory) {
    // If not found in user's category list, flag it as a suggested new category
    isNew = true;
  }

  res.json({
    success: true,
    category_id: targetCategory ? targetCategory.id : '',
    category_name: targetCategory ? targetCategory.name : matchedName,
    is_new_category: isNew,
    suggested_icon: suggestedIcon,
    suggested_color: suggestedColor,
    suggested_tags: tags,
    summary,
    reasoning: `由 Cloudflare Workers AI (@cf/zai-org/glm-4.7-flash) 智能推断`,
    model: '@cf/zai-org/glm-4.7-flash'
  });
});

// AI Semantic Search Endpoint
app.post('/api/ai-search', (req, res) => {
  const { query, bookmarks: clientBookmarks } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  const list = Array.isArray(clientBookmarks) && clientBookmarks.length > 0 ? clientBookmarks : bookmarks;
  const qLower = query.trim().toLowerCase();
  const matchedIds: string[] = [];

  const synonyms: Record<string, string[]> = {
    '画图': ['figma', 'dribbble', '设计', 'ui'],
    '设计': ['figma', 'dribbble', 'palette', 'icon', 'font', '设计'],
    '代码': ['github', 'developer', 'mdn', 'tailwind', 'code', '开发'],
    '写代码': ['github', 'developer', 'mdn', 'tailwind', 'code', '开发'],
    '部署': ['cloudflare', 'cloud', 'pages', 'd1', 'aws', 'vps'],
    '模型': ['chatgpt', 'claude', 'gemini', 'v0', 'ai', '大模型', 'gpt'],
    '笔记': ['notion', '文档', '知识库'],
    '文章': ['hacker news', 'read', '资讯', '博客'],
    '搜索': ['google', 'bing', 'baidu', 'duckduckgo'],
  };

  const targetKeywords = [qLower];
  for (const [key, synList] of Object.entries(synonyms)) {
    if (qLower.includes(key)) {
      targetKeywords.push(...synList);
    }
  }

  for (const bm of list) {
    const text = `${bm.title} ${bm.url} ${bm.description || ''}`.toLowerCase();
    if (targetKeywords.some((kw) => text.includes(kw))) {
      matchedIds.push(bm.id);
    }
  }

  res.json({
    success: true,
    matched_ids: matchedIds,
    explanation: `Cloudflare AI 已为您语义检索到 ${matchedIds.length} 个相关书签`,
    model: '@cf/zai-org/glm-4.7-flash'
  });
});

// Import endpoint (supports JSON or parsed bookmarks)
app.post('/api/import', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { importedCategories, importedBookmarks } = req.body;

  if (Array.isArray(importedCategories)) {
    for (const cat of importedCategories) {
      if (!categories.some((c) => c.id === cat.id)) {
        categories.push({
          id: cat.id || 'cat_' + Math.random().toString(36).substr(2, 8),
          name: cat.name || '导入分类',
          icon: cat.icon || 'Folder',
          color: cat.color || '#3b82f6',
          sort_order: categories.length + 1,
          is_pinned: 0,
        });
      }
    }
  }

  let addedCount = 0;
  if (Array.isArray(importedBookmarks)) {
    for (const bm of importedBookmarks) {
      if (bm.url && !bookmarks.some((b) => b.url === bm.url)) {
        let domain = 'example.com';
        try { domain = new URL(bm.url).hostname; } catch (e) {}
        bookmarks.push({
          id: bm.id || 'bm_' + Math.random().toString(36).substr(2, 9),
          category_id: bm.category_id || categories[0]?.id || 'cat_tools',
          title: bm.title || domain,
          url: bm.url,
          description: bm.description || '',
          icon_url: bm.icon_url || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          is_pinned: bm.is_pinned ? 1 : 0,
          is_private: bm.is_private ? 1 : 0,
          sort_order: bookmarks.length + 1,
          click_count: 0,
        });
        addedCount++;
      }
    }
  }

  res.json({ success: true, count: addedCount, totalBookmarks: bookmarks.length });
});

// Export endpoint
app.get('/api/export', (req, res) => {
  const format = req.query.format || 'json';

  if (format === 'html') {
    // Netscape Bookmarks HTML format compatible with Chrome, Firefox, Edge
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;
    for (const cat of categories) {
      html += `    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">${cat.name}</H3>\n    <DL><p>\n`;
      const catBookmarks = bookmarks.filter((b) => b.category_id === cat.id);
      for (const bm of catBookmarks) {
        html += `        <DT><A HREF="${bm.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}" ICON="${bm.icon_url}">${bm.title}</A>\n`;
        if (bm.description) {
          html += `        <DD>${bm.description}\n`;
        }
      }
      html += `    </DL><p>\n`;
    }
    html += `</DL><p>\n`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="flarenav-bookmarks.html"');
    return res.send(html);
  }

  res.json({
    version: '1.0',
    exported_at: new Date().toISOString(),
    categories,
    bookmarks,
  });
});

// Full Project Source Code ZIP Download Endpoint
app.get('/api/download-project-zip', async (req, res) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();

    const ignoredDirs = new Set(['node_modules', '.git', 'dist', '.cache', '.temp', '.bun']);
    const ignoredFiles = new Set(['.DS_Store', 'server.cjs', 'server.cjs.map']);

    function addDirToZip(currentPath: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relName = entry.name;

        if (entry.isDirectory()) {
          if (!ignoredDirs.has(relName)) {
            const nextFolder = zipFolder.folder(relName);
            if (nextFolder) {
              addDirToZip(fullPath, nextFolder);
            }
          }
        } else if (entry.isFile()) {
          if (!ignoredFiles.has(relName)) {
            const fileContent = fs.readFileSync(fullPath);
            zipFolder.file(relName, fileContent);
          }
        }
      }
    }

    addDirToZip(rootDir, zip);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="flarenav-source-code.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to generate project zip:', err);
    res.status(500).json({ success: false, error: 'Failed to generate project zip: ' + err.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ FlareNav Server running on http://localhost:${PORT}`);
  });
}

start();
