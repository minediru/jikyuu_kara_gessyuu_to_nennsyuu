import { useState, useEffect, useMemo } from 'react';
import { Job } from './types';
import {
  INITIAL_JOBS,
  PRESET_SAMPLE_JOBS,
  calculateTotals,
} from './utils/calculator';
import { generateIncomePDF } from './utils/pdfExport';
import { Header } from './components/Header';
import { SummaryDashboard } from './components/SummaryDashboard';
import { JobCard } from './components/JobCard';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import {
  Plus,
  HelpCircle,
  AlertCircle,
  ArrowUp,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Sparkles,
  ArrowDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY = 'sidejob_simulator_jobs_v2';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_JOBS;
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }, [jobs]);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time calculations
  const totals = useMemo(() => calculateTotals(jobs), [jobs]);

  const handleAddJob = () => {
    const newId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newJob: Job = {
      id: newId,
      name: '',
      wageType: 'hourly',
      wageAmount: 1200,
      hoursPerDay: 5,
      frequencyType: 'weekly',
      frequencyDays: 3,
    };
    setJobs((prev) => [...prev, newJob]);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleDeleteJob = (id: string) => {
    if (jobs.length <= 1) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleDuplicateJob = (sourceJob: Job) => {
    const newId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: Job = {
      ...sourceJob,
      id: newId,
      name: sourceJob.name ? `${sourceJob.name} (コピー)` : '',
    };
    setJobs((prev) => [...prev, duplicated]);
  };

  const handleResetConfirm = () => {
    setJobs(INITIAL_JOBS);
    setIsResetModalOpen(false);
  };

  const handleLoadPresets = () => {
    setJobs(PRESET_SAMPLE_JOBS);
  };

  const handleSavePdf = async () => {
    if (isSavingPdf) return;
    try {
      setIsSavingPdf(true);
      await generateIncomePDF(totals);
      setToastMessage('PDFファイルをダウンロード保存しました！');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setToastMessage('PDFの保存に失敗しました。');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSavingPdf(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToResults = () => {
    const el = document.getElementById('simulation-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 pb-12 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header
        totals={totals}
        isSavingPdf={isSavingPdf}
        onSavePdf={handleSavePdf}
        onResetClick={() => setIsResetModalOpen(true)}
        onLoadPresetClick={handleLoadPresets}
      />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SECTION 1: 入力画面 (JOB CARDS AT THE TOP) */}
        <section className="mb-6">
          {/* Header of Job Inputs */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                仕事・シフト入力
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                {jobs.length}件
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddJob}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>仕事を追加</span>
            </button>
          </div>

          {/* Job Cards List */}
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                totalJobs={jobs.length}
                onUpdate={handleUpdateJob}
                onDelete={handleDeleteJob}
                onDuplicate={handleDuplicateJob}
              />
            ))}
          </div>

          {/* Add Job Large Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddJob}
              className="w-full py-3.5 px-4 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/70 hover:bg-orange-100/70 active:bg-orange-200/70 text-orange-800 font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span>＋ 新しい仕事を追加する</span>
            </button>
          </div>
        </section>

        {/* SECTION 2: シミュレーション結果 (SUMMARY DASHBOARD DIRECTLY BELOW) */}
        <section className="pt-2 mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                合計収入＆シミュレーション結果
              </h2>
            </div>
            <button
              type="button"
              onClick={scrollToTop}
              className="text-xs text-orange-700 hover:text-orange-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>↑ 入力欄へ戻る</span>
            </button>
          </div>

          {/* Results Overview */}
          <SummaryDashboard totals={totals} />
        </section>

        {/* Action Buttons: CSV & PDF Direct Download */}
        <div className="mb-8 p-4 bg-white rounded-2xl border-2 border-orange-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>計算結果シートの保存・ダウンロード</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                import('./utils/calculator').then((m) => m.downloadCSV(totals));
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-orange-600" />
              <span>CSVダウンロード</span>
            </button>
            <button
              type="button"
              onClick={handleSavePdf}
              disabled={isSavingPdf}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {isSavingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF生成中...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>PDFを保存する</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help & Guide Accordion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => setShowFaq(!showFaq)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  掛け持ちバイト・副業の計算方法と確定申告
                </h3>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                showFaq ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showFaq && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                  Q. 週○日と月○日の換算基準は？
                </h4>
                <p className="leading-relaxed">
                  1年は52週（52週 ÷ 12ヶ月 ＝ 1ヶ月あたり約4.33週）として計算しています。例えば週3日勤務の場合、月換算で約13日分の給与として正確に算出されます。
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                  Q. 掛け持ちバイトの確定申告は必要？
                </h4>
                <p className="leading-relaxed">
                  2箇所以上から給与をもらっている場合、年末調整されなかったサブ勤務先の給与収入が年間20万円を超えると確定申告が必要です。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4">
          <p>© {new Date().getFullYear()} 掛け持ちバイト・副業 月収＆年収シミュレーター</p>
        </footer>
      </main>

      {/* Back to top button (only floating element on page) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-5 sm:right-6 p-3 rounded-full bg-slate-900/90 hover:bg-slate-900 active:scale-95 text-white shadow-xl transition-all z-30 cursor-pointer flex items-center justify-center"
          title="ページ上部へ戻る"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
