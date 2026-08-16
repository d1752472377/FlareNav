import React, { useEffect, useState } from 'react';
import { X, BarChart2, Eye, Bookmark, Layers, TrendingUp, Sparkles, ExternalLink } from 'lucide-react';
import { StatsData } from '../types';
import { fetchStats } from '../services/api';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<StatsData>({
    totalBookmarks: 0,
    totalCategories: 0,
    totalClicks: 0,
    topVisited: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchStats()
        .then((data) => setStats(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">导航访问统计看板</h3>
              <p className="text-xs text-slate-400">基于 Cloudflare D1 数据库的实时访问数据</p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics 3-Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <div className="text-[11px] text-slate-400 font-medium">总收录书签</div>
              <div className="text-xl font-extrabold text-amber-400 mt-1 font-mono">{stats.totalBookmarks}</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <div className="text-[11px] text-slate-400 font-medium">分类标签数</div>
              <div className="text-xl font-extrabold text-sky-400 mt-1 font-mono">{stats.totalCategories}</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <div className="text-[11px] text-slate-400 font-medium">总点击直达</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">{stats.totalClicks}</div>
            </div>
          </div>

          {/* Top Visited Sites */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <TrendingUp size={15} className="text-amber-400" />
              <span>最常访问书签排行 (Top 6)</span>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
              {stats.topVisited.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  暂无访问记录
                </div>
              ) : (
                stats.topVisited.map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/60 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={item.icon_url || 'https://www.google.com/s2/favicons?domain=example.com'}
                        alt={item.title}
                        className="w-4 h-4 rounded object-contain shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Eye size={12} className="text-slate-500" />
                        <span>{item.click_count || 0}</span>
                      </span>
                      <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 transition" />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
