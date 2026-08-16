import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  Check,
  AlertCircle,
  Database,
  Code,
  Sparkles,
} from 'lucide-react';
import { importBookmarksData } from '../services/api';
import { Category, Bookmark, ThemeMode } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  bookmarks: Bookmark[];
  onImportSuccess: () => void;
  theme?: ThemeMode;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  categories,
  bookmarks,
  onImportSuccess,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ text: string; success: boolean } | null>(null);

  const isLight = theme === 'light';

  if (!isOpen) return null;

  // Handle Netscape HTML or JSON Bookmark file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResultMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setImporting(false);
        setResultMsg({ text: '文件内容为空', success: false });
        return;
      }

      try {
        let importedCategories: any[] = [];
        let importedBookmarks: any[] = [];

        if (file.name.endsWith('.json') || content.trim().startsWith('{')) {
          // JSON format
          const parsed = JSON.parse(content);
          importedCategories = parsed.categories || [];
          importedBookmarks = parsed.bookmarks || [];
        } else {
          // Netscape HTML Bookmark parser
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');

          let currentCatId = categories[0]?.id || 'cat_tools';

          // Iterate all DT elements
          const dts = doc.querySelectorAll('dt');
          dts.forEach((dt) => {
            const h3 = dt.querySelector('h3');
            if (h3) {
              const catName = h3.textContent?.trim() || '导入文件夹';
              const catId = 'cat_' + Math.random().toString(36).substring(2, 9);
              importedCategories.push({
                id: catId,
                name: catName,
                icon: 'Folder',
                color: '#3b82f6',
              });
              currentCatId = catId;
            }

            const a = dt.querySelector('a');
            if (a) {
              const url = a.getAttribute('href');
              const title = a.textContent?.trim() || url || '未命名书签';
              const icon = a.getAttribute('icon') || '';
              if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                importedBookmarks.push({
                  category_id: currentCatId,
                  title,
                  url,
                  description: '',
                  icon_url: icon,
                  is_pinned: 0,
                });
              }
            }
          });
        }

        if (importedBookmarks.length === 0) {
          setResultMsg({ text: '未在文件中解析到有效网页书签', success: false });
          setImporting(false);
          return;
        }

        const count = await importBookmarksData({ importedCategories, importedBookmarks });
        setResultMsg({ text: `🎉 成功导入 ${count} 个新书签！`, success: true });
        onImportSuccess();
      } catch (err: any) {
        setResultMsg({ text: '导入失败: ' + err.message, success: false });
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories,
      bookmarks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flarenav-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    window.open('/api/export?format=html', '_blank');
  };

  const handleExportSql = () => {
    let sql = `-- FlareNav D1 SQLite Dump\n-- Exported At: ${new Date().toISOString()}\n\n`;
    for (const c of categories) {
      sql += `INSERT OR REPLACE INTO categories (id, name, icon, color, sort_order, is_pinned) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.icon}', '${c.color}', ${c.sort_order}, ${c.is_pinned ? 1 : 0});\n`;
    }
    sql += '\n';
    for (const b of bookmarks) {
      sql += `INSERT OR REPLACE INTO bookmarks (id, category_id, title, url, description, icon_url, is_pinned, is_private, sort_order, click_count) VALUES ('${b.id}', '${b.category_id}', '${b.title.replace(/'/g, "''")}', '${b.url.replace(/'/g, "''")}', '${(b.description || '').replace(/'/g, "''")}', '${b.icon_url || ''}', ${b.is_pinned ? 1 : 0}, ${b.is_private ? 1 : 0}, ${b.sort_order}, ${b.click_count || 0});\n`;
    }

    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flarenav-d1-dump-${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const modalBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';

  const headerBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-900/90 border-slate-800';

  const tabBg = isLight
    ? 'bg-slate-100/70 border-slate-200'
    : 'bg-slate-900/50 border-slate-800';

  const itemBg = isLight
    ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
    : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-lg border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold">
              <Upload size={18} />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>书签数据导入与导出</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>支持 Chrome / Edge 书签 HTML、JSON 与 D1 SQL 备份</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Header */}
        <div className={`flex items-center border-b px-6 gap-4 ${tabBg}`}>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📥 批量导入书签
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📤 备份与导出
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {resultMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs ${
              resultMsg.success
                ? isLight
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : isLight
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}>
              {resultMsg.success ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{resultMsg.text}</span>
            </div>
          )}

          {activeTab === 'import' ? (
            <div className="space-y-4">
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                您可以直接导入从 <strong>Chrome、Edge、Firefox 或 Safari</strong> 导出的标准书签 HTML 文件 (<code>bookmarks.html</code>)，系统将自动解析文件夹层级与链接。
              </p>

              {/* Upload Dropzone */}
              <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                isLight
                  ? 'border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30'
                  : 'border-slate-700 hover:border-amber-400/80 bg-slate-800/30 hover:bg-slate-800/50'
              }`}>
                <input
                  type="file"
                  accept=".html,.htm,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <span className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>点击选择书签文件 或 拖拽至此</span>
                  <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>支持 .html (浏览器导出格式) 与 .json 备份文件</p>
                </div>
              </label>

              {importing && (
                <div className="text-center text-xs text-amber-500 font-semibold animate-pulse">
                  正在解析并写入书签数据，请稍候...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                将当前 FlareNav 的所有分类与书签导出为不同格式：
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {/* HTML Export */}
                <button
                  onClick={handleExportHtml}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition text-left group ${itemBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className={`font-bold text-xs group-hover:text-amber-500 transition ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        导出为 Netscape HTML 书签
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>可直接导入回 Chrome、Edge 或 Firefox 浏览器</div>
                    </div>
                  </div>
                  <Download size={16} className={`transition ${isLight ? 'text-slate-400 group-hover:text-amber-500' : 'text-slate-400 group-hover:text-amber-400'}`} />
                </button>

                {/* JSON Export */}
                <button
                  onClick={handleExportJson}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition text-left group ${itemBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Code size={18} />
                    </div>
                    <div>
                      <div className={`font-bold text-xs group-hover:text-amber-500 transition ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        导出为 JSON 数据备份
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>保留完整的字段结构与访问计数元数据</div>
                    </div>
                  </div>
                  <Download size={16} className={`transition ${isLight ? 'text-slate-400 group-hover:text-amber-500' : 'text-slate-400 group-hover:text-amber-400'}`} />
                </button>

                {/* Cloudflare D1 SQL Export */}
                <button
                  onClick={handleExportSql}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition text-left group ${itemBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Database size={18} />
                    </div>
                    <div>
                      <div className={`font-bold text-xs group-hover:text-amber-500 transition ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        导出为 Cloudflare D1 SQL 导入脚本
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>可直接灌入生产库</div>
                    </div>
                  </div>
                  <Download size={16} className={`transition ${isLight ? 'text-slate-400 group-hover:text-amber-500' : 'text-slate-400 group-hover:text-amber-400'}`} />
                </button>

                {/* Complete Project Source Code ZIP Download */}
                <a
                  href="/api/download-project-zip"
                  download="flarenav-source-code.zip"
                  className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition text-left group cursor-pointer text-decoration-none ${
                    isLight
                      ? 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-300'
                      : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
                      📦
                    </div>
                    <div>
                      <div className={`font-bold text-xs group-hover:text-amber-600 dark:group-hover:text-amber-200 transition ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                        打包下载完整项目工程源码 (.zip)
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>包含前端、Pages Functions API、D1 schema.sql 与 Chrome 插件</div>
                    </div>
                  </div>
                  <Download size={16} className="text-amber-500 group-hover:translate-y-0.5 transition" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end px-6 py-3.5 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
