import React, { useEffect, useState } from 'react';
import { X, BarChart2, Eye, Bookmark, Layers, TrendingUp, Sparkles, ExternalLink } from 'lucide-react';
import { StatsData, ThemeMode } from '../types';
import { fetchStats } from '../services/api';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, theme = 'dark' }) => {
  const [stats, setStats] = useState<StatsData>({
    totalBookmarks: 0,
    totalCategories: 0,
    totalClicks: 0,
    topVisited: [],
  });
  const [loading, setLoading] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchStats()
        .then((data) => setStats(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';

  const headerBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-900/90 border-slate-800';

  const metricCardBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-800/50 border-slate-700/60';

  const listBg = isLight
    ? 'bg-slate-50 border-slate-200 divide-slate-200'
    : 'bg-slate-800/30 border-slate-800 divide-slate-800/80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-xl border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>导航访问统计看板</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>基于 Cloudflare D1 数据库的实时访问数据</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics 3-Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`border rounded-2xl p-3.5 text-center ${metricCardBg}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>总收录书签</div>
              <div className="text-xl font-extrabold text-amber-500 mt-1 font-mono">{stats.totalBookmarks}</div>
            </div>
            <div className={`border rounded-2xl p-3.5 text-center ${metricCardBg}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>分类标签数</div>
              <div className="text-xl font-extrabold text-sky-500 mt-1 font-mono">{stats.totalCategories}</div>
            </div>
            <div className={`border rounded-2xl p-3.5 text-center ${metricCardBg}`}>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>总点击直达</div>
              <div className="text-xl font-extrabold text-emerald-500 mt-1 font-mono">{stats.totalClicks}</div>
            </div>
          </div>

          {/* Top Visited Sites */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <TrendingUp size={15} className="text-amber-500" />
              <span>最常访问书签排行 (Top 6)</span>
            </div>

            <div className={`border rounded-2xl divide-y overflow-hidden ${listBg}`}>
              {stats.topVisited.length === 0 ? (
                <div className={`p-6 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  暂无访问记录
                </div>
              ) : (
                stats.topVisited.map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-between px-4 py-2.5 transition group ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-amber-100'
                          : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={item.icon_url || 'https://www.google.com/s2/favicons?domain=example.com'}
                        alt={item.title}
                        className="w-4 h-4 rounded object-contain shrink-0"
                      />
                      <span className={`text-xs font-semibold group-hover:text-amber-500 transition truncate ${
                        isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-mono flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Eye size={12} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                        <span>{item.click_count || 0}</span>
                      </span>
                      <ExternalLink size={12} className={`transition ${isLight ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end px-6 py-3.5 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
