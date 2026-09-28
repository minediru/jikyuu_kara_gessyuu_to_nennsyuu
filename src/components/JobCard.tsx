import React from 'react';
import { Job, WageType, FrequencyType } from '../types';
import { calculateJob, formatHours, formatYen, JOB_COLORS } from '../utils/calculator';
import {
  Trash2,
  Copy,
  Clock,
  Calendar,
  Banknote,
  Minus,
  Plus,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  index: number;
  totalJobs: number;
  onUpdate: (updatedJob: Job) => void;
  onDelete: (id: string) => void;
  onDuplicate: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  index,
  totalJobs,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const color = JOB_COLORS[index % JOB_COLORS.length];
  const calculated = calculateJob(job, index);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...job, name: e.target.value });
  };

  const handleWageTypeChange = (newType: WageType) => {
    if (newType === job.wageType) return;
    let defaultAmount = job.wageAmount;
    if (newType === 'daily' && job.wageAmount < 3000) {
      defaultAmount = Math.max(8000, job.wageAmount * (job.hoursPerDay || 8));
    } else if (newType === 'hourly' && job.wageAmount >= 5000) {
      defaultAmount = Math.round(job.wageAmount / (job.hoursPerDay || 8));
    }
    onUpdate({
      ...job,
      wageType: newType,
      wageAmount: defaultAmount,
    });
  };

  const handleWageAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdate({ ...job, wageAmount: isNaN(val) ? 0 : Math.max(0, val) });
  };

  const adjustWageAmount = (delta: number) => {
    onUpdate({ ...job, wageAmount: Math.max(0, job.wageAmount + delta) });
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdate({
      ...job,
      hoursPerDay: isNaN(val) ? 0 : Math.min(24, Math.max(0, val)),
    });
  };

  const adjustHours = (delta: number) => {
    const newHours = Math.round((job.hoursPerDay + delta) * 10) / 10;
    onUpdate({
      ...job,
      hoursPerDay: Math.min(24, Math.max(0.5, newHours)),
    });
  };

  const handleFrequencyTypeChange = (newFreq: FrequencyType) => {
    if (newFreq === job.frequencyType) return;
    let newDays = job.frequencyDays;
    if (newFreq === 'weekly' && job.frequencyDays > 7) {
      newDays = Math.min(7, Math.round(job.frequencyDays / 4.33) || 3);
    } else if (newFreq === 'monthly' && job.frequencyDays <= 7) {
      newDays = Math.round(job.frequencyDays * (52 / 12));
    }
    onUpdate({
      ...job,
      frequencyType: newFreq,
      frequencyDays: Math.max(1, newDays),
    });
  };

  const handleFrequencyDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const maxDays = job.frequencyType === 'weekly' ? 7 : 31;
    onUpdate({
      ...job,
      frequencyDays: isNaN(val) ? 0 : Math.min(maxDays, Math.max(0, val)),
    });
  };

  const adjustFrequencyDays = (delta: number) => {
    const maxDays = job.frequencyType === 'weekly' ? 7 : 31;
    const newDays = Math.min(maxDays, Math.max(1, job.frequencyDays + delta));
    onUpdate({ ...job, frequencyDays: newDays });
  };

  const isOnlyOne = totalJobs <= 1;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs hover:border-orange-300 transition-all overflow-hidden">
      {/* Card Header: Job Name & Actions */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className="w-8 h-8 rounded-lg text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: color.barHex }}
          >
            {index + 1}
          </span>
          <input
            type="text"
            value={job.name}
            onChange={handleNameChange}
            placeholder={`仕事 ${index + 1}（例: カフェ、コンビニ）`}
            className="w-full bg-white text-slate-900 font-bold text-sm sm:text-base px-3 py-1.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none placeholder:text-slate-400 placeholder:font-normal transition-all"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDuplicate(job)}
            title="この仕事を複製"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(job.id)}
            disabled={isOnlyOne}
            title={isOnlyOne ? '最低1つの仕事が必要です' : 'この仕事を削除'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isOnlyOne
                ? 'text-slate-300 cursor-not-allowed opacity-40'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body: Clean, High-Visibility Inputs */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* 1. 給与形態の選択 (Segmented Toggle) - 2倍大きな文字 */}
        <div>
          <label className="block text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-orange-600 shrink-0" />
            <span>給与形態を選択</span>
          </label>
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-xl gap-1.5">
            <button
              type="button"
              onClick={() => handleWageTypeChange('hourly')}
              className={`py-2.5 px-3 text-sm sm:text-base font-extrabold rounded-lg transition-all cursor-pointer ${
                job.wageType === 'hourly'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              時給制
            </button>
            <button
              type="button"
              onClick={() => handleWageTypeChange('daily')}
              className={`py-2.5 px-3 text-sm sm:text-base font-extrabold rounded-lg transition-all cursor-pointer ${
                job.wageType === 'daily'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              日給制
            </button>
          </div>
        </div>

        {/* 2. 給与額の入力 (Amount) - 2倍大きな文字 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-orange-600 shrink-0" />
              <span>{job.wageType === 'hourly' ? '時給の金額' : '日給の金額'}</span>
            </label>
            {/* Quick increment buttons */}
            <div className="flex items-center gap-1.5">
              {job.wageType === 'hourly' ? (
                <>
                  <button
                    type="button"
                    onClick={() => adjustWageAmount(50)}
                    className="px-2.5 py-1 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors cursor-pointer"
                  >
                    +50円
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWageAmount(100)}
                    className="px-2.5 py-1 text-xs font-extrabold text-orange-800 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors cursor-pointer"
                  >
                    +100円
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => adjustWageAmount(500)}
                    className="px-2.5 py-1 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors cursor-pointer"
                  >
                    +500円
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWageAmount(1000)}
                    className="px-2.5 py-1 text-xs font-extrabold text-orange-800 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors cursor-pointer"
                  >
                    +1,000円
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
              ¥
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step={job.wageType === 'hourly' ? '10' : '100'}
              value={job.wageAmount || ''}
              onChange={handleWageAmountChange}
              placeholder={job.wageType === 'hourly' ? '1,200' : '11,000'}
              className="w-full pl-8 pr-12 py-3 text-slate-900 font-extrabold text-xl sm:text-2xl bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm sm:text-base pointer-events-none">
              円
            </span>
          </div>
        </div>

        {/* 3. 1日の実労働時間 (時給制のみ表示) - 2倍大きな文字 */}
        {job.wageType === 'hourly' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600 shrink-0" />
                <span>1日の実労働時間</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[4, 5, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onUpdate({ ...job, hoursPerDay: h })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                      job.hoursPerDay === h
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustHours(-0.5)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer shrink-0"
                title="-0.5時間"
              >
                <Minus className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={job.hoursPerDay || ''}
                  onChange={handleHoursChange}
                  placeholder="5"
                  className="w-full text-center py-2.5 text-slate-900 font-extrabold text-xl sm:text-2xl bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs sm:text-sm pointer-events-none">
                  時間 / 日
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustHours(0.5)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer shrink-0"
                title="+0.5時間"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* 4. 働く頻度 (週○日 / 月○日) - 2倍大きな文字 */}
        <div>
          <label className="block text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
            <span>働く頻度</span>
          </label>

          <div className="space-y-2.5">
            {/* 週/月の切り替え */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-xl gap-1.5">
              <button
                type="button"
                onClick={() => handleFrequencyTypeChange('weekly')}
                className={`py-2.5 px-3 text-sm sm:text-base font-extrabold rounded-lg transition-all cursor-pointer ${
                  job.frequencyType === 'weekly'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                週 ○ 日
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyTypeChange('monthly')}
                className={`py-2.5 px-3 text-sm sm:text-base font-extrabold rounded-lg transition-all cursor-pointer ${
                  job.frequencyType === 'monthly'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                月 ○ 日
              </button>
            </div>

            {/* 日数のステッパー入力 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustFrequencyDays(-1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer shrink-0"
              >
                <Minus className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={job.frequencyType === 'weekly' ? 7 : 31}
                  step="1"
                  value={job.frequencyDays || ''}
                  onChange={handleFrequencyDaysChange}
                  placeholder={job.frequencyType === 'weekly' ? '3' : '12'}
                  className="w-full text-center py-2.5 text-slate-900 font-extrabold text-xl sm:text-2xl bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs sm:text-sm pointer-events-none">
                  {job.frequencyType === 'weekly' ? '日 / 週' : '日 / 月'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustFrequencyDays(1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Simple, Clean Highlighted Monthly Pay */}
      <div className="px-4 py-3.5 bg-orange-50/70 border-t border-orange-100 flex items-center justify-between text-xs sm:text-sm">
        <div className="text-slate-600 font-medium">
          この仕事の月収見込:
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-black text-orange-600 text-lg sm:text-xl font-mono">
            {formatYen(calculated.monthlyIncome)}
          </span>
          <span className="text-slate-400 text-xs">
            / 月 (年収 約{formatYen(calculated.annualIncome)})
          </span>
        </div>
      </div>
    </div>
  );
};
