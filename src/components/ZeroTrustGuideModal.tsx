import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Key,
  Mail,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface ZeroTrustGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ZeroTrustGuideModal: React.FC<ZeroTrustGuideModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isLight = theme === 'light';

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modalBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';

  const headerBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-950/50 border-slate-800';

  const cardBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-800'
    : 'bg-slate-800/40 border-slate-700/60 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`border rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${modalBg}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                <ShieldCheck size={20} className="text-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Cloudflare Zero Trust (Access) 零信任防护指南</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  军工级安全
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>无需暴露密码，通过邮箱验证码或 SSO 单点登录保护您的个人导航站</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* Why Zero Trust */}
          <div className={`border rounded-2xl p-4 flex flex-col gap-2 ${
            isLight
              ? 'bg-emerald-50/70 border-emerald-200 text-slate-700'
              : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border-emerald-500/30 text-slate-300'
          }`}>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 font-bold text-sm">
              <Sparkles size={16} />
              <span>为什么要使用 Cloudflare Zero Trust (Access)？</span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              当您的 FlareNav 部署在公网上时，若只想自己或特定好友访问，或者希望实现<strong>免输密码自动识别管理员身份</strong>，Cloudflare 免费提供的 <strong>Zero Trust Access（支持 50 个免费用户）</strong> 是最完美的解决方案！
            </p>
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t text-[11px] ${isLight ? 'border-emerald-200 text-emerald-900' : 'border-emerald-500/20 text-emerald-200'}`}>
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>拦截未授权外部扫描与爬虫</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>邮箱 6 位 OTP 或 SSO 登录</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>免密自动识别管理员权限</span>
              </div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Zap size={14} className="text-amber-500" />
              <span>3 分钟快速接入 Cloudflare Access 教程</span>
            </h3>

            {/* Step 1 */}
            <div className={`border rounded-2xl p-4 space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  登录 Cloudflare Zero Trust 控制台
                </span>
                <a
                  href="https://one.dash.cloudflare.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>打开控制台</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                登录 <code>one.dash.cloudflare.com</code>，左侧导航栏点击 <strong>Access（访问） &gt; Applications（应用程序）</strong>，点击右上角的 <strong>Add an application（添加应用程序）</strong>。
              </p>
            </div>

            {/* Step 2 */}
            <div className={`border rounded-2xl p-4 space-y-2 ${cardBg}`}>
              <span className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
                选择 Self-Hosted 并填写您的域名
              </span>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                在类型中选择 <strong>Self-Hosted（自托管应用）</strong>：
              </p>
              <ul className={`list-disc list-inside space-y-1 pl-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <li><strong>Application name</strong>: <code>FlareNav 导航</code></li>
                <li><strong>Application domain</strong>: 输入您的 Pages 域名（例如 <code>your-nav.pages.dev</code>）或自定义域名。</li>
                <li><strong>Session Duration</strong>: 建议设为 <code>24 hours</code> 或 <code>1 month</code>（免频繁验证）。</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className={`border rounded-2xl p-4 space-y-2 ${cardBg}`}>
              <span className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                配置允许访问的访问策略 (Policies)
              </span>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                在 <strong>Add a policy</strong> 步骤中：
              </p>
              <ul className={`list-disc list-inside space-y-1 pl-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <li><strong>Policy name</strong>: <code>管理员访问</code></li>
                <li><strong>Action</strong>: <code>Allow</code></li>
                <li><strong>Configure rules</strong>: 选择 <strong>Include &gt; Emails</strong>，填写您的常用邮箱（例如 <code>yourname@gmail.com</code>）。</li>
              </ul>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                💡 此时访问网站时，Cloudflare 会弹出优雅的登录页，输入邮箱即可收到 6 位一次性验证码直接进入。
              </p>
            </div>

            {/* Step 4: Auto Admin Verification in Code */}
            <div className={`border rounded-2xl p-4 space-y-2 ${cardBg}`}>
              <span className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">4</span>
                （可选）配置 ADMIN_EMAIL 实现免密自动管理员
              </span>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                FlareNav 的 Pages Functions 已经原生支持解析 Cloudflare Access 的 <code className="text-amber-500 font-mono">Cf-Access-Authenticated-User-Email</code> 请求头：
              </p>
              <div className={`p-3 rounded-xl border font-mono text-[11px] space-y-1 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                <p>在 Cloudflare Pages 项目后台 Settings &gt; Environment variables 添加：</p>
                <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border font-semibold ${isLight ? 'bg-white border-slate-200 text-emerald-700' : 'bg-slate-900 border-slate-800 text-emerald-300'}`}>
                  <span>ADMIN_EMAIL = "your-email@gmail.com"</span>
                  <button
                    onClick={() => handleCopy('your-email@gmail.com', 'admin_email')}
                    className="hover:opacity-75 transition"
                  >
                    {copiedKey === 'admin_email' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                只要您通过 Cloudflare Zero Trust 验证，系统将自动识别为您本人，直接解锁增删改查管理权限，无需再手动输入密码！
              </p>
            </div>
          </div>

          {/* Chrome Extension with Zero Trust */}
          <div className={`border rounded-2xl p-4 space-y-2 ${isLight ? 'bg-amber-50/70 border-amber-200 text-slate-700' : 'bg-amber-500/10 border-amber-500/20 text-slate-300'}`}>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-bold text-xs">
              <AlertTriangle size={15} />
              <span>搭配 Chrome 插件使用小贴士</span>
            </div>
            <p className="text-[11px]">
              如果您开启了全站 Zero Trust 阻断，Chrome 插件在后台请求 API 时需要绕过拦截。您可以在 Cloudflare Access 中为 <code className="text-amber-600 dark:text-amber-300 font-mono">/api/*</code> 路径单独配置一条 <strong>Bypass（放行）</strong> 或 <strong>Service Token</strong> 规则，并继续使用插件内的 Admin Token 验证！
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            知道了，关闭
          </button>
        </div>
      </div>
    </div>
  );
};
