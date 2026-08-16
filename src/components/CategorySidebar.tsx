import React from 'react';
import {
  Layers,
  Star,
  Flame,
  Plus,
  Edit2,
  Trash2,
  Folder,
  Tag,
  Hash,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Category, Bookmark, ThemeMode } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface CategorySidebarProps {
  categories: Category[];
  bookmarks: Bookmark[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  isAdmin: boolean;
  onAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  theme?: ThemeMode;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  bookmarks,
  activeCategoryId,
  onSelectCategory,
  isAdmin,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const totalBookmarks = bookmarks.length;
  const pinnedCount = bookmarks.filter((b) => b.is_pinned).length;
  const popularCount = bookmarks.filter((b) => b.click_count > 0).length;

  const getCategoryCount = (catId: string) => {
    return bookmarks.filter((b) => b.category_id === catId).length;
  };

  const containerBg = isLight
    ? 'bg-white/80 border-slate-200 text-slate-800 shadow-xs backdrop-blur-md'
    : 'bg-slate-900/60 border-slate-800 text-slate-100 backdrop-blur-md';

  const sectionHeaderColor = isLight ? 'text-slate-500' : 'text-slate-400';

  const itemInactiveClass = isLight
    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100';

  const countBadgeInactive = isLight
    ? 'bg-slate-100 text-slate-500 border border-slate-200'
    : 'bg-slate-800 text-slate-400';

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
      {/* Quick Virtual Views */}
      <div className={`border rounded-2xl p-2.5 transition-colors ${containerBg}`}>
        <div className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center justify-between ${sectionHeaderColor}`}>
          <span>快捷视图</span>
        </div>
        <div className="space-y-0.5 mt-1">
          {/* All Bookmarks */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeCategoryId === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : itemInactiveClass
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers size={16} className={activeCategoryId === 'all' ? 'text-slate-950' : isLight ? 'text-amber-600' : 'text-amber-400'} />
              <span>全部收录</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
              activeCategoryId === 'all' ? 'bg-slate-950/20 text-slate-950' : countBadgeInactive
            }`}>
              {totalBookmarks}
            </span>
          </button>

          {/* Pinned Bookmarks */}
          <button
            onClick={() => onSelectCategory('pinned')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeCategoryId === 'pinned'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : itemInactiveClass
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star size={16} className={activeCategoryId === 'pinned' ? 'text-slate-950' : isLight ? 'text-amber-500' : 'text-yellow-400'} />
              <span>置顶推荐</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
              activeCategoryId === 'pinned' ? 'bg-slate-950/20 text-slate-950' : countBadgeInactive
            }`}>
              {pinnedCount}
            </span>
          </button>

          {/* Most Visited Bookmarks */}
          <button
            onClick={() => onSelectCategory('popular')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeCategoryId === 'popular'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : itemInactiveClass
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Flame size={16} className={activeCategoryId === 'popular' ? 'text-slate-950' : isLight ? 'text-orange-600' : 'text-orange-400'} />
              <span>最常访问</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
              activeCategoryId === 'popular' ? 'bg-slate-950/20 text-slate-950' : countBadgeInactive
            }`}>
              {popularCount}
            </span>
          </button>
        </div>
      </div>

      {/* Category Folders */}
      <div className={`border rounded-2xl p-2.5 transition-colors ${containerBg}`}>
        <div className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center justify-between ${sectionHeaderColor}`}>
          <span>标签分类</span>
          {isAdmin && (
            <button
              onClick={onAddCategory}
              className={`flex items-center gap-1 text-[11px] font-semibold transition ${isLight ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'}`}
              title="新建分类"
            >
              <Plus size={13} className="stroke-[3]" />
              <span>新建</span>
            </button>
          )}
        </div>

        <div className="space-y-1 mt-1">
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            const count = getCategoryCount(category.id);

            return (
              <div
                key={category.id}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? isLight
                      ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs font-semibold'
                      : 'bg-slate-800 text-amber-400 border border-slate-700 shadow-xs font-semibold'
                    : isLight
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className="flex-1 flex items-center gap-2.5 text-left overflow-hidden"
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color || '#3b82f6',
                    }}
                  >
                    <DynamicIcon name={category.icon} size={13} />
                  </div>
                  <span className="truncate">{category.name}</span>
                </button>

                <div className="flex items-center gap-1">
                  {/* Admin Edit/Delete Controls */}
                  {isAdmin && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition mr-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(category);
                        }}
                        className={`p-1 transition ${isLight ? 'hover:text-amber-600 text-slate-400' : 'hover:text-amber-400 text-slate-400'}`}
                        title="编辑分类"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定要删除分类 "${category.name}" 及其下的所有书签吗？`)) {
                            onDeleteCategory(category.id);
                          }
                        }}
                        className="p-1 hover:text-red-500 text-slate-400 transition"
                        title="删除分类"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? isLight
                        ? 'bg-amber-200/60 text-amber-900 font-bold'
                        : 'bg-amber-400/20 text-amber-300 font-semibold'
                      : isLight
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-slate-800/80 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              暂无分类
            </div>
          )}
        </div>
      </div>

      {/* Cloudflare D1 Architecture Badge */}
      <div className={`hidden lg:block border rounded-2xl p-3.5 text-xs space-y-1.5 shadow-xs ${
        isLight
          ? 'bg-white/80 border-slate-200 text-slate-600'
          : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-slate-400'
      }`}>
        <div className={`flex items-center gap-1.5 font-semibold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
          <Sparkles size={14} />
          <span>Cloudflare Serverless 架构</span>
        </div>
        <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          基于 Cloudflare Pages + D1 (SQLite) 边缘数据库构建，全球高速访问，零服务器运维成本。
        </p>
      </div>
    </aside>
  );
};
