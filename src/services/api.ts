import { Bookmark, Category, StatsData } from '../types';

const ADMIN_TOKEN_KEY = 'flarenav_admin_token';

export function getStoredAdminToken(): string {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setStoredAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeStoredAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  return {
    'Content-Type': 'application/json',
    'X-Admin-Token': token,
    'Authorization': `Bearer ${token}`,
  };
}

export async function verifyAdminToken(token: string): Promise<{ success: boolean; message?: string }> {
  const clean = token.trim().replace(/^["']|["']$/g, '');
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: clean }),
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return {
        success: false,
        message: errData?.error || `服务器响应异常 (${res.status})，请检查 Cloudflare Pages 设置`,
      };
    }

    const data = await res.json();
    if (data.authenticated || data.success) {
      return { success: true };
    }
    return {
      success: false,
      message: data.error || '管理密钥错误，请检查！默认密钥为 admin123',
    };
  } catch (err: any) {
    console.error('Failed to verify token:', err);
    // Offline or pure local preview fallback
    if (clean === 'admin123') {
      return { success: true };
    }
    return { success: false, message: '网络异常或未能连接到服务器，已为您尝试本地密钥' };
  }
}

export async function fetchAuthStatus(): Promise<{ success: boolean; zeroTrust: boolean; userEmail: string | null; isAdmin: boolean }> {
  try {
    const res = await fetch('/api/auth/status', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      zeroTrust: false,
      userEmail: null,
      isAdmin: false,
    };
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('API fetchCategories failed, using fallback');
  }
  return [];
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to create category');
  }
  return json.data;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update category');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to delete category');
  }
}

export async function fetchBookmarks(params?: { category_id?: string; q?: string; pinned?: boolean }): Promise<Bookmark[]> {
  const query = new URLSearchParams();
  if (params?.category_id) query.set('category_id', params.category_id);
  if (params?.q) query.set('q', params.q);
  if (params?.pinned) query.set('pinned', '1');

  try {
    const res = await fetch(`/api/bookmarks?${query.toString()}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('API fetchBookmarks failed');
  }
  return [];
}

export async function createBookmark(bookmark: Partial<Bookmark>): Promise<Bookmark> {
  const res = await fetch('/api/bookmarks', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookmark),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to create bookmark');
  }
  return json.data;
}

export async function updateBookmark(id: string, bookmark: Partial<Bookmark>): Promise<void> {
  const res = await fetch(`/api/bookmarks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookmark),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update bookmark');
  }
}

export async function deleteBookmark(id: string): Promise<void> {
  const res = await fetch(`/api/bookmarks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to delete bookmark');
  }
}

export async function trackBookmarkClick(id: string): Promise<void> {
  try {
    await fetch(`/api/bookmarks/${id}/click`, { method: 'POST' });
  } catch (e) {
    // Ignore analytics tracking errors
  }
}

export async function scrapeUrlMeta(url: string): Promise<{ title: string; description: string; icon_url: string }> {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.error || 'Failed to scrape URL metadata');
}

export async function fetchStats(): Promise<StatsData> {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    if (json.success && json.stats) {
      return json.stats;
    }
  } catch (e) {
    console.error(e);
  }
  return { totalBookmarks: 0, totalCategories: 0, totalClicks: 0, topVisited: [] };
}

export async function importBookmarksData(payload: { importedCategories?: any[]; importedBookmarks?: any[] }): Promise<number> {
  const res = await fetch('/api/import', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to import bookmarks');
  }
  return json.count || 0;
}

export interface AIClassifyResult {
  success: boolean;
  category_id: string;
  category_name: string;
  is_new_category?: boolean;
  suggested_icon?: string;
  suggested_color?: string;
  suggested_tags: string[];
  summary: string;
  reasoning?: string;
  model?: string;
}

export async function classifyBookmarkAI(payload: {
  url?: string;
  title?: string;
  description?: string;
  categories?: Category[];
}): Promise<AIClassifyResult> {
  const token = getStoredAdminToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['X-Admin-Token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/classify', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.success) {
    return json;
  }
  throw new Error(json.error || 'AI 智能分类推断失败');
}

export async function searchBookmarksAI(query: string, bookmarks: Bookmark[]): Promise<{ matched_ids: string[]; explanation: string }> {
  const res = await fetch('/api/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, bookmarks }),
  });
  const json = await res.json();
  if (json.success) {
    return {
      matched_ids: json.matched_ids || [],
      explanation: json.explanation || '',
    };
  }
  throw new Error(json.error || 'AI 语义搜索失败');
}

