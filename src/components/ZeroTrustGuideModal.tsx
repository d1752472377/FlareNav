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

interface ZeroTrustGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZeroTrustGuideModal: React.FC<ZeroTrustGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck size={20} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Cloudflare Zero Trust (Access) 零信任防护指南</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  军工级安全
                </span>
              </div>
              <p className="text-xs text-slate-400">无需暴露密码，通过邮箱验证码或 SSO 单点登录保护您的个人导航站</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* Why Zero Trust */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Sparkles size={16} />
              <span>为什么要使用 Cloudflare Zero Trust (Access)？</span>
            </div>
            <p className="text-slate-300 text-xs">
              当您的 FlareNav 部署在公网上时，若只想自己或特定好友访问，或者希望实现<strong>免输密码自动识别管理员身份</strong>，Cloudflare 免费提供的 <strong>Zero Trust Access（支持 50 个免费用户）</strong> 是最完美的解决方案！
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-500/20 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>拦截未授权外部扫描与爬虫</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>邮箱 6 位 OTP 或 Google/GitHub 登录</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>免密自动识别管理员权限</span>
              </div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              <span>3 分钟快速接入 Cloudflare Access 教程</span>
            </h3>

            {/* Step 1 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  登录 Cloudflare Zero Trust 控制台
                </span>
                <a
                  href="https://one.dash.cloudflare.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>打开控制台</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-slate-400">
                登录 <code className="text-sky-300">one.dash.cloudflare.com</code>，左侧导航栏点击 <strong>Access（访问） &gt; Applications（应用程序）</strong>，点击右上角的 <strong>Add an application（添加应用程序）</strong>。
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
                选择 Self-Hosted 并填写您的域名
              </span>
              <p className="text-slate-400">
                在类型中选择 <strong>Self-Hosted（自托管应用）</strong>：
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                <li><strong>Application name</strong>: <code>FlareNav 导航</code></li>
                <li><strong>Application domain</strong>: 输入您的 Pages 域名（例如 <code>your-nav.pages.dev</code>）或绑定在 Cloudflare 上的自定义域名。</li>
                <li><strong>Session Duration</strong>: 建议设为 <code>24 hours</code> 或 <code>1 month</code>（免频繁验证）。</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                配置允许访问的访问策略 (Policies)
              </span>
              <p className="text-slate-400">
                在 <strong>Add a policy</strong> 步骤中：
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                <li><strong>Policy name</strong>: <code>管理员访问</code></li>
                <li><strong>Action</strong>: <code>Allow</code></li>
                <li><strong>Configure rules</strong>: 选择 <strong>Include &gt; Emails</strong>，填写您的常用邮箱（例如 <code>yourname@gmail.com</code>）。</li>
              </ul>
              <p className="text-slate-400 text-[11px] mt-1">
                💡 此时访问网站时，Cloudflare 会弹出优雅的登录页，输入邮箱即可收到 6 位一次性验证码直接进入。
              </p>
            </div>

            {/* Step 4: Auto Admin Verification in Code */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">4</span>
                （可选）配置 ADMIN_EMAIL 实现免密自动管理员
              </span>
              <p className="text-slate-400">
                FlareNav 的 Pages Functions 已经原生支持解析 Cloudflare Access 的 <code className="text-amber-300">Cf-Access-Authenticated-User-Email</code> 请求头：
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <p className="text-slate-400">在 Cloudflare Pages 项目后台 Settings &gt; Environment variables 添加：</p>
                <div className="flex items-center justify-between text-emerald-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span>ADMIN_EMAIL = "your-email@gmail.com"</span>
                  <button
                    onClick={() => handleCopy('your-email@gmail.com', 'admin_email')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === 'admin_email' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-[11px]">
                只要您通过 Cloudflare Zero Trust 验证，系统将自动识别为您本人，直接解锁增删改查管理权限，无需再手动输入密码！
              </p>
            </div>
          </div>

          {/* Chrome Extension with Zero Trust */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle size={15} />
              <span>搭配 Chrome 插件使用小贴士</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              如果您开启了全站 Zero Trust 阻断，Chrome 插件在后台请求 API 时需要绕过拦截。您可以在 Cloudflare Access 中为 <code className="text-amber-300">/api/*</code> 路径单独配置一条 <strong>Bypass（放行）</strong> 或 <strong>Service Token</strong> 规则，并继续使用插件内的 Admin Token 验证！
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            知道了，关闭
          </button>
        </div>
      </div>
    </div>
  );
};
