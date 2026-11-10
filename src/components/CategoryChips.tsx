import React from 'react';
import { Layers, Star, Flame, Plus, Edit2, Trash2 } from 'lucide-react';
import { Category, Bookmark, ThemeMode } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface CategoryChipsProps {
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

/**
 * 横向分类标签栏：替代原有左侧边栏，单行排列，超出宽度横向滚动。
 */
export const CategoryChips: React.FC<CategoryChipsProps> = ({
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
  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  const chipBase =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap shrink-0';
  const chipActive = 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20';
  const chipInactive = isLight
    ? 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-slate-900'
    : 'bg-slate-900/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-slate-100';

  const countClass = (active: boolean) =>
    active
      ? 'bg-slate-950/20 text-slate-950'
      : isLight
        ? 'bg-slate-100 text-slate-500'
        : 'bg-slate-800 text-slate-400';

  const countBadge = (active: boolean, value: number) => (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full leading-none ${countClass(active)}`}>
      {value}
    </span>
  );

  const iconMuted = isLight ? 'text-amber-600' : 'text-amber-400';

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* 全部收录 */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`${chipBase} ${activeCategoryId === 'all' ? chipActive : chipInactive}`}
          title="全部收录"
        >
          <Layers size={14} className={activeCategoryId === 'all' ? 'text-slate-950' : iconMuted} />
          <span>全部收录</span>
          {countBadge(activeCategoryId === 'all', totalBookmarks)}
        </button>

        {/* 置顶推荐 */}
        <button
          type="button"
          onClick={() => onSelectCategory('pinned')}
          className={`${chipBase} ${activeCategoryId === 'pinned' ? chipActive : chipInactive}`}
          title="置顶推荐"
        >
          <Star
            size={14}
            className={
              activeCategoryId === 'pinned'
                ? 'text-slate-950'
                : isLight
                  ? 'text-amber-500'
                  : 'text-yellow-400'
            }
          />
          <span>置顶推荐</span>
          {countBadge(activeCategoryId === 'pinned', pinnedCount)}
        </button>

        {/* 最常访问 */}
        <button
          type="button"
          onClick={() => onSelectCategory('popular')}
          className={`${chipBase} ${activeCategoryId === 'popular' ? chipActive : chipInactive}`}
          title="最常访问"
        >
          <Flame
            size={14}
            className={
              activeCategoryId === 'popular'
                ? 'text-slate-950'
                : isLight
                  ? 'text-orange-600'
                  : 'text-orange-400'
            }
          />
          <span>最常访问</span>
          {countBadge(activeCategoryId === 'popular', popularCount)}
        </button>

        {/* 分类 */}
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          const count = bookmarks.filter((b) => b.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`${chipBase} ${isActive ? chipActive : chipInactive}`}
              title={cat.name}
            >
              <DynamicIcon name={cat.icon} size={14} color={isActive ? '#020617' : cat.color || '#3b82f6'} />
              <span>{cat.name}</span>
              {countBadge(isActive, count)}
            </button>
          );
        })}

        {/* 管理员：分类维护 */}
        {isAdmin && (
          <div
            className={`flex items-center gap-1 pl-2 ml-0.5 shrink-0 border-l ${isLight ? 'border-slate-200' : 'border-slate-800'}`}
          >
            <button
              type="button"
              onClick={onAddCategory}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
                isLight
                  ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="新建分类"
            >
              <Plus size={13} className="stroke-[3]" />
              <span>新建分类</span>
            </button>

            {activeCategory && (
              <>
                <button
                  type="button"
                  onClick={() => onEditCategory(activeCategory)}
                  className={`p-1.5 rounded-full border transition ${
                    isLight
                      ? 'text-slate-500 border-slate-200 hover:text-amber-600 hover:bg-slate-50'
                      : 'text-slate-400 border-slate-800 hover:text-amber-400 hover:bg-slate-800/80'
                  }`}
                  title={`编辑分类「${activeCategory.name}」`}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`确定要删除分类 "${activeCategory.name}" 及其下的所有书签吗？`)) {
                      onDeleteCategory(activeCategory.id);
                    }
                  }}
                  className={`p-1.5 rounded-full border transition ${
                    isLight
                      ? 'text-slate-500 border-slate-200 hover:text-red-500 hover:bg-red-50'
                      : 'text-slate-400 border-slate-800 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  title={`删除分类「${activeCategory.name}」`}
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        )}

        {/* 无分类时的占位提示 */}
        {categories.length === 0 && (
          <span className={`text-xs shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>暂无分类</span>
        )}
      </div>
    </div>
  );
};
