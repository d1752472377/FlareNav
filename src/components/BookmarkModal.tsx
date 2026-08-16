import React, { useState, useEffect } from 'react';
import { X, Sparkles, Globe, Link, Tag, FileText, Check, AlertCircle, Star, Shield, Bot, Wand2 } from 'lucide-react';
import { Bookmark, Category, ThemeMode } from '../types';
import { scrapeUrlMeta, classifyBookmarkAI, AIClassifyResult } from '../services/api';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Bookmark>) => Promise<void>;
  categories: Category[];
  initialData?: Bookmark | null;
  defaultCategoryId?: string;
  theme?: ThemeMode;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  defaultCategoryId,
  theme = 'dark',
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const [isScraping, setIsScraping] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scrapeSuccess, setScrapeSuccess] = useState(false);
  const [aiResult, setAiResult] = useState<AIClassifyResult | null>(null);

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setIconUrl(initialData.icon_url || '');
      setCategoryId(initialData.category_id);
      setIsPinned(Boolean(initialData.is_pinned));
      setIsPrivate(Boolean(initialData.is_private));
      setSortOrder(initialData.sort_order || 0);
      setAiResult(null);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setIconUrl('');
      setCategoryId(
        defaultCategoryId &&
          defaultCategoryId !== 'all' &&
          defaultCategoryId !== 'pinned' &&
          defaultCategoryId !== 'popular'
          ? defaultCategoryId
          : categories[0]?.id || ''
      );
      setIsPinned(false);
      setIsPrivate(false);
      setSortOrder(0);
      setAiResult(null);
    }
    setErrorMsg('');
    setScrapeSuccess(false);
  }, [initialData, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  // AI Classification trigger
  const runAIClassification = async (targetUrl: string, targetTitle: string, targetDesc: string) => {
    if (!targetUrl && !targetTitle) return;
    setIsClassifying(true);
    try {
      const res = await classifyBookmarkAI({
        url: targetUrl,
        title: targetTitle,
        description: targetDesc,
        categories,
      });
      setAiResult(res);
      if (res.category_id) {
        // Automatically select AI suggested category if present in categories
        const matched = categories.find((c) => c.id === res.category_id || c.name === res.category_name);
        if (matched) {
          setCategoryId(matched.id);
        }
      }
      // If description was empty, fill with AI summary
      if (!description.trim() && res.summary) {
        setDescription(res.summary);
      }
    } catch (e) {
      console.warn('AI classification error:', e);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAutoScrape = async () => {
    if (!url.trim()) {
      setErrorMsg('请先输入网页 URL 链接');
      return;
    }
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
      setUrl(formattedUrl);
    }

    setIsScraping(true);
    setErrorMsg('');
    setScrapeSuccess(false);

    let scrapedTitle = title;
    let scrapedDesc = description;
    let scrapedIcon = iconUrl;

    try {
      const meta = await scrapeUrlMeta(formattedUrl);
      if (meta.title) {
        scrapedTitle = meta.title;
        setTitle(meta.title);
      }
      if (meta.description) {
        scrapedDesc = meta.description;
        setDescription(meta.description);
      }
      if (meta.icon_url) {
        scrapedIcon = meta.icon_url;
        setIconUrl(meta.icon_url);
      }
      setScrapeSuccess(true);
    } catch (err: any) {
      console.warn('Scrape failed:', err);
      try {
        const domain = new URL(formattedUrl).hostname;
        if (!title) {
          scrapedTitle = domain;
          setTitle(domain);
        }
        if (!iconUrl) {
          scrapedIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          setIconUrl(scrapedIcon);
        }
        setScrapeSuccess(true);
      } catch (e) {
        setErrorMsg('无法自动抓取网页元数据，请手动输入');
      }
    } finally {
      setIsScraping(false);
    }

    // Automatically trigger Cloudflare AI classification
    await runAIClassification(formattedUrl, scrapedTitle, scrapedDesc);
  };

  const handleManualAIClassify = async () => {
    let formattedUrl = url.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
      setUrl(formattedUrl);
    }
    await runAIClassification(formattedUrl, title.trim(), description.trim());
  };

  const handleAddTagToDesc = (tag: string) => {
    if (!description.includes(tag)) {
      setDescription((prev) => (prev ? `${prev} #${tag}` : `#${tag}`));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('请输入网址 (URL)');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('请输入书签标题');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    let finalIcon = iconUrl.trim();
    if (!finalIcon) {
      try {
        const domain = new URL(finalUrl).hostname;
        finalIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
        finalIcon = '';
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        url: finalUrl,
        title: title.trim(),
        description: description.trim(),
        icon_url: finalIcon,
        category_id: categoryId || categories[0]?.id || 'cat_tools',
        is_pinned: isPinned ? 1 : 0,
        is_private: isPrivate ? 1 : 0,
        sort_order: Number(sortOrder) || 0,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '保存书签失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBg = isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';
  const headerBg = isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/90 border-slate-800';
  const inputBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-2xs'
    : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-400';
  const labelColor = isLight ? 'text-slate-700 font-semibold' : 'text-slate-300 font-semibold';
  const footerBg = isLight ? 'bg-slate-50/50 border-slate-200' : 'border-slate-800';
  const cancelBtnClass = isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-lg border rounded-2xl overflow-hidden flex flex-col max-h-[92vh] ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b ${headerBg}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {initialData ? '编辑书签' : '收录新书签'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* URL Input with Scrape & AI Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs ${labelColor}`}>
                网址 (URL) *
              </label>
              {scrapeSuccess && (
                <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1">
                  <Check size={12} /> 元数据已提取
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition ${inputBg}`}
                />
              </div>
              <button
                type="button"
                onClick={handleAutoScrape}
                disabled={isScraping || isClassifying || !url.trim()}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                title="自动抓取网页标题、图标并调用 Cloudflare AI 智能分类"
              >
                <Sparkles size={13} className={isScraping || isClassifying ? 'animate-spin' : ''} />
                <span>{isScraping ? '抓取中...' : isClassifying ? 'AI 分析中...' : '智能抓取'}</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className={`text-xs ${labelColor}`}>
              书签标题 *
            </label>
            <input
              type="text"
              required
              placeholder="网站名称或工具标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition ${inputBg}`}
            />
          </div>

          {/* Cloudflare AI Smart Category Recommendation Banner (if triggered) */}
          {aiResult && (
            <div className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
              isLight
                ? 'bg-amber-50/80 border-amber-300/80 text-amber-950 shadow-2xs'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Bot size={14} className="text-amber-500" />
                  <span>Cloudflare AI 智能推荐分类</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  @cf/glm-4.7-flash
                </span>
              </div>
              <div className="text-[11px] leading-relaxed">
                推荐放入：<strong className="text-amber-600 dark:text-amber-400">【{aiResult.category_name}】</strong>
                {aiResult.reasoning && <span className="opacity-80"> — {aiResult.reasoning}</span>}
              </div>
              {aiResult.suggested_tags && aiResult.suggested_tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] opacity-70">点击标签加入描述:</span>
                  {aiResult.suggested_tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTagToDesc(tag)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition ${
                        isLight
                          ? 'bg-white hover:bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-slate-800 hover:bg-slate-700 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category Selector with AI Manual trigger */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs ${labelColor}`}>
                所属分类 *
              </label>
              <button
                type="button"
                onClick={handleManualAIClassify}
                disabled={isClassifying || (!url.trim() && !title.trim())}
                className={`text-[11px] font-medium flex items-center gap-1 transition ${
                  isLight ? 'text-amber-700 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300'
                } disabled:opacity-40`}
                title="重新调用 Cloudflare AI 推断最佳分类"
              >
                <Wand2 size={12} className={isClassifying ? 'animate-spin' : ''} />
                <span>{isClassifying ? '推断中...' : 'AI 智能分类'}</span>
              </button>
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border outline-none transition cursor-pointer ${inputBg}`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              AI 自动推断后您仍可随时手动更改上方分类。
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={`text-xs ${labelColor}`}>
              简介描述 / 标签备注
            </label>
            <textarea
              rows={2}
              placeholder="简要描述网站功能、用途或账号提示（选填）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition resize-none ${inputBg}`}
            />
          </div>

          {/* Icon URL preview */}
          <div className="space-y-1.5">
            <label className={`text-xs ${labelColor}`}>
              Favicon 图标链接
            </label>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center p-1 shrink-0 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                {iconUrl ? (
                  <img src={iconUrl} alt="icon" className="w-full h-full object-contain" onError={() => setIconUrl('')} />
                ) : (
                  <Globe size={16} className="text-slate-400" />
                )}
              </div>
              <input
                type="text"
                placeholder="https://.../favicon.ico (默认自动提取)"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                className={`flex-1 rounded-xl px-3 py-2 text-xs border focus:outline-none transition ${inputBg}`}
              />
            </div>
          </div>

          {/* Custom Styled Toggles: Pin to top & Private */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all select-none ${
                isPinned
                  ? isLight
                    ? 'bg-amber-500/15 border-amber-500 text-amber-900 shadow-2xs'
                    : 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-2xs'
                  : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star size={14} className={isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                <span>置顶推荐</span>
              </div>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                isPinned
                  ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
                  : isLight ? 'border-slate-300 bg-white' : 'border-slate-600 bg-slate-800'
              }`}>
                {isPinned && <Check size={11} className="stroke-[3]" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all select-none ${
                isPrivate
                  ? isLight
                    ? 'bg-sky-500/15 border-sky-500 text-sky-900 shadow-2xs'
                    : 'bg-sky-500/15 border-sky-400 text-sky-300 shadow-2xs'
                  : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} className={isPrivate ? 'text-sky-500' : 'text-slate-400'} />
                <span>私有书签</span>
              </div>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                isPrivate
                  ? 'bg-sky-500 border-sky-500 text-slate-950 font-bold'
                  : isLight ? 'border-slate-300 bg-white' : 'border-slate-600 bg-slate-800'
              }`}>
                {isPrivate && <Check size={11} className="stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${footerBg}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${cancelBtnClass}`}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>保存中...</span>
              ) : (
                <>
                  <Check size={14} className="stroke-[2.5]" />
                  <span>{initialData ? '更新书签' : '立即收录'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
