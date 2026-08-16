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
import { Bookmark, Category, ViewLayout, ThemeMode } from '../types';

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
  theme?: ThemeMode;
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
  theme = 'dark',
}) => {
  const [layout, setLayout] = useState<ViewLayout>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'clicks' | 'alpha' | 'recent'>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isLight = theme === 'light';

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

  const toolbarBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-2xs backdrop-blur-md'
    : 'bg-slate-900/60 border-slate-800 text-slate-100 backdrop-blur-md';

  const cardBaseBg = isLight
    ? 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md text-slate-800'
    : 'bg-slate-900/80 border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-850 text-slate-100';

  const selectControlBg = isLight
    ? 'bg-slate-100 border-slate-200 text-slate-700'
    : 'bg-slate-800/80 border-slate-700 text-slate-300';

  const cardTitleColor = isLight ? 'text-slate-900 group-hover:text-amber-600' : 'text-slate-100 group-hover:text-amber-400';
  const cardDescColor = isLight ? 'text-slate-600' : 'text-slate-400';
  const cardDomainColor = isLight ? 'text-slate-400' : 'text-slate-500';
  const iconContainerBg = isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700/60';

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-2xl px-4 py-3 transition-colors ${toolbarBg}`}>
        <div className="flex items-center gap-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <span>{getActiveTitle()}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-800 text-amber-400 border-slate-700'}`}>
              {bookmarks.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Sort Selector */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${selectControlBg}`}>
            <ArrowUpDown size={13} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs outline-none cursor-pointer"
            >
              <option value="default" className={isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'}>默认排序</option>
              <option value="clicks" className={isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'}>按访问量 🔥</option>
              <option value="recent" className={isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'}>最新收录 🕒</option>
              <option value="alpha" className={isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'}>字母排序 A-Z</option>
            </select>
          </div>

          {/* Layout Switcher */}
          <div className={`flex items-center p-0.5 rounded-xl border ${selectControlBg}`}>
            <button
              onClick={() => setLayout('bento')}
              className={`p-1.5 rounded-lg transition ${
                layout === 'bento'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bento 磁贴布局"
            >
              <LayoutTemplate size={14} />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition ${
                layout === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="标准卡片网格"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setLayout('compact')}
              className={`p-1.5 rounded-lg transition ${
                layout === 'compact'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="紧凑列表模式"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {sortedBookmarks.length > 0 ? (
        <div
          className={`grid gap-3.5 sm:gap-4 transition-all duration-200 ${
            layout === 'compact'
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              : layout === 'bento'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6'
          }`}
        >
          {sortedBookmarks.map((bm, index) => {
            const cat = getCategory(bm.category_id);
            const isPinned = Boolean(bm.is_pinned);
            const isBentoHero = layout === 'bento' && (index === 0 || (isPinned && index < 3));

            if (layout === 'compact') {
              return (
                <div
                  key={bm.id}
                  onClick={() => handleCardClick(bm)}
                  className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${cardBaseBg}`}
                >
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-3 min-w-0"
                  >
                    <div className={`relative shrink-0 w-8 h-8 rounded-lg p-1 flex items-center justify-center border ${iconContainerBg}`}>
                      <img
                        src={bm.icon_url || `https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=64`}
                        alt={bm.title}
                        className="w-5 h-5 object-contain rounded"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {isPinned && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center shadow-xs">
                          <Star size={8} className="text-slate-950 fill-slate-950" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate transition-colors ${cardTitleColor}`}>
                          {bm.title}
                        </span>
                        {bm.is_private === 1 && (
                          <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                            私有
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate font-mono ${cardDomainColor}`}>
                        {getDomain(bm.url)}
                      </p>
                    </div>
                  </a>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                    <button
                      onClick={(e) => handleCopy(e, bm.url, bm.id)}
                      className={`p-1.5 rounded-lg transition ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                      title="复制网址"
                    >
                      {copiedId === bm.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(bm);
                          }}
                          className={`p-1.5 rounded-lg transition ${isPinned ? 'text-amber-500' : isLight ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-amber-400'}`}
                          title={isPinned ? '取消置顶' : '置顶'}
                        >
                          <Star size={13} className={isPinned ? 'fill-amber-500' : ''} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBookmark(bm);
                          }}
                          className={`p-1.5 rounded-lg transition ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-amber-600' : 'hover:bg-slate-800 text-slate-400 hover:text-amber-400'}`}
                          title="编辑"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定要删除书签 "${bm.title}" 吗？`)) {
                              onDeleteBookmark(bm.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition"
                          title="删除"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            // Standard and Bento Grid Card
            return (
              <div
                key={bm.id}
                onClick={() => handleCardClick(bm)}
                className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${cardBaseBg} ${
                  isBentoHero ? 'sm:col-span-2 sm:row-span-1' : ''
                } ${
                  isPinned ? (isLight ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/25' : 'border-amber-500/30 ring-1 ring-amber-500/10') : ''
                }`}
              >
                <div>
                  {/* Card Header: Icon + Category Badge + Pin Status */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl p-2 flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform ${iconContainerBg}`}>
                        <img
                          src={bm.icon_url || `https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=128`}
                          alt={bm.title}
                          className="w-6 h-6 object-contain rounded"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      {isPinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-xs">
                          <Star size={9} className="text-slate-950 fill-slate-950" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {cat && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${cat.color || '#3b82f6'}18`,
                            color: cat.color || '#3b82f6',
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                      {bm.click_count > 0 && (
                        <span className={`text-[10px] font-mono flex items-center gap-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Eye size={10} />
                          <span>{bm.click_count}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/link"
                  >
                    <div className="flex items-center gap-1">
                      <h3 className={`text-xs sm:text-sm font-bold truncate transition-colors ${cardTitleColor}`}>
                        {bm.title}
                      </h3>
                      <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 text-slate-400" />
                    </div>
                    <p className={`text-xs line-clamp-2 mt-1 min-h-[32px] leading-relaxed ${cardDescColor}`}>
                      {bm.description || '点击直接在新标签页访问此站点...'}
                    </p>
                  </a>
                </div>

                {/* Footer URL Domain & Action Toolbar */}
                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-mono ${isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                  <span className="truncate max-w-[130px]" title={bm.url}>
                    {getDomain(bm.url)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopy(e, bm.url, bm.id)}
                      className={`p-1 rounded-md transition ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                      title="复制直达链接"
                    >
                      {copiedId === bm.id ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(bm);
                          }}
                          className={`p-1 rounded-md transition ${
                            isPinned ? 'text-amber-500' : isLight ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-amber-400'
                          }`}
                          title={isPinned ? '取消置顶' : '置顶'}
                        >
                          <Star size={12} className={isPinned ? 'fill-amber-500' : ''} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBookmark(bm);
                          }}
                          className={`p-1 rounded-md transition ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-amber-600' : 'hover:bg-slate-800 text-slate-400 hover:text-amber-400'}`}
                          title="编辑书签"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定要删除书签 "${bm.title}" 吗？`)) {
                              onDeleteBookmark(bm.id);
                            }
                          }}
                          className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-md transition"
                          title="删除书签"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={`border rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 transition-colors ${toolbarBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <BookmarkIcon size={24} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>未找到匹配的书签</h3>
            <p className={`text-xs mt-1 max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {searchQuery
                ? `没有找到与 "${searchQuery}" 相关的书签，请尝试其他关键词。`
                : '当前分类下暂无书签，您可以点击右上角插件或下方按钮添加。'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onOpenAddBookmark}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>收录第一个书签</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
