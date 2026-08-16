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
  { id: 'internal', name: '站内书签', icon: '⚡', placeholder: '搜索站内书签 (快捷键 /)', urlTemplate: '' },
  { id: 'ai', name: 'AI 语义检索', icon: '🤖', placeholder: '自然语言 AI 意图检索 (如: 写代码的平台)...', urlTemplate: '' },
  { id: 'google', name: 'Google', icon: '🔍', placeholder: '按回车或点击搜索前往 Google...', urlTemplate: 'https://www.google.com/search?q=' },
  { id: 'baidu', name: '百度', icon: '🇨🇳', placeholder: '按回车或点击搜索前往百度...', urlTemplate: 'https://www.baidu.com/s?wd=' },
  { id: 'github', name: 'GitHub', icon: '🐱', placeholder: '在 GitHub 检索开源项目...', urlTemplate: 'https://github.com/search?q=' },
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

  const isLight = theme === 'light';

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

  const headerBgClass = isLight
    ? 'bg-white/80 border-slate-200 shadow-xs'
    : 'bg-slate-950/80 border-slate-800/80';

  const engineBtnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
    : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700';

  const searchInputClass = isLight
    ? isSearchFocused
      ? 'bg-white border-amber-500 text-slate-900 placeholder:text-slate-400'
      : 'bg-slate-100/90 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:bg-slate-100'
    : isSearchFocused
      ? 'bg-slate-800 border-amber-500/50 text-slate-100 placeholder:text-slate-500'
      : 'bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 hover:bg-slate-800/80';

  const dropdownMenuBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-2xl divide-slate-100'
    : 'bg-slate-900/95 border-slate-700/80 text-slate-200 shadow-2xl divide-slate-800/80';

  const extensionBtnClass = isLight
    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300'
    : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30';

  const toolsBtnClass = isLight
    ? toolsMenuOpen
      ? 'bg-slate-100 text-amber-600 border-amber-400'
      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
    : toolsMenuOpen
      ? 'bg-slate-800 text-amber-400 border-amber-500/30'
      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800';

  const authBtnClass = isLight
    ? 'text-slate-700 hover:bg-slate-100 border-slate-200 bg-white'
    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800 bg-transparent';

  return (
    <header className={`w-full sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${headerBgClass}`}>
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
                <span className={`font-extrabold text-base sm:text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  Flare<span className="text-amber-500">Nav</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  D1
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] leading-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cloudflare SQLite 个人导航</p>
            </div>
          </div>

          {/* 2. Center: Sleek Unified Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className={`flex items-center h-9 sm:h-10 rounded-xl border transition-all ${
                isLight
                  ? isSearchFocused
                    ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/10'
                    : 'bg-slate-100/90 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  : isSearchFocused
                    ? 'bg-slate-900 border-amber-500/60 shadow-lg ring-2 ring-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}>
                {/* Engine Selector Dropdown Button (Strictly flush) */}
                <div className="relative h-full shrink-0 flex items-center" ref={engineMenuRef}>
                  <button
                    type="button"
                    onClick={() => setEngineMenuOpen(!engineMenuOpen)}
                    className={`h-full flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 text-xs font-semibold rounded-l-[11px] border-r transition ${
                      isLight
                        ? 'bg-slate-200/50 hover:bg-slate-200 text-slate-700 border-slate-200'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-800'
                    }`}
                    title="切换搜索引擎"
                  >
                    <span className="text-sm leading-none">{selectedEngine.icon}</span>
                    <span className="hidden md:inline leading-none">{selectedEngine.name}</span>
                    <ChevronDown size={11} className={isLight ? 'text-slate-400' : 'text-slate-400'} />
                  </button>

                  {engineMenuOpen && (
                    <div className={`absolute left-0 top-full mt-1.5 w-44 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                      <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b ${isLight ? 'text-slate-400 border-slate-100' : 'text-slate-400 border-slate-800'}`}>
                        选择检索模式
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
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition ${
                            selectedEngine.id === engine.id
                              ? isLight ? 'bg-amber-50 text-amber-700 font-semibold' : 'bg-amber-500/15 text-amber-300 font-medium'
                              : isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                          }`}
                        >
                          <span className="text-sm">{engine.icon}</span>
                          <span className="flex-1">{engine.name}</span>
                          {engine.urlTemplate && (
                            <ExternalLink size={11} className="opacity-40" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Search Input */}
                <div className="relative flex-1 h-full min-w-0 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={selectedEngine.placeholder}
                    className={`w-full h-full px-2.5 sm:px-3 text-xs sm:text-sm bg-transparent focus:outline-none transition ${
                      isLight
                        ? 'text-slate-900 placeholder:text-slate-400'
                        : 'text-slate-100 placeholder:text-slate-400'
                    }`}
                  />
                  
                  {/* Keyboard hotkey hint or clear button */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSearchChange('');
                          inputRef.current?.focus();
                        }}
                        className={`p-1 rounded-md transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                      >
                        <X size={13} />
                      </button>
                    ) : (
                      <kbd className={`hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded ${isLight ? 'text-slate-400 bg-slate-200/80' : 'text-slate-400 bg-slate-800'}`}>
                        /
                      </kbd>
                    )}
                  </div>
                </div>

                {/* Search Submit Button */}
                <button
                  type="submit"
                  className="h-full px-3 sm:px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-r-[11px] text-xs transition flex items-center gap-1 shrink-0"
                  title={selectedEngine.id === 'internal' ? '实时站内检索' : '前往检索'}
                >
                  <Search size={13} className="stroke-[2.5]" />
                  <span className="hidden sm:inline">搜索</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Right: Clean Action Hub (Uncluttered) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Chrome Extension Button (Primary) */}
            <button
              onClick={onOpenExtensionGuide}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${extensionBtnClass}`}
              title="浏览器快捷收藏扩展"
            >
              <Chrome size={14} />
              <span className="hidden sm:inline">插件</span>
            </button>

            {/* Add Bookmark Button (Visible when admin) */}
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
                className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1 ${toolsBtnClass}`}
                title="更多工具与系统设置"
              >
                <Settings size={15} />
                <ChevronDown size={11} className={`hidden sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>

              {toolsMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 border ${dropdownMenuBg}`}>
                  {/* Tools list */}
                  <div className="space-y-0.5 pb-2">
                    <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                      部署与安全
                    </div>
                    
                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenDeployGuide();
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-xl transition ${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-sky-600' : 'text-slate-200 hover:bg-slate-800/80 hover:text-sky-300'}`}
                    >
                      <Cloud size={15} className="text-sky-500" />
                      <div>
                        <div className="font-semibold">Cloudflare 部署指南</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Pages + D1 (SQLite) 架构</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenZeroTrustGuide();
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-xl transition ${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600' : 'text-slate-200 hover:bg-slate-800/80 hover:text-emerald-300'}`}
                    >
                      <ShieldCheck size={15} className="text-emerald-500" />
                      <div>
                        <div className="font-semibold">Cloudflare 零信任 (Access)</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>免密 OTP 邮箱验证与防护</div>
                      </div>
                    </button>

                    <a
                      href="/api/download-project-zip"
                      download="flarenav-source-code.zip"
                      onClick={() => setToolsMenuOpen(false)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-xl transition text-decoration-none ${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-amber-600' : 'text-slate-200 hover:bg-slate-800/80 hover:text-amber-300'}`}
                    >
                      <Download size={15} className="text-amber-500" />
                      <div>
                        <div className="font-semibold">下载完整项目源码 (.zip)</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>包含前端、API与插件源文件</div>
                      </div>
                    </a>
                  </div>

                  {/* Data & Analytics */}
                  <div className="space-y-0.5 py-2">
                    <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                      数据与分析
                    </div>

                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenStats();
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-xl transition ${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-purple-600' : 'text-slate-200 hover:bg-slate-800/80 hover:text-purple-300'}`}
                    >
                      <BarChart2 size={15} className="text-purple-500" />
                      <span>访问统计与热度看板</span>
                    </button>

                    <button
                      onClick={() => {
                        setToolsMenuOpen(false);
                        onOpenImportExport();
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-xl transition ${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-amber-600' : 'text-slate-200 hover:bg-slate-800/80 hover:text-amber-300'}`}
                    >
                      <FolderSync size={15} className="text-amber-500" />
                      <span>书签备份与导入 (JSON/HTML)</span>
                    </button>
                  </div>

                  {/* Theme Switcher in menu */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        cycleTheme();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs text-left rounded-xl transition ${isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-200 hover:bg-slate-800/80'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        {theme === 'light' ? <Sun size={15} className="text-amber-500" /> : theme === 'cyber' ? <Terminal size={15} className="text-cyan-400" /> : <Moon size={15} className="text-indigo-400" />}
                        <span>切换主题模式</span>
                      </div>
                      <span className={`text-[11px] font-mono uppercase ${isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>{theme}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin / Zero Trust Authentication Badge */}
            {isAdmin ? (
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition"
                title={zeroTrustEmail ? `Zero Trust 已认证: ${zeroTrustEmail}` : '已解锁管理模式，点击退出'}
              >
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="hidden sm:inline">{zeroTrustEmail ? 'ZT 免密' : '管理中'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl border transition ${authBtnClass}`}
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
