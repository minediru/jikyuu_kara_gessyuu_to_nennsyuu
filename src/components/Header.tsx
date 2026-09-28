import React from 'react';
import { Download, RotateCcw, Sparkles, BriefcaseBusiness, FileText, Loader2 } from 'lucide-react';
import { TotalCalculation } from '../types';
import { downloadCSV } from '../utils/calculator';

interface HeaderProps {
  totals: TotalCalculation;
  isSavingPdf: boolean;
  onSavePdf: () => void;
  onResetClick: () => void;
  onLoadPresetClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totals,
  isSavingPdf,
  onSavePdf,
  onResetClick,
  onLoadPresetClick,
}) => {
  const handleDownloadCSV = () => {
    downloadCSV(totals);
  };

  return (
    <header className="bg-white border-b border-orange-200/80 shadow-xs">
      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5">
        {/* Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
            <BriefcaseBusiness className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                掛け持ちバイト・副業計算
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                月収＆年収
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              シフトを入力するだけで合計月収・年収・労働時間を即時算出
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onLoadPresetClick}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 rounded-lg transition-colors cursor-pointer"
            title="カフェ＋コンビニ夜勤＋警備などのサンプル構成を入力"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">サンプル例</span>
            <span className="sm:hidden">例</span>
          </button>

          <button
            type="button"
            onClick={onResetClick}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            title="すべての入力を初期状態に戻します"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">リセット</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border border-orange-300 rounded-lg transition-colors cursor-pointer"
            title="Excelやスプレッドシート用CSVダウンロード"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onSavePdf}
            disabled={isSavingPdf}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="PDFファイルを端末に直接保存"
          >
            {isSavingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>{isSavingPdf ? '保存中...' : 'PDF保存'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
