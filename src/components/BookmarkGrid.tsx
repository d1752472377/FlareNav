import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Star,
  Eye,
  Edit3,
  Trash2,
  LayoutGrid,
  List,
  LayoutTemplate,
  ArrowUpDown,
  Sparkles,
  Bookmark as BookmarkIcon,
  Plus,
} from 'lucide-react';
import { Bookmark, Category, ViewLayout } from '../types';

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  categories: Category[];
  activeCategoryId: string;
  searchQuery: string;
  isAdmin: boolean;
  onEditBookmark: (bm: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onTogglePin: (bm: Bookmark) => void;
  onTrackClick: (id: string) => void;
  onOpenAddBookmark: () => void;
}

export const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  categories,
  activeCategoryId,
  searchQuery,
  isAdmin,
  onEditBookmark,
  onDeleteBookmark,
  onTogglePin,
  onTrackClick,
  onOpenAddBookmark,
}) => {
  const [layout, setLayout] = useState<ViewLayout>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'clicks' | 'alpha' | 'recent'>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  const handleCopy = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCardClick = (bm: Bookmark) => {
    onTrackClick(bm.id);
  };

  // Sorting
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (sortBy === 'clicks') {
      return (b.click_count || 0) - (a.click_count || 0);
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title, 'zh-CN');
    }
    if (sortBy === 'recent') {
      return (b.created_at || '').localeCompare(a.created_at || '');
    }
    // Default: pinned first, then sort_order
    if (b.is_pinned !== a.is_pinned) return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
    return a.sort_order - b.sort_order;
  });

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const getActiveTitle = () => {
    if (searchQuery) return `搜索 "${searchQuery}" 的结果 (${bookmarks.length})`;
    if (activeCategoryId === 'all') return '全部书签';
    if (activeCategoryId === 'pinned') return '置顶推荐';
    if (activeCategoryId === 'popular') return '最常访问';
    const cat = categories.find((c) => c.id === activeCategoryId);
    return cat ? cat.name : '全部书签';
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>{getActiveTitle()}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {bookmarks.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <ArrowUpDown size={13} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="default" className="bg-slate-900">默认排序</option>
              <option value="clicks" className="bg-slate-900">按访问量 🔥</option>
              <option value="recent" className="bg-slate-900">最新收录 🕒</option>
              <option value="alpha" className="bg-slate-900">字母排序 A-Z</option>
            </select>
          </div>

          {/* Layout Switcher */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setLayout('bento')}
              className={`p-1.5 rounded-lg transition ${
                layout === 'bento' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bento 磁贴布局"
            >
              <LayoutTemplate size={14} />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition ${
                layout === 'grid' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="标准卡片网格"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setLayout('compact')}
              className={`p-1.5 rounded-lg transition ${
                layout === 'compact' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="紧凑列表模式"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarks Display Container */}
      {sortedBookmarks.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookmarkIcon size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-200">没有找到相关书签</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {searchQuery ? '换个关键词搜索试试，或切换到 Google / Bing 等引擎检索。' : '当前分类下暂无书签，您可以点击下方按钮添加第一个网站。'}
          </p>
          {isAdmin && (
            <button
              onClick={onOpenAddBookmark}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
            >
              <Plus size={15} />
              <span>添加书签</span>
            </button>
          )}
        </div>
      ) : layout === 'compact' ? (
        /* Compact List Mode */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden backdrop-blur-md">
          {sortedBookmarks.map((bm) => {
            const cat = getCategory(bm.category_id);
            return (
              <div
                key={bm.id}
                className="group flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition cursor-pointer"
                onClick={() => {
                  handleCardClick(bm);
                  window.open(bm.url, '_blank');
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 p-1">
                    <img
                      src={bm.icon_url || `https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=64`}
                      alt={bm.title}
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=64`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200 group-hover:text-amber-400 transition truncate">
                        {bm.title}
                      </span>
                      {bm.is_pinned ? (
                        <span className="text-[10px] text-amber-400 flex items-center">⭐</span>
                      ) : null}
                      {cat && (
                        <span
                          className="text-[10px] px-1.5 py-0.2 rounded border hidden sm:inline"
                          style={{
                            borderColor: `${cat.color}40`,
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>
                    {bm.description && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{bm.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                    {getDomain(bm.url)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Eye size={12} /> {bm.click_count || 0}
                  </span>
                  <button
                    onClick={(e) => handleCopy(e, bm.url, bm.id)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded transition"
                    title="复制链接"
                  >
                    {copiedId === bm.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                      <button
                        onClick={() => onTogglePin(bm)}
                        className={`p-1 rounded transition ${bm.is_pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                        title={bm.is_pinned ? '取消置顶' : '置顶'}
                      >
                        <Star size={13} />
                      </button>
                      <button
                        onClick={() => onEditBookmark(bm)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded transition"
                        title="编辑书签"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除书签 "${bm.title}" 吗？`)) {
                            onDeleteBookmark(bm.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                        title="删除书签"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard Grid & Bento Mode */
        <div className={`grid gap-3.5 ${
          layout === 'bento'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {sortedBookmarks.map((bm, index) => {
            const cat = getCategory(bm.category_id);
            const isBentoHero = layout === 'bento' && bm.is_pinned && index < 2;

            return (
              <div
                key={bm.id}
                onClick={() => {
                  handleCardClick(bm);
                  window.open(bm.url, '_blank');
                }}
                className={`group relative bg-slate-900/70 hover:bg-slate-800/80 border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between backdrop-blur-md shadow-lg shadow-slate-950/20 hover:shadow-xl hover:-translate-y-0.5 ${
                  bm.is_pinned
                    ? 'border-amber-500/30 hover:border-amber-400/50 bg-gradient-to-br from-slate-900/90 to-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                } ${isBentoHero ? 'sm:col-span-2 sm:p-5' : ''}`}
              >
                {/* Card Top: Favicon, Category Tag & Actions */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-inner group-hover:scale-105 transition shrink-0">
                        <img
                          src={bm.icon_url || `https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=128`}
                          alt={bm.title}
                          className="w-full h-full object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=128`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono text-slate-400 truncate block">
                          {getDomain(bm.url)}
                        </span>
                        {cat && (
                          <span
                            className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border mt-0.5"
                            style={{
                              borderColor: `${cat.color}40`,
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {bm.is_pinned ? (
                        <span className="p-1 text-amber-400 rounded-md bg-amber-400/10 border border-amber-400/20" title="置顶推荐">
                          <Star size={12} className="fill-amber-400" />
                        </span>
                      ) : null}

                      <button
                        onClick={(e) => handleCopy(e, bm.url, bm.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                        title="复制链接"
                      >
                        {copiedId === bm.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => onEditBookmark(bm)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                            title="编辑"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`确定要删除书签 "${bm.title}" 吗？`)) {
                                onDeleteBookmark(bm.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                            title="删除"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition line-clamp-1 mb-1">
                    {bm.title}
                  </h3>

                  <p className={`text-xs text-slate-400 leading-relaxed ${isBentoHero ? 'line-clamp-3' : 'line-clamp-2'}`}>
                    {bm.description || '点击即可直达该网站，支持快捷访问与自动点击统计。'}
                  </p>
                </div>

                {/* Card Footer: Clicks & External link indicator */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-3 mt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye size={12} className="text-slate-500" />
                    <span>{bm.click_count || 0} 次访问</span>
                  </span>

                  <span className="flex items-center gap-1 text-amber-400/80 group-hover:text-amber-400 transition font-sans font-semibold">
                    <span>直达</span>
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
