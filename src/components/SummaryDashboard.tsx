import React from 'react';
import { TotalCalculation } from '../types';
import { formatHours, formatYen } from '../utils/calculator';
import {
  TrendingUp,
  Clock,
  Calendar,
  PieChart,
  Info,
} from 'lucide-react';

interface SummaryDashboardProps {
  totals: TotalCalculation;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ totals }) => {
  const hasIncome = totals.totalMonthlyIncome > 0;

  return (
    <div
      id="simulation-results"
      className="no-print bg-white rounded-2xl border-2 border-orange-200/90 shadow-sm overflow-hidden mb-6 transition-all scroll-mt-20"
    >
      {/* Top Main KPI Grid - High Contrast Orange Theme */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-stone-900 to-orange-950 text-white relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white shadow-xs">
              計算結果
            </span>
            <span className="text-xs text-slate-300">
              {totals.totalJobsCount}件のシフトを合算
            </span>
          </div>

          <div className="text-xs text-slate-300/80 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1年は52週（月平均 約4.33週）で換算</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* Main Focus: Total Monthly Income */}
          <div className="md:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-orange-400/30 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                合計月収（予測）
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-orange-500/20 text-orange-200 border border-orange-400/30">
                額面総額
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-orange-400 tracking-tight font-mono">
                {formatYen(totals.totalMonthlyIncome)}
              </span>
              <span className="text-slate-300 text-sm font-bold">/ 月</span>
            </div>
            <p className="text-xs text-slate-300/90 mt-1">
              {hasIncome ? '現在のシフト入力に基づく予測合計' : 'シフトと金額を入力してください'}
            </p>
          </div>

          {/* KPI 2: Total Annual Income */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                合計年収（予測）
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  {formatYen(totals.totalAnnualIncome)}
                </span>
                <span className="text-slate-300 text-sm font-medium">/ 年</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              税引前の理論値（年間52週換算）
            </div>
          </div>

          {/* KPI 3: Total Working Hours */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-400" />
                総労働時間
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                月 約{formatHours(totals.totalMonthlyHours)}時間
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                （週 約{formatHours(totals.totalWeeklyHours)}時間）
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              ※時給制のみ合算
              {totals.dailyJobsCount > 0 && `（日給制${totals.dailyJobsCount}件は時間除外）`}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Breakdown Bar Area */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-orange-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-extrabold text-slate-900">収入の内訳</span>
            <span className="text-xs text-slate-500">（月収に占める割合）</span>
          </div>
          {hasIncome && (
            <span className="text-xs text-slate-500 font-bold">
              計 {totals.items.length}件
            </span>
          )}
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-5 sm:h-6 bg-slate-200 rounded-full overflow-hidden flex shadow-inner p-0.5 gap-0.5">
          {hasIncome ? (
            totals.items.map((item, idx) => {
              if (item.percentage <= 0) return null;
              return (
                <div
                  key={item.job.id || idx}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color.barHex,
                  }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group cursor-pointer hover:opacity-90"
                  title={`${item.displayName}: ${formatYen(item.monthlyIncome)}/月 (${item.percentage}%)`}
                >
                  {item.percentage >= 12 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white drop-shadow-xs truncate px-1">
                      {item.percentage}%
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
              時給または日給を入力すると内訳バーが表示されます
            </div>
          )}
        </div>

        {/* Legend Chips */}
        {hasIncome && (
          <div className="flex flex-wrap gap-2 mt-3 pt-1">
            {totals.items.map((item) => (
              <div
                key={item.job.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color.barHex }}
                />
                <span className="font-bold text-slate-800 max-w-[120px] sm:max-w-[160px] truncate">
                  {item.displayName}
                </span>
                <span className="font-mono font-extrabold text-orange-600">
                  {formatYen(item.monthlyIncome)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
