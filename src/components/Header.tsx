import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  Chrome,
  Cloud,
  BarChart2,
  Download,
  Moon,
  Sun,
  Terminal,
  MoreVertical,
  X,
  ChevronDown,
  Sparkles,
  Lock,
  ExternalLink,
  Settings,
  FolderSync,
} from 'lucide-react';
import { SearchEngine, ThemeMode } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAdmin: boolean;
  zeroTrustEmail?: string | null;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
  onOpenAddBookmark: () => void;
  onOpenExtensionGuide: () => void;
  onOpenDeployGuide: () => void;
  onOpenZeroTrustGuide: () => void;
  onOpenStats: () => void;
  onOpenImportExport: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'internal', name: '站内书签', icon: '⚡', placeholder: '搜索站内书签标题、网址或备注 (按 / 快捷聚焦)', urlTemplate: '' },
  { id: 'google', name: 'Google', icon: '🔍', placeholder: '使用 Google 搜索...', urlTemplate: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', icon: '🎯', placeholder: '使用 Bing 搜索...', urlTemplate: 'https://www.bing.com/search?q=' },
  { id: 'github', name: 'GitHub', icon: '🐱', placeholder: '在 GitHub 检索仓库与开源项目...', urlTemplate: 'https://github.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', placeholder: '使用 DuckDuckGo 隐私搜索...', urlTemplate: 'https://duckduckgo.com/?q=' },
  { id: 'baidu', name: '百度', icon: '🇨🇳', placeholder: '在百度中搜索...', urlTemplate: 'https://www.baidu.com/s?wd=' },
  { id: 'bilibili', name: 'B站', icon: '📺', placeholder: '在 B站 搜索视频与教程...', urlTemplate: 'https://search.bilibili.com/all?keyword=' },
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isAdmin,
  zeroTrustEmail,
  onOpenAdminAuth,
  onLogoutAdmin,
  onOpenAddBookmark,
  onOpenExtensionGuide,
  onOpenDeployGuide,
  onOpenZeroTrustGuide,
  onOpenStats,
  onOpenImportExport,
  theme,
  onThemeChange,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const engineMenuRef = useRef<HTMLDivElement>(null);

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setToolsMenuOpen(false);
      }
      if (engineMenuRef.current && !engineMenuRef.current.contains(e.target as Node)) {
        setEngineMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <header className="w-full sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors duration-200">
      <div className="w-full max-w-7xl 2xl:max-w-[1700px] 3xl:max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          
          {/* 1. Left: Brand & Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            onClick={() => onSearchChange('')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-amber-400 font-black text-base sm:text-lg tracking-tighter">⚡</span>
              </div>
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-100 tracking-tight">
                  Flare<span className="text-amber-400">Nav</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  D1
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-none">Cloudflare SQLite 个人导航</p>
            </div>
          </div>

          {/* 2. Center: Sleek Unified Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              {/* Engine Selector Pill */}
              <div className="relative shrink-0" ref={engineMenuRef}>
                <button
                  type="button"
                  onClick={() => setEngineMenuOpen(!engineMenuOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 rounded-l-xl border-y border-l border-slate-700 transition"
                  title="切换搜索引擎"
                >
                  <span className="text-sm">{selectedEngine.icon}</span>
                  <span className="hidden md:inline">{selectedEngine.name}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {engineMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
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
                )}
              </div>

              {/* Main Search Input */}
              <div className="relative flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={selectedEngine.placeholder}
                  className={`w-full bg-slate-800/60 border-y border-slate-700 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition ${
                    isSearchFocused ? 'bg-slate-800 border-amber-500/50' : 'hover:bg-slate-800/80'
                  }`}
                />
                
                {/* Keyboard hotkey hint or clear button */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSearchChange('');
                        inputRef.current?.focus();
                      }}
                      className="text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded shadow-sm">
                      /
                    </kbd>
                  )}
                </div>
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="px-3 sm:px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-r-xl border-y border-r border-amber-400 text-xs transition flex items-center gap-1 shrink-0 shadow-md shadow-amber-500/10"
              >
                <Search size={14} className="stroke-[2.5]" />
                <span className="hidden sm:inline">搜索</span>
              </button>
            </form>
          </div>

          {/* 3. Right: Clean Action Hub (Uncluttered) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Chrome Extension Button (Primary) */}
            <button
              onClick={onOpenExtensionGuide}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition"
              title="浏览器快捷收藏扩展"
            >
              <Chrome size={14} />
              <span className="hidden sm:inline">插件</span>
            </button>

            {/* Add Bookmark Button (Visible when admin or on large screens) */}
            {isAdmin && (
              <button
                onClick={onOpenAddBookmark}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition"
                title="添加新书签"
              >
                <Plus size={14} className="stroke-[3]" />
                <span className="hidden md:inline">添加</span>
              </button>
            )}

            {/* Unified Tools & Settings Dropdown */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1 ${
                  toolsMenuOpen
                    ? 'bg-slate-800 text-amber-400 border-amber-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="更多工具与系统设置"
              >
                <Settings size={15} />
                <ChevronDown size={11} className="hidden sm:inline text-slate-400" />
              </button>

              {toolsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-800/80">
                  {/* Tools list */}
                  <div className="space-y-0.5 pb-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      部署与安全
                    </div>
                    
                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenDeployGuide();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left text-slate-200 hover:bg-slate-800/80 hover:text-sky-300 rounded-xl transition"
                    >
                      <Cloud size={15} className="text-sky-400" />
                      <div>
                        <div className="font-semibold">Cloudflare 部署指南</div>
                        <div className="text-[10px] text-slate-400">Pages + D1 (SQLite) 架构</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenZeroTrustGuide();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left text-slate-200 hover:bg-slate-800/80 hover:text-emerald-300 rounded-xl transition"
                    >
                      <ShieldCheck size={15} className="text-emerald-400" />
                      <div>
                        <div className="font-semibold">Cloudflare 零信任 (Access)</div>
                        <div className="text-[10px] text-slate-400">免密 OTP 邮箱验证与防护</div>
                      </div>
                    </button>

                    <a
                      href="/api/download-project-zip"
                      download="flarenav-source-code.zip"
                      onClick={() => setToolsMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left text-slate-200 hover:bg-slate-800/80 hover:text-amber-300 rounded-xl transition text-decoration-none"
                    >
                      <Download size={15} className="text-amber-400" />
                      <div>
                        <div className="font-semibold">下载完整项目源码 (.zip)</div>
                        <div className="text-[10px] text-slate-400">包含前端、API与插件源文件</div>
                      </div>
                    </a>
                  </div>

                  {/* Data & Analytics */}
                  <div className="space-y-0.5 py-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      数据与分析
                    </div>

                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenStats();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left text-slate-200 hover:bg-slate-800/80 hover:text-purple-300 rounded-xl transition"
                    >
                      <BarChart2 size={15} className="text-purple-400" />
                      <span>访问统计与热度看板</span>
                    </button>

                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenImportExport();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left text-slate-200 hover:bg-slate-800/80 hover:text-amber-300 rounded-xl transition"
                    >
                      <FolderSync size={15} className="text-amber-400" />
                      <span>书签备份与导入 (JSON/HTML)</span>
                    </button>
                  </div>

                  {/* Theme Switcher in menu */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        cycleTheme();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-left text-slate-200 hover:bg-slate-800/80 rounded-xl transition"
                    >
                      <div className="flex items-center gap-2.5">
                        {theme === 'light' ? <Sun size={15} className="text-amber-400" /> : theme === 'cyber' ? <Terminal size={15} className="text-cyan-400" /> : <Moon size={15} className="text-indigo-400" />}
                        <span>切换主题模式</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase">{theme}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin / Zero Trust Authentication Badge */}
            {isAdmin ? (
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition"
                title={zeroTrustEmail ? `Zero Trust 已认证: ${zeroTrustEmail}` : '已解锁管理模式，点击退出'}
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">{zeroTrustEmail ? 'ZT 免密' : '管理中'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition"
                title="管理员身份验证"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">登录</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
