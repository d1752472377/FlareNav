import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Category, ThemeMode } from '../types';
import { DynamicIcon, AVAILABLE_ICONS } from './DynamicIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
  initialData?: Category | null;
  theme?: ThemeMode;
}

const COLOR_SWATCHES = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#84cc16', // Lime
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  theme = 'dark',
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('#3b82f6');
  const [sortOrder, setSortOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLight = theme === 'light';

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon || 'Folder');
      setColor(initialData.color || '#3b82f6');
      setSortOrder(initialData.sort_order || 1);
    } else {
      setName('');
      setIcon('Folder');
      setColor('#3b82f6');
      setSortOrder(1);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('请输入分类名称');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        name: name.trim(),
        icon,
        color,
        sort_order: Number(sortOrder) || 1,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '保存分类失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';

  const headerBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-900/80 border-slate-800';

  const inputBg = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500'
    : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-400';

  const labelColor = isLight ? 'text-slate-700' : 'text-slate-300';

  const iconGridBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-800/40 border-slate-700/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-md border rounded-2xl overflow-hidden flex flex-col transition-colors ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <DynamicIcon name={icon} size={15} />
            </div>
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {initialData ? '编辑分类' : '新建分类'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
              分类名称 *
            </label>
            <input
              type="text"
              required
              placeholder="例如：AI 工具 / 开发框架 / 常用社区"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition ${inputBg}`}
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
              分类主题色
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-amber-500 scale-110 shadow-xs' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
              选择分类图标
            </label>
            <div className={`grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border rounded-xl ${iconGridBg}`}>
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-lg flex items-center justify-center transition ${
                    icon === iconName
                      ? isLight
                        ? 'bg-amber-100 text-amber-700 border border-amber-300 font-bold'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={iconName}
                >
                  <DynamicIcon name={iconName} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${labelColor}`}>
              排序权重 (数字越小越靠前)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition ${inputBg}`}
            />
          </div>

          {/* Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : initialData ? '更新分类' : '创建分类'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
