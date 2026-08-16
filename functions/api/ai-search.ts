/**
 * Cloudflare Pages Function - AI Semantic Search Endpoint
 * Uses Workers AI to interpret search intent and rank/filter bookmarks semantically
 */

interface Env {
  AI?: any;
  DB?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
};

export const onRequestOptions = async () => {
  return new Response(null, { headers: corsHeaders });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  try {
    const body = await request.json().catch(() => ({})) as any;
    const { query, bookmarks = [] } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return new Response(JSON.stringify({ success: false, error: '搜索词不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const trimmedQuery = query.trim();

    // 1. If Cloudflare Workers AI is available
    if (env.AI && typeof env.AI.run === 'function' && Array.isArray(bookmarks) && bookmarks.length > 0) {
      try {
        const bookmarksSummary = bookmarks.map((b: any) => ({
          id: b.id,
          title: b.title,
          url: b.url,
          description: b.description,
        }));

        const systemPrompt = `你是一个书签语义检索助手。用户给出一个搜索意图或问题，请从候选书签列表中找出最符合该意图的候选书签ID列表（按相关度由高到低排序，最多返回8个），并提供一句话推荐理由。

候选书签数据：
${JSON.stringify(bookmarksSummary, null, 2)}

请严格返回如下 JSON 格式，不要返回任何额外文字或 markdown 代码块：
{
  "matched_ids": ["bm_1", "bm_2"],
  "explanation": "匹配说明"
}`;

        const aiResult = await env.AI.run('@cf/zai-org/glm-4.7-flash', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `用户搜索意图: "${trimmedQuery}"` }
          ],
          temperature: 0.1,
        });

        let responseText = '';
        if (typeof aiResult === 'string') {
          responseText = aiResult;
        } else if (aiResult && typeof aiResult === 'object') {
          responseText = aiResult.response || aiResult.text || JSON.stringify(aiResult);
        }

        const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        return new Response(JSON.stringify({
          success: true,
          matched_ids: Array.isArray(parsed.matched_ids) ? parsed.matched_ids : [],
          explanation: parsed.explanation || `AI 语义已检索到相关书签`,
          model: '@cf/zai-org/glm-4.7-flash',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (aiErr: any) {
        console.warn('Workers AI Search error, fallback to fuzzy match:', aiErr);
      }
    }

    // 2. Fuzzy Semantic Heuristic Fallback
    const qLower = trimmedQuery.toLowerCase();
    const matchedIds: string[] = [];

    // Synonyms mapping
    const synonyms: Record<string, string[]> = {
      '画图': ['figma', 'dribbble', '设计', 'ui', 'canvas'],
      '设计': ['figma', 'dribbble', 'palette', 'icon', 'font', '设计'],
      '代码': ['github', 'developer', 'mdn', 'tailwind', 'code', '开发'],
      '写代码': ['github', 'developer', 'mdn', 'tailwind', 'code', '开发'],
      '部署': ['cloudflare', 'cloud', 'pages', 'd1', 'aws', 'vps'],
      '模型': ['chatgpt', 'claude', 'gemini', 'v0', 'ai', '大模型', 'gpt'],
      '笔记': ['notion', '文档', '知识库'],
      '文章': ['hacker news', 'read', '资讯', '博客'],
    };

    const targetKeywords = [qLower];
    for (const [key, synList] of Object.entries(synonyms)) {
      if (qLower.includes(key)) {
        targetKeywords.push(...synList);
      }
    }

    if (Array.isArray(bookmarks)) {
      for (const bm of bookmarks) {
        const text = `${bm.title} ${bm.url} ${bm.description || ''}`.toLowerCase();
        if (targetKeywords.some((kw) => text.includes(kw))) {
          matchedIds.push(bm.id);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      matched_ids: matchedIds,
      explanation: `智能意图匹配到 ${matchedIds.length} 个书签`,
      fallback: true
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
