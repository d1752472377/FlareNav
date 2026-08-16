/**
 * Cloudflare Pages Functions - API Router with D1 Database (SQLite)
 * Handles all /api/* routes when deployed on Cloudflare Pages.
 */

interface Env {
  DB: any; // Cloudflare D1 Database binding
  ADMIN_SECRET_KEY?: string;
  ADMIN_EMAIL?: string; // Optional Zero Trust email, e.g. "user@gmail.com"
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, Cf-Access-Authenticated-User-Email, Cf-Access-Jwt-Assertion',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

function verifyAuth(request: Request, env: Env): boolean {
  // 1. Cloudflare Zero Trust (Access) Email Check
  const cfAccessEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (cfAccessEmail) {
    if (!env.ADMIN_EMAIL || cfAccessEmail.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
  }

  // 2. Token based auth
  const adminSecret = env.ADMIN_SECRET_KEY || 'admin123';
  const token = request.headers.get('X-Admin-Token') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return token === adminSecret;
}

export const onRequestOptions = async () => {
  return new Response(null, { headers: corsHeaders });
};

export const onRequest = async (context: { request: Request; env: Env; params: { route?: string[] } }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const db = env.DB;
  if (!db) {
    return errorResponse('D1 Database binding (DB) is not configured in Cloudflare Pages settings.', 500);
  }

  try {
    // -------------------------------------------------------------
    // Route: GET /api/stats
    // -------------------------------------------------------------
    if (path === '/api/stats' && method === 'GET') {
      const totalBookmarks = await db.prepare('SELECT COUNT(*) as count FROM bookmarks').first();
      const totalCategories = await db.prepare('SELECT COUNT(*) as count FROM categories').first();
      const totalClicks = await db.prepare('SELECT SUM(click_count) as count FROM bookmarks').first();
      const topVisited = await db.prepare('SELECT * FROM bookmarks ORDER BY click_count DESC LIMIT 6').all();

      return jsonResponse({
        success: true,
        stats: {
          totalBookmarks: totalBookmarks?.count || 0,
          totalCategories: totalCategories?.count || 0,
          totalClicks: totalClicks?.count || 0,
          topVisited: topVisited?.results || [],
        }
      });
    }

    // -------------------------------------------------------------
    // Route: GET /api/auth/status (Zero Trust & Admin status check)
    // -------------------------------------------------------------
    if (path === '/api/auth/status' && method === 'GET') {
      const cfAccessEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
      const isZeroTrust = !!cfAccessEmail;
      const adminEmail = env.ADMIN_EMAIL;
      const isZeroTrustAdmin = isZeroTrust && (!adminEmail || cfAccessEmail.toLowerCase() === adminEmail.toLowerCase());
      
      const adminSecret = env.ADMIN_SECRET_KEY || 'admin123';
      const token = request.headers.get('X-Admin-Token') || request.headers.get('Authorization')?.replace('Bearer ', '');
      const isTokenAdmin = token === adminSecret;

      return jsonResponse({
        success: true,
        zeroTrust: isZeroTrust,
        userEmail: cfAccessEmail || null,
        isAdmin: isZeroTrustAdmin || isTokenAdmin,
      });
    }

    // -------------------------------------------------------------
    // Route: POST /api/auth/verify
    // -------------------------------------------------------------
    if (path === '/api/auth/verify' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as any;
      const secret = body?.token || body?.password;
      const configuredSecret = env.ADMIN_SECRET_KEY || 'admin123';
      const isValid = secret === configuredSecret;
      return jsonResponse({ success: isValid, authenticated: isValid });
    }

    // -------------------------------------------------------------
    // Route: GET /api/categories
    // -------------------------------------------------------------
    if (path === '/api/categories' && method === 'GET') {
      const categories = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, created_at ASC').all();
      return jsonResponse({ success: true, data: categories.results || [] });
    }

    // Route: POST /api/categories (Admin required)
    if (path === '/api/categories' && method === 'POST') {
      if (!verifyAuth(request, env)) return errorResponse('Unauthorized: Admin key required', 401);
      const body = await request.json() as any;
      const id = body.id || 'cat_' + Math.random().toString(36).substr(2, 9);
      const name = body.name || '未命名分类';
      const icon = body.icon || 'Folder';
      const color = body.color || '#3b82f6';
      const sort_order = Number(body.sort_order) || 0;
      const is_pinned = body.is_pinned ? 1 : 0;

      await db.prepare(
        'INSERT INTO categories (id, name, icon, color, sort_order, is_pinned) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, name, icon, color, sort_order, is_pinned).run();

      return jsonResponse({ success: true, data: { id, name, icon, color, sort_order, is_pinned } });
    }

    // Route: PUT /api/categories/:id
    if (path.startsWith('/api/categories/') && method === 'PUT') {
      if (!verifyAuth(request, env)) return errorResponse('Unauthorized', 401);
      const id = path.replace('/api/categories/', '');
      const body = await request.json() as any;

      await db.prepare(
        'UPDATE categories SET name = ?, icon = ?, color = ?, sort_order = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(body.name, body.icon, body.color, Number(body.sort_order) || 0, body.is_pinned ? 1 : 0, id).run();

      return jsonResponse({ success: true, message: 'Updated category' });
    }

    // Route: DELETE /api/categories/:id
    if (path.startsWith('/api/categories/') && method === 'DELETE') {
      if (!verifyAuth(request, env)) return errorResponse('Unauthorized', 401);
      const id = path.replace('/api/categories/', '');
      await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, message: 'Deleted category' });
    }

    // -------------------------------------------------------------
    // Route: GET /api/bookmarks
    // -------------------------------------------------------------
    if (path === '/api/bookmarks' && method === 'GET') {
      const categoryId = url.searchParams.get('category_id');
      const search = url.searchParams.get('q');
      const pinnedOnly = url.searchParams.get('pinned') === '1';

      let query = 'SELECT * FROM bookmarks WHERE 1=1';
      const bindings: any[] = [];

      if (categoryId) {
        query += ' AND category_id = ?';
        bindings.push(categoryId);
      }
      if (pinnedOnly) {
        query += ' AND is_pinned = 1';
      }
      if (search) {
        query += ' AND (title LIKE ? OR url LIKE ? OR description LIKE ?)';
        const searchPattern = `%${search}%`;
        bindings.push(searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY is_pinned DESC, sort_order ASC, created_at DESC';

      const stmt = db.prepare(query);
      const bookmarks = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();

      return jsonResponse({ success: true, data: bookmarks.results || [] });
    }

    // Route: POST /api/bookmarks (Admin or Chrome Extension with token)
    if (path === '/api/bookmarks' && method === 'POST') {
      if (!verifyAuth(request, env)) return errorResponse('Unauthorized: Admin key required', 401);
      const body = await request.json() as any;
      const id = body.id || 'bm_' + Math.random().toString(36).substr(2, 9);
      const category_id = body.category_id || 'cat_tools';
      const title = body.title || '未命名书签';
      const bUrl = body.url || 'https://';
      const description = body.description || '';
      const icon_url = body.icon_url || `https://www.google.com/s2/favicons?domain=${new URL(bUrl).hostname}&sz=128`;
      const is_pinned = body.is_pinned ? 1 : 0;
      const is_private = body.is_private ? 1 : 0;
      const sort_order = Number(body.sort_order) || 0;

      await db.prepare(
        'INSERT INTO bookmarks (id, category_id, title, url, description, icon_url, is_pinned, is_private, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, category_id, title, bUrl, description, icon_url, is_pinned, is_private, sort_order).run();

      return jsonResponse({ success: true, data: { id, category_id, title, url: bUrl, description, icon_url, is_pinned, is_private, sort_order } });
    }

    // Route: PUT /api/bookmarks/:id
    if (path.startsWith('/api/bookmarks/') && method === 'PUT') {
      if (!verifyAuth(request, env)) return errorResponse('Unauthorized', 401);
      const id = path.replace('/api/bookmarks/', '');
      const body = await request.json() as any;

      await db.prepare(
        'UPDATE bookmarks SET category_id = ?, title = ?, url = ?, description = ?, icon_url = ?, is_pinned = ?, is_private = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(body.category_id, body.title, body.url, body.description, body.icon_url, body.is_pinned ? 1 : 0, body.is_private ? 1 : 0, Number(body.sort_order) || 0, id).run();

      return jsonResponse({ success: true, message: 'Updated bookmark' });
    }

    // Route: DELETE /api/bookmarks/:id
    if (path.startsWith('/api/bookmarks/') && method === 'DELETE') {
      if (!verifyAuth(request, env)) return errorResponse('Unauthorized', 401);
      const id = path.replace('/api/bookmarks/', '');
      await db.prepare('DELETE FROM bookmarks WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, message: 'Deleted bookmark' });
    }

    // Route: POST /api/bookmarks/:id/click (Public click tracking)
    if (path.match(/\/api\/bookmarks\/[^/]+\/click$/) && method === 'POST') {
      const id = path.split('/')[3];
      await db.prepare('UPDATE bookmarks SET click_count = click_count + 1 WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, message: 'Click logged' });
    }

    // -------------------------------------------------------------
    // Route: POST /api/scrape (Extract title, meta description & favicon)
    // -------------------------------------------------------------
    if (path === '/api/scrape' && method === 'POST') {
      const body = await request.json() as any;
      const targetUrl = body?.url;
      if (!targetUrl) return errorResponse('URL is required');

      try {
        const parsed = new URL(targetUrl);
        const resp = await fetch(targetUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FlareNavBot/1.0)' },
          ...({ cf: { cacheTtl: 3600 } } as any)
        });
        const html = await resp.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : parsed.hostname;

        // Extract description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const description = descMatch ? descMatch[1].trim() : '';

        // Extract icon
        const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
        let icon_url = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
        if (iconMatch) {
          const rawIcon = iconMatch[1];
          icon_url = rawIcon.startsWith('http') ? rawIcon : new URL(rawIcon, targetUrl).toString();
        }

        return jsonResponse({
          success: true,
          data: {
            title,
            description,
            icon_url,
            url: targetUrl
          }
        });
      } catch (err: any) {
        const parsed = new URL(targetUrl);
        return jsonResponse({
          success: true,
          data: {
            title: parsed.hostname,
            description: '',
            icon_url: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
            url: targetUrl
          }
        });
      }
    }

    return errorResponse(`Route ${method} ${path} not found`, 404);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
