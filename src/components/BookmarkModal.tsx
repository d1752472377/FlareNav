import React, { useState, useEffect } from 'react';
import { X, Sparkles, Globe, Link, Tag, FileText, Check, AlertCircle, Star, Shield } from 'lucide-react';
import { Bookmark, Category } from '../types';
import { scrapeUrlMeta } from '../services/api';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Bookmark>) => Promise<void>;
  categories: Category[];
  initialData?: Bookmark | null;
  defaultCategoryId?: string;
  theme?: 'dark' | 'light' | 'oled' | 'cyber';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scrapeSuccess, setScrapeSuccess] = useState(false);

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
    }
    setErrorMsg('');
    setScrapeSuccess(false);
  }, [initialData, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

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

    try {
      const meta = await scrapeUrlMeta(formattedUrl);
      if (meta.title) setTitle(meta.title);
      if (meta.description) setDescription(meta.description);
      if (meta.icon_url) setIconUrl(meta.icon_url);
      setScrapeSuccess(true);
    } catch (err: any) {
      console.warn('Scrape failed:', err);
      try {
        const domain = new URL(formattedUrl).hostname;
        if (!title) setTitle(domain);
        if (!iconUrl) setIconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
        setScrapeSuccess(true);
      } catch (e) {
        setErrorMsg('无法自动抓取网页元数据，请手动输入');
      }
    } finally {
      setIsScraping(false);
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

  const modalBg = isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100';
  const headerBg = isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/80 border-slate-800';
  const inputBg = isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500' : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-400';
  const labelColor = isLight ? 'text-slate-700' : 'text-slate-300';
  const footerBg = isLight ? 'border-slate-200' : 'border-slate-800';
  const cancelBtnClass = isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              ⚡
            </div>
            <h3 className="font-bold text-base">
              {initialData ? '编辑书签' : '添加新书签'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* URL Input with Scrape Button */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold flex items-center justify-between ${labelColor}`}>
              <span>网址 (URL) *</span>
              {scrapeSuccess && <span className="text-emerald-500 text-[11px] flex items-center gap-1"><Check size={12} /> 元数据已自动填充</span>}
            </label>
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
                disabled={isScraping || !url.trim()}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
                title="自动抓取网页标题、图标与摘要"
              >
                <Sparkles size={13} className={isScraping ? 'animate-spin' : ''} />
                <span>{isScraping ? '抓取中...' : '智能抓取'}</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
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

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
              所属分类 *
            </label>
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
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
              简介描述 / 备注
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
            <label className={`text-xs font-semibold ${labelColor}`}>
              Favicon 图标链接
            </label>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center p-1 shrink-0 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
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

          {/* Custom Styled Toggles: Pin to top & Private (Replacing raw HTML checkbox) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all select-none ${
                isPinned
                  ? isLight
                    ? 'bg-amber-500/15 border-amber-500 text-amber-800 shadow-xs'
                    : 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-xs'
                  : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
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
                    ? 'bg-sky-500/15 border-sky-500 text-sky-800 shadow-xs'
                    : 'bg-sky-500/15 border-sky-400 text-sky-300 shadow-xs'
                  : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
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
