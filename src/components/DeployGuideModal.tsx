import React, { useState } from 'react';
import {
  X,
  Cloud,
  Terminal,
  Database,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
              <Cloud size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <span>Cloudflare Pages + D1 (SQLite) 部署指南</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                  100% Serverless
                </span>
              </h3>
              <p className="text-xs text-slate-400">无需服务器，依托 Cloudflare 边缘计算与全球分布式 SQLite 数据库</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed">
          {/* Direct Download ZIP Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <span>📦 无法连接 GitHub？直接下载完整项目源码包 (.zip)</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                包含前端 React 源码、Cloudflare D1 数据库 SQL、Pages Functions 后端 API 及 Chrome 扩展全部源文件。
              </p>
            </div>
            <a
              href="/api/download-project-zip"
              download="flarenav-source-code.zip"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 shrink-0 cursor-pointer text-decoration-none"
            >
              <ExternalLink size={15} />
              <span>下载全部源码 (.zip)</span>
            </a>
          </div>

          {/* Overview */}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles size={20} className="text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sky-300 text-sm">零费用、免运维的极简架构</div>
              <p className="text-slate-300 mt-1">
                前端通过 <strong>Cloudflare Pages</strong> 静态托管，后端由 <strong>Cloudflare Functions (Pages Functions)</strong> 提供无服务器 API，数据持久化完全托管在 <strong>Cloudflare D1 (SQLite)</strong> 边缘数据库上。
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[11px]">1</span>
                  <span>创建 Cloudflare D1 数据库实例</span>
                </div>
                <button
                  onClick={() => handleCopy('npx wrangler d1 create flarenav_db', 'cmd1')}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedCmd === 'cmd1' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCmd === 'cmd1' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-2.5 font-mono text-[11px] text-amber-300 border border-slate-800">
                $ npx wrangler d1 create flarenav_db
              </div>
              <p className="text-slate-400 text-[11px]">
                创建后推荐直接在 Cloudflare Pages 控制台绑定（第 4 步），无需修改 <code>wrangler.toml</code> 即可避免 UUID 格式报错。
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[11px]">2</span>
                  <span>初始化 SQLite 数据库表结构 (导入 schema.sql)</span>
                </div>
                <button
                  onClick={() => handleCopy('npx wrangler d1 execute flarenav_db --file=./schema.sql --remote', 'cmd2')}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedCmd === 'cmd2' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCmd === 'cmd2' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-2.5 font-mono text-[11px] text-amber-300 border border-slate-800">
                $ npx wrangler d1 execute flarenav_db --file=./schema.sql --remote
              </div>
              <p className="text-slate-400 text-[11px]">
                该命令将自动在您的 Cloudflare D1 远程数据库中创建 <code>bookmarks</code>, <code>categories</code>, <code>settings</code> 等表及初始种子数据。
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[11px]">3</span>
                <span>推送到 GitHub 并连接 Cloudflare Pages</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                将本工程推送到您的 GitHub 仓库，在 Cloudflare 控制台点击 <strong>Workers &amp; Pages &gt; Create application &gt; Pages &gt; Connect to Git</strong>。
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1">
                <div>• 构建命令 (Build command): <code className="text-sky-300 font-mono">npm run build</code></div>
                <div>• 输出目录 (Build output directory): <code className="text-sky-300 font-mono">dist</code></div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[11px]">4</span>
                <span>在 Cloudflare Pages 设置中绑定 D1 数据库 (重要)</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                在您的 Pages 项目详情中，进入 <strong>Settings &gt; Functions &gt; D1 database bindings</strong>，添加绑定：
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1">
                <div>• Variable name (变量名必须为): <code className="text-amber-400 font-mono font-bold">DB</code></div>
                <div>• D1 database: 选择刚才创建的 <code className="text-sky-300 font-mono">flarenav_db</code></div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[11px]">5</span>
                <span>设置管理员密钥环境变量 (ADMIN_SECRET_KEY)</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                在 Pages 项目 <strong>Settings &gt; Environment variables</strong> 中添加：
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1">
                <div>• 变量名: <code className="text-amber-400 font-mono font-bold">ADMIN_SECRET_KEY</code></div>
                <div>• 变量值: 您的自定义密钥（若不配置，系统默认使用 <code className="text-sky-300 font-mono">admin123</code>）</div>
              </div>
              <p className="text-amber-400/90 text-[10px]">
                ⚠️ 注意：若在环境变量中修改了密钥，请使用您新设置的密钥登录，或者留空将继续使用默认密码 <code>admin123</code>。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>支持绑定自定义顶级域名与 SSL 自动续期</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
