import React, { useState } from 'react';
import { X, Shield, Key, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { verifyAdminToken, setStoredAdminToken } from '../services/api';
import { ThemeMode } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme?: ThemeMode;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme = 'dark',
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLight = theme === 'light';

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
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      const result = await verifyAdminToken(cleanToken);
      if (result.success) {
        setStoredAdminToken(cleanToken);
        onSuccess();
        onClose();
      } else {
        setErrorMsg(result.message || '管理密钥错误，请检查！默认密钥为 admin123');
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

  const modalBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';

  const headerBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-900/80 border-slate-800';

  const inputBg = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500'
    : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-400';

  const tipBg = isLight
    ? 'bg-amber-50/60 border-amber-200 text-slate-600'
    : 'bg-slate-800/50 border-slate-700/60 text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-md border rounded-2xl overflow-hidden flex flex-col transition-colors ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              <Shield size={16} />
            </div>
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              管理员身份验证
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
          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            解锁管理模式后，您可以添加、编辑、删除书签和分类，以及进行数据备份和导入操作。
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={`text-xs font-semibold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <span>Admin Secret Key / 访问令牌</span>
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-[11px] text-amber-500 hover:underline font-semibold"
              >
                填入默认密码 (admin123)
              </button>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Key size={15} />
              </div>
              <input
                type="password"
                required
                placeholder="请输入 ADMIN_SECRET_KEY"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition ${inputBg}`}
              />
            </div>
          </div>

          <div className={`border rounded-xl p-3 text-[11px] space-y-1 ${tipBg}`}>
            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>💡 密钥说明</div>
            <p>
              部署到 Cloudflare Pages 时，在 Pages 控制台「设置」→「环境变量」中添加 <code>ADMIN_SECRET_KEY</code> 变量即可（默认值为 <code>admin123</code>）。
            </p>
          </div>

          {/* Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
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
