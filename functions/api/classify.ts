/**
 * Cloudflare Pages Function - AI Bookmark Classification Endpoint
 * Calls Cloudflare Workers AI model: @cf/zai-org/glm-4.7-flash
 */

interface Env {
  AI?: any; // Cloudflare Workers AI binding ([ai] binding = "AI")
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
    const { url, title, description, categories = [] } = body;

    if (!url && !title) {
      return new Response(JSON.stringify({ success: false, error: 'URL 或网站标题不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const availableCategories = Array.isArray(categories) && categories.length > 0
      ? categories.map((c: any) => `- ${c.name} (id: ${c.id})`).join('\n')
      : '- AI 工具 & 智能体 (id: cat_ai)\n- 开发与技术 (id: cat_dev)\n- 设计与灵感 (id: cat_design)\n- 云服务与部署 (id: cat_cloud)\n- 效率与日常 (id: cat_tools)\n- 阅读与资讯 (id: cat_read)';

    const systemPrompt = `你是一个精准的书签分类助手。请根据输入的URL和标题，推断最适合的分类名称，并用一句简洁中文（15-25字）说明其具体用途。
要求：
1. 严禁生成“官方平台”、“核心功能与入口”等无意义套话！必须说明具体功能（如：“全栈前端部署与 Serverless 云托管平台”）。
2. 从已有分类中优先选择；若都不符合，提议一个2-4字新分类名。
3. 输出严格 JSON（不带 markdown）：
{
  "category_id": "已有分类ID",
  "category_name": "分类名称",
  "is_new_category": false,
  "suggested_tags": ["标签1", "标签2"],
  "summary": "具体核心用途"
}

已有分类：
${availableCategories}`;

    const userPrompt = `URL: ${url || '未知'}\n标题: ${title || '未知'}\n描述: ${description || '无'}`;

    // 1. If Cloudflare Workers AI is bound
    if (env.AI && typeof env.AI.run === 'function') {
      try {
        const aiResult = await env.AI.run('@cf/zai-org/glm-4.7-flash', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 180,
        });

        let responseText = '';
        if (typeof aiResult === 'string') {
          responseText = aiResult;
        } else if (aiResult && typeof aiResult === 'object') {
          responseText = aiResult.response || aiResult.text || JSON.stringify(aiResult);
        }

        // Clean markdown backticks
        const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        let finalCatName = parsed.category_name || '';
        let matchedCat = categories.find((c: any) => c.id === parsed.category_id || (finalCatName && c.name.toLowerCase() === finalCatName.toLowerCase()));

        const isNew = Boolean(parsed.is_new_category) || (!matchedCat && Boolean(finalCatName));

        // Sanitize summary
        let cleanSummary = parsed.summary || description || '';
        if (cleanSummary.includes('核心功能') || cleanSummary.includes('官方平台') || cleanSummary.includes('使用入口')) {
          cleanSummary = description || '';
        }

        return new Response(JSON.stringify({
          success: true,
          category_id: matchedCat ? matchedCat.id : '',
          category_name: matchedCat ? matchedCat.name : (finalCatName || '效率与日常'),
          is_new_category: isNew,
          suggested_icon: 'Sparkles',
          suggested_color: '#f59e0b',
          suggested_tags: Array.isArray(parsed.suggested_tags) ? parsed.suggested_tags : [],
          summary: cleanSummary,
          reasoning: 'AI 智能计算匹配',
          model: '@cf/zai-org/glm-4.7-flash',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (aiErr: any) {
        console.warn('Cloudflare Workers AI @cf/zai-org/glm-4.7-flash failed, falling back:', aiErr);
      }
    }

    // 2. Intelligent Rule-based Heuristic Fallback
    const combined = `${url} ${title} ${description}`.toLowerCase();
    let matchedId = 'cat_tools';
    let matchedName = '效率与日常';
    let tags = ['常用工具', '效率'];
    let fallbackSummary = description || '';

    if (
      combined.includes('ai') || combined.includes('gpt') || combined.includes('claude') ||
      combined.includes('bot') || combined.includes('llm') || combined.includes('gemini') ||
      combined.includes('model') || combined.includes('智能') || combined.includes('deepseek') ||
      combined.includes('openai') || combined.includes('midjourney')
    ) {
      matchedId = 'cat_ai';
      matchedName = 'AI 工具 & 智能体';
      tags = ['AI', '大模型', '智能助手'];
      if (!fallbackSummary) fallbackSummary = '人工智能大语言模型与 AI 智能体应用';
    } else if (
      combined.includes('github') || combined.includes('code') || combined.includes('dev') ||
      combined.includes('api') || combined.includes('docs') || combined.includes('react') ||
      combined.includes('vue') || combined.includes('git') || combined.includes('npm') ||
      combined.includes('linux') || combined.includes('stack') || combined.includes('developer')
    ) {
      matchedId = 'cat_dev';
      matchedName = '开发与技术';
      tags = ['开发', '编程', '技术规范'];
      if (!fallbackSummary) fallbackSummary = '软件工程、开源代码与技术开发资源';
    } else if (
      combined.includes('design') || combined.includes('figma') || combined.includes('dribbble') ||
      combined.includes('icon') || combined.includes('ui') || combined.includes('ux') ||
      combined.includes('font') || combined.includes('color') || combined.includes('设计') ||
      combined.includes('素材') || combined.includes('behance')
    ) {
      matchedId = 'cat_design';
      matchedName = '设计与灵感';
      tags = ['UI设计', '创意灵感', '设计素材'];
      if (!fallbackSummary) fallbackSummary = 'UI/UX 界面设计、视觉灵感与素材库';
    } else if (
      combined.includes('cloud') || combined.includes('cloudflare') || combined.includes('aws') ||
      combined.includes('vps') || combined.includes('server') || combined.includes('docker') ||
      combined.includes('pages') || combined.includes('deploy') || combined.includes('域名') ||
      combined.includes('云服务') || combined.includes('kubernetes')
    ) {
      matchedId = 'cat_cloud';
      matchedName = '云服务与部署';
      tags = ['云原生', 'Serverless', '边缘计算'];
      if (!fallbackSummary) fallbackSummary = '云计算基础设施与无服务器托管平台';
    } else if (
      combined.includes('news') || combined.includes('blog') || combined.includes('read') ||
      combined.includes('article') || combined.includes('v2ex') || combined.includes('hack') ||
      combined.includes('资讯') || combined.includes('日报') || combined.includes('阅读') ||
      combined.includes('medium') || combined.includes('rss')
    ) {
      matchedId = 'cat_read';
      matchedName = '阅读与资讯';
      tags = ['技术资讯', '深度阅读', '热点追踪'];
      if (!fallbackSummary) fallbackSummary = '科技资讯与高质量技术社区讨论';
    }

    // Match with actual existing user categories if available
    const matchedCategory = categories.find((c: any) => c.id === matchedId || c.name === matchedName);
    const isNew = !matchedCategory;

    return new Response(JSON.stringify({
      success: true,
      category_id: matchedCategory ? matchedCategory.id : '',
      category_name: matchedCategory ? matchedCategory.name : matchedName,
      is_new_category: isNew,
      suggested_icon: 'Sparkles',
      suggested_color: '#f59e0b',
      suggested_tags: tags,
      summary: fallbackSummary,
      reasoning: '根据网址域名与内容智能规则推断',
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
