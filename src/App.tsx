import React, { useState, useEffect, useCallback } from 'react';
import {
  Category,
  Bookmark,
  ThemeMode,
} from './types';
import {
  fetchCategories,
  fetchBookmarks,
  createCategory,
  updateCategory,
  deleteCategory,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  trackBookmarkClick,
  getStoredAdminToken,
  removeStoredAdminToken,
  fetchAuthStatus,
} from './services/api';
import { Header } from './components/Header';
import { CategorySidebar } from './components/CategorySidebar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { BookmarkModal } from './components/BookmarkModal';
import { CategoryModal } from './components/CategoryModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ExtensionGuideModal } from './components/ExtensionGuideModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { ZeroTrustGuideModal } from './components/ZeroTrustGuideModal';
import { StatsModal } from './components/StatsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { DynamicIcon } from './components/DynamicIcon';
import {
  Sparkles,
  Layers,
  Star,
  Flame,
  Chrome,
  Cloud,
  ShieldCheck,
  Shield,
  FolderSync,
} from 'lucide-react';

export default function App() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [zeroTrustEmail, setZeroTrustEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [extensionGuideOpen, setExtensionGuideOpen] = useState(false);
  const [deployGuideOpen, setDeployGuideOpen] = useState(false);
  const [zeroTrustGuideOpen, setZeroTrustGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Check initial admin token & Zero Trust Status
  useEffect(() => {
    const checkAuth = async () => {
      const localToken = getStoredAdminToken();
      if (localToken) {
        setIsAdmin(true);
      }

      try {
        const authStatus = await fetchAuthStatus();
        if (authStatus.success) {
          if (authStatus.userEmail) {
            setZeroTrustEmail(authStatus.userEmail);
          }
          if (authStatus.isAdmin) {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.warn('Auth check error:', e);
      }
    };
    checkAuth();
  }, []);

  // Fetch Categories & Bookmarks
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cats, bms] = await Promise.all([fetchCategories(), fetchBookmarks()]);
      setCategories(cats);
      setBookmarks(bms);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Category CRUD
  const handleSaveCategory = async (catData: Partial<Category>) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, catData);
      showToast('✅ 分类更新成功！');
    } else {
      await createCategory(catData);
      showToast('✨ 新建分类成功！');
    }
    await loadData();
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast('🗑️ 分类已删除');
      if (activeCategoryId === id) {
        setActiveCategoryId('all');
      }
      await loadData();
    } catch (e: any) {
      showToast('删除失败: ' + (e as Error).message, 'error');
    }
  };

  // Handlers for Bookmark CRUD
  const handleSaveBookmark = async (bmData: Partial<Bookmark>) => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, bmData);
      showToast('✅ 书签更新成功！');
    } else {
      await createBookmark(bmData);
      showToast('⚡ 书签已成功收录！');
    }
    await loadData();
    setBookmarkModalOpen(false);
    setEditingBookmark(null);
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
      showToast('🗑️ 书签已删除');
      await loadData();
    } catch (e: any) {
      showToast('删除失败: ' + (e as Error).message, 'error');
    }
  };

  const handleTogglePin = async (bm: Bookmark) => {
    const newPinned = bm.is_pinned ? 0 : 1;
    try {
      await updateBookmark(bm.id, { is_pinned: newPinned });
      showToast(newPinned ? '⭐ 已置顶书签' : '已取消置顶');
      await loadData();
    } catch (e) {}
  };

  const handleTrackClick = (id: string) => {
    trackBookmarkClick(id);
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, click_count: (b.click_count || 0) + 1 } : b))
    );
  };

  const handleLogoutAdmin = () => {
    removeStoredAdminToken();
    setIsAdmin(false);
    setZeroTrustEmail(null);
    showToast('已退出管理员模式', 'info');
  };

  // Filter Bookmarks based on active category and search
  const filteredBookmarks = bookmarks.filter((bm) => {
    // Category filter
    if (activeCategoryId === 'pinned') {
      if (!bm.is_pinned) return false;
    } else if (activeCategoryId === 'popular') {
      if (!bm.click_count || bm.click_count === 0) return false;
    } else if (activeCategoryId !== 'all') {
      if (bm.category_id !== activeCategoryId) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = bm.title.toLowerCase().includes(q);
      const matchUrl = bm.url.toLowerCase().includes(q);
      const matchDesc = (bm.description || '').toLowerCase().includes(q);
      return matchTitle || matchUrl || matchDesc;
    }

    return true;
  });

  // Theme color styles
  const getThemeClass = () => {
    switch (theme) {
      case 'light':
        return 'bg-slate-100 text-slate-900';
      case 'oled':
        return 'bg-black text-white';
      case 'cyber':
        return 'bg-[#0a0f1d] text-cyan-300';
      default:
        return 'bg-[#090d16] text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${getThemeClass()}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-100 font-semibold text-xs rounded-2xl shadow-2xl flex items-center gap-2">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
        zeroTrustEmail={zeroTrustEmail}
        onOpenAdminAuth={() => setAdminAuthOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenAddBookmark={() => {
          setEditingBookmark(null);
          setBookmarkModalOpen(true);
        }}
        onOpenExtensionGuide={() => setExtensionGuideOpen(true)}
        onOpenDeployGuide={() => setDeployGuideOpen(true)}
        onOpenZeroTrustGuide={() => setZeroTrustGuideOpen(true)}
        onOpenStats={() => setStatsOpen(true)}
        onOpenImportExport={() => setImportExportOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1700px] 3xl:max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Mobile Horizontal Category Carousel Bar (Only visible on screens < lg) */}
        <div className="lg:hidden mb-4 overflow-x-auto pb-1 scrollbar-none flex items-center gap-2">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeCategoryId === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800'
            }`}
          >
            <Layers size={13} />
            <span>全部</span>
            <span className="text-[10px] opacity-80 font-mono">({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveCategoryId('pinned')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeCategoryId === 'pinned'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800'
            }`}
          >
            <Star size={13} className="text-yellow-400" />
            <span>置顶</span>
            <span className="text-[10px] opacity-80 font-mono">({bookmarks.filter(b => b.is_pinned).length})</span>
          </button>

          <button
            onClick={() => setActiveCategoryId('popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeCategoryId === 'popular'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800'
            }`}
          >
            <Flame size={13} className="text-orange-400" />
            <span>热门</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                activeCategoryId === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800'
              }`}
            >
              <DynamicIcon name={cat.icon} size={13} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          {/* Left Category Sidebar (Desktop & Tablets) */}
          <div className="hidden lg:block w-64 shrink-0">
            <CategorySidebar
              categories={categories}
              bookmarks={bookmarks}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
              isAdmin={isAdmin}
              onAddCategory={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onEditCategory={(cat) => {
                setEditingCategory(cat);
                setCategoryModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>

          {/* Right Main Grid */}
          <div className="flex-1 min-w-0 w-full">
            <BookmarkGrid
              bookmarks={filteredBookmarks}
              categories={categories}
              activeCategoryId={activeCategoryId}
              searchQuery={searchQuery}
              isAdmin={isAdmin}
              onEditBookmark={(bm) => {
                setEditingBookmark(bm);
                setBookmarkModalOpen(true);
              }}
              onDeleteBookmark={handleDeleteBookmark}
              onTogglePin={handleTogglePin}
              onTrackClick={handleTrackClick}
              onOpenAddBookmark={() => {
                setEditingBookmark(null);
                setBookmarkModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 backdrop-blur py-5 mt-10">
        <div className="w-full max-w-7xl 2xl:max-w-[1700px] 3xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FlareNav</span>
            <span>•</span>
            <span>自托管 Cloudflare Pages + D1 (SQLite) 架构</span>
            {zeroTrustEmail && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck size={11} />
                <span>Zero Trust: {zeroTrustEmail}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setExtensionGuideOpen(true)}
              className="hover:text-amber-400 flex items-center gap-1 transition"
            >
              <Chrome size={13} />
              <span>Chrome 插件</span>
            </button>
            <button
              onClick={() => setZeroTrustGuideOpen(true)}
              className="hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <ShieldCheck size={13} />
              <span>零信任 (Access)</span>
            </button>
            <button
              onClick={() => setDeployGuideOpen(true)}
              className="hover:text-sky-400 flex items-center gap-1 transition"
            >
              <Cloud size={13} />
              <span>D1 部署指南</span>
            </button>
            <button
              onClick={() => setImportExportOpen(true)}
              className="hover:text-slate-300 transition"
            >
              备份与导入
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookmarkModal
        isOpen={bookmarkModalOpen}
        onClose={() => {
          setBookmarkModalOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        categories={categories}
        initialData={editingBookmark}
        defaultCategoryId={activeCategoryId}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          showToast('🎉 管理员身份验证通过！已解锁编辑权限');
        }}
      />

      <ExtensionGuideModal
        isOpen={extensionGuideOpen}
        onClose={() => setExtensionGuideOpen(false)}
      />

      <DeployGuideModal
        isOpen={deployGuideOpen}
        onClose={() => setDeployGuideOpen(false)}
      />

      <ZeroTrustGuideModal
        isOpen={zeroTrustGuideOpen}
        onClose={() => setZeroTrustGuideOpen(false)}
      />

      <StatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
      />

      <ImportExportModal
        isOpen={importExportOpen}
        onClose={() => setImportExportOpen(false)}
        categories={categories}
        bookmarks={bookmarks}
        onImportSuccess={() => {
          loadData();
          showToast('🎉 书签导入成功！');
        }}
      />
    </div>
  );
}
