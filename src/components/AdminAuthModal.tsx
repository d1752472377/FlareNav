import React, { useState } from 'react';
import { X, Shield, Key, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { verifyAdminToken, setStoredAdminToken } from '../services/api';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg('请输入管理密钥');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const isValid = await verifyAdminToken(token.trim());
      if (isValid) {
        setStoredAdminToken(token.trim());
        onSuccess();
        onClose();
      } else {
        setErrorMsg('管理密钥错误，请检查！默认密钥为 admin123');
      }
    } catch (err: any) {
      setErrorMsg('验证失败: ' + (err.message || '网络异常'));
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefault = () => {
    setToken('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <Shield size={16} />
            </div>
            <h3 className="font-bold text-slate-100 text-base">管理员身份验证</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            解锁管理模式后，您可以添加、编辑、删除书签和分类，以及进行数据备份和导入操作。
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Admin Secret Key / 访问令牌</span>
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-[11px] text-amber-400 hover:underline"
              >
                填入默认密码 (admin123)
              </button>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Key size={15} />
              </div>
              <input
                type="password"
                required
                placeholder="请输入 ADMIN_SECRET_KEY"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">💡 密钥说明</div>
            <p>
              部署到 Cloudflare Pages 时，请在 Pages 后台环境变量或 <code>wrangler.toml</code> 中配置 <code>ADMIN_SECRET_KEY</code>。
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loading ? '验证中...' : '确认解锁'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
