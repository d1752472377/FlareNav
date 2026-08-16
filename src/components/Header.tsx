import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Plus,
  Shield,
  ShieldCheck,
  Chrome,
  Cloud,
  BarChart2,
  Download,
  Moon,
  Sun,
  Laptop,
  Terminal,
  ExternalLink,
  X,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { SearchEngine, ThemeMode } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAdmin: boolean;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
  onOpenAddBookmark: () => void;
  onOpenExtensionGuide: () => void;
  onOpenDeployGuide: () => void;
  onOpenStats: () => void;
  onOpenImportExport: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'internal', name: '站内书签', icon: '⚡', placeholder: '搜索站内书签标题、网址或描述 (按 / 聚焦)', urlTemplate: '' },
  { id: 'google', name: 'Google', icon: '🔍', placeholder: '使用 Google 搜索...', urlTemplate: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', icon: '🎯', placeholder: '使用 Bing 搜索...', urlTemplate: 'https://www.bing.com/search?q=' },
  { id: 'github', name: 'GitHub', icon: '🐱', placeholder: '在 GitHub 检索仓库或代码...', urlTemplate: 'https://github.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', placeholder: '使用 DuckDuckGo 隐私搜索...', urlTemplate: 'https://duckduckgo.com/?q=' },
  { id: 'baidu', name: '百度', icon: '🇨🇳', placeholder: '在百度中搜索...', urlTemplate: 'https://www.baidu.com/s?wd=' },
  { id: 'bilibili', name: 'Bilibili', icon: '📺', placeholder: '在 B站 搜索视频与教程...', urlTemplate: 'https://search.bilibili.com/all?keyword=' },
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isAdmin,
  onOpenAdminAuth,
  onLogoutAdmin,
  onOpenAddBookmark,
  onOpenExtensionGuide,
  onOpenDeployGuide,
  onOpenStats,
  onOpenImportExport,
  theme,
  onThemeChange,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey '/' or 'Ctrl+K' / 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (selectedEngine.id !== 'internal' && selectedEngine.urlTemplate) {
      window.open(selectedEngine.urlTemplate + encodeURIComponent(searchQuery.trim()), '_blank');
    }
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['dark', 'light', 'oled', 'cyber'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    onThemeChange(themes[nextIdx]);
  };

  return (
    <header className="w-full sticky top-0 z-30 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onSearchChange('')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-amber-400 font-black text-lg tracking-tighter">⚡</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-100 tracking-tight">Flare<span className="text-amber-400">Nav</span></span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    CF D1
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none">Cloudflare SQLite 个人导航</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 md:hidden">
              <a
                href="/api/download-project-zip"
                download="flarenav-source-code.zip"
                className="p-2 text-amber-400 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                title="下载全部代码 ZIP"
              >
                <Download size={18} />
              </a>
              <button
                onClick={onOpenExtensionGuide}
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition"
                title="Chrome 插件"
              >
                <Chrome size={18} />
              </button>
              <button
                onClick={isAdmin ? onOpenAddBookmark : onOpenAdminAuth}
                className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition"
              >
                {isAdmin ? <Plus size={18} /> : <Shield size={18} />}
              </button>
            </div>
          </div>

          {/* Search Engine Bar */}
          <div className="flex-1 max-w-2xl mx-auto w-full">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              {/* Engine Selector Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEngineMenuOpen(!engineMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 rounded-l-xl border-y border-l border-slate-700 transition"
                >
                  <span className="text-sm">{selectedEngine.icon}</span>
                  <span className="hidden sm:inline">{selectedEngine.name}</span>
                </button>

                {engineMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setEngineMenuOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        切换搜索引擎
                      </div>
                      {SEARCH_ENGINES.map((engine) => (
                        <button
                          key={engine.id}
                          type="button"
                          onClick={() => {
                            setSelectedEngine(engine);
                            setEngineMenuOpen(false);
                            inputRef.current?.focus();
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition ${
                            selectedEngine.id === engine.id
                              ? 'bg-amber-500/15 text-amber-300 font-medium'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                          }`}
                        >
                          <span className="text-base">{engine.icon}</span>
                          <span>{engine.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={selectedEngine.placeholder}
                  className="w-full bg-slate-800/60 border-y border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-slate-800 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Submit / Trigger Button */}
              <button
                type="submit"
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-r-xl border-y border-r border-amber-400 text-xs transition flex items-center gap-1 shadow-md shadow-amber-500/10"
              >
                <Search size={14} className="stroke-[2.5]" />
                <span className="hidden sm:inline">检索</span>
              </button>
            </form>

            {/* Quick Engine Switcher Pills below search */}
            <div className="hidden sm:flex items-center justify-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
              {SEARCH_ENGINES.map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => setSelectedEngine(engine)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition flex items-center gap-1 select-none ${
                    selectedEngine.id === engine.id
                      ? 'bg-amber-400/15 text-amber-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{engine.icon}</span>
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Chrome Extension Button */}
            <button
              onClick={onOpenExtensionGuide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition"
              title="Chrome 浏览器收藏插件"
            >
              <Chrome size={14} />
              <span>Chrome 插件</span>
            </button>

            {/* Cloudflare D1 Deploy Button */}
            <button
              onClick={onOpenDeployGuide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition"
              title="Cloudflare Pages + D1 部署说明"
            >
              <Cloud size={14} />
              <span>CF 部署</span>
            </button>

            {/* Direct Source Code ZIP Download Button */}
            <a
              href="/api/download-project-zip"
              download="flarenav-source-code.zip"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition cursor-pointer text-decoration-none"
              title="一键下载完整项目源码包 (ZIP)"
            >
              <Download size={14} />
              <span>下载代码</span>
            </a>

            {/* Stats Button */}
            <button
              onClick={onOpenStats}
              className="p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              title="访问统计看板"
            >
              <BarChart2 size={16} />
            </button>

            {/* Import / Export */}
            <button
              onClick={onOpenImportExport}
              className="p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              title="导入 / 导出书签"
            >
              <Download size={16} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              title={`当前主题: ${theme} (点击切换)`}
            >
              {theme === 'light' ? <Sun size={16} /> : theme === 'cyber' ? <Terminal size={16} /> : <Moon size={16} />}
            </button>

            <div className="h-4 w-[1px] bg-slate-800 mx-1" />

            {/* Add Bookmark (if admin) */}
            {isAdmin && (
              <button
                onClick={onOpenAddBookmark}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>添加书签</span>
              </button>
            )}

            {/* Admin Auth Toggle */}
            {isAdmin ? (
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition"
                title="已解锁管理权限，点击退出"
              >
                <ShieldCheck size={14} />
                <span>管理模式</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                title="管理员身份验证"
              >
                <Shield size={14} />
                <span>登录</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
