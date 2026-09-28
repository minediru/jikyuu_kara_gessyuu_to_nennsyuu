import { Job, JobCalculation, TotalCalculation } from '../types';

export const JOB_COLORS = [
  {
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    border: 'border-orange-500',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    dotBg: 'bg-orange-500',
    barHex: '#f97316',
  },
  {
    bg: 'bg-blue-600',
    text: 'text-blue-700',
    border: 'border-blue-600',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    dotBg: 'bg-blue-600',
    barHex: '#2563eb',
  },
  {
    bg: 'bg-emerald-600',
    text: 'text-emerald-700',
    border: 'border-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotBg: 'bg-emerald-600',
    barHex: '#059669',
  },
  {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    dotBg: 'bg-amber-500',
    barHex: '#d97706',
  },
  {
    bg: 'bg-purple-600',
    text: 'text-purple-700',
    border: 'border-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    dotBg: 'bg-purple-600',
    barHex: '#9333ea',
  },
  {
    bg: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-rose-500',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    dotBg: 'bg-rose-500',
    barHex: '#e11d48',
  },
  {
    bg: 'bg-teal-600',
    text: 'text-teal-700',
    border: 'border-teal-600',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    dotBg: 'bg-teal-600',
    barHex: '#0d9488',
  },
  {
    bg: 'bg-indigo-600',
    text: 'text-indigo-700',
    border: 'border-indigo-600',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    dotBg: 'bg-indigo-600',
    barHex: '#4f46e5',
  },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    name: 'カフェ',
    wageType: 'hourly',
    wageAmount: 1200,
    hoursPerDay: 5,
    frequencyType: 'weekly',
    frequencyDays: 3,
  },
];

export const PRESET_SAMPLE_JOBS: Job[] = [
  {
    id: 'preset-1',
    name: 'カフェ店員',
    wageType: 'hourly',
    wageAmount: 1200,
    hoursPerDay: 5,
    frequencyType: 'weekly',
    frequencyDays: 3,
  },
  {
    id: 'preset-2',
    name: 'コンビニ夜勤',
    wageType: 'hourly',
    wageAmount: 1450,
    hoursPerDay: 7,
    frequencyType: 'weekly',
    frequencyDays: 2,
  },
  {
    id: 'preset-3',
    name: '週末イベント警備',
    wageType: 'daily',
    wageAmount: 11000,
    hoursPerDay: 8,
    frequencyType: 'monthly',
    frequencyDays: 2,
  },
];

export function calculateJob(job: Job, index: number): Omit<JobCalculation, 'percentage'> {
  const color = JOB_COLORS[index % JOB_COLORS.length];
  const displayName = job.name.trim() || `仕事 ${index + 1}`;

  const hours = Math.max(0, job.hoursPerDay || 0);
  const wage = Math.max(0, job.wageAmount || 0);
  const freqDays = Math.max(0, job.frequencyDays || 0);

  // 1日あたりの給与
  const dailyIncome = job.wageType === 'hourly' ? wage * hours : wage;

  let weeklyIncome = 0;
  let annualIncome = 0;
  let monthlyIncome = 0;
  let weeklyHours = 0;
  let monthlyHours = 0;

  if (job.frequencyType === 'weekly') {
    // 週○日の場合
    weeklyIncome = dailyIncome * freqDays;
    annualIncome = weeklyIncome * 52;
    monthlyIncome = annualIncome / 12;

    if (job.wageType === 'hourly') {
      weeklyHours = hours * freqDays;
      monthlyHours = hours * freqDays * (52 / 12);
    }
  } else {
    // 月○日の場合
    monthlyIncome = dailyIncome * freqDays;
    annualIncome = monthlyIncome * 12;
    weeklyIncome = annualIncome / 52;

    if (job.wageType === 'hourly') {
      monthlyHours = hours * freqDays;
      weeklyHours = monthlyHours / (52 / 12);
    }
  }

  return {
    job,
    displayName,
    dailyIncome: Math.round(dailyIncome),
    weeklyIncome: Math.round(weeklyIncome),
    monthlyIncome: Math.round(monthlyIncome),
    annualIncome: Math.round(annualIncome),
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    monthlyHours: Math.round(monthlyHours * 10) / 10,
    color,
  };
}

export function calculateTotals(jobs: Job[]): TotalCalculation {
  const preliminaryItems = jobs.map((job, idx) => calculateJob(job, idx));

  const totalMonthlyIncome = preliminaryItems.reduce((acc, item) => acc + item.monthlyIncome, 0);
  const totalAnnualIncome = preliminaryItems.reduce((acc, item) => acc + item.annualIncome, 0);
  const totalMonthlyHours = Math.round(preliminaryItems.reduce((acc, item) => acc + item.monthlyHours, 0) * 10) / 10;
  const totalWeeklyHours = Math.round(preliminaryItems.reduce((acc, item) => acc + item.weeklyHours, 0) * 10) / 10;

  const hourlyJobsCount = jobs.filter((j) => j.wageType === 'hourly').length;
  const dailyJobsCount = jobs.filter((j) => j.wageType === 'daily').length;

  const items: JobCalculation[] = preliminaryItems.map((item) => {
    const percentage = totalMonthlyIncome > 0 ? (item.monthlyIncome / totalMonthlyIncome) * 100 : 0;
    return {
      ...item,
      percentage: Math.round(percentage * 10) / 10,
    };
  });

  return {
    totalMonthlyIncome,
    totalAnnualIncome,
    totalMonthlyHours,
    totalWeeklyHours,
    hourlyJobsCount,
    dailyJobsCount,
    totalJobsCount: jobs.length,
    items,
  };
}

export function formatYen(amount: number): string {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
}

export function formatYenJapanese(amount: number): string {
  return `${Math.round(amount).toLocaleString('ja-JP')}円`;
}

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
}

export function generateCSV(totals: TotalCalculation): string {
  // UTF-8 BOM
  const bom = '\uFEFF';

  // Headers specified: 仕事名, 給与形態, 単価, 1日の時間, 頻度, 月収, 年収
  const header = ['仕事名', '給与形態', '単価(円)', '1日の労働時間', '働く頻度', '月収見込(円)', '年収見込(円)', '収入割合(%)'];

  const rows = totals.items.map((item) => {
    const job = item.job;
    const wageTypeName = job.wageType === 'hourly' ? '時給' : '日給';
    const hoursStr = job.wageType === 'hourly' ? `${job.hoursPerDay}時間` : '—';
    const freqStr = job.frequencyType === 'weekly' ? `週${job.frequencyDays}日` : `月${job.frequencyDays}日`;

    return [
      `"${item.displayName.replace(/"/g, '""')}"`,
      wageTypeName,
      job.wageAmount,
      `"${hoursStr}"`,
      `"${freqStr}"`,
      item.monthlyIncome,
      item.annualIncome,
      `${item.percentage}%`,
    ].join(',');
  });

  // Total summary row
  const totalRow = [
    '"合計"',
    `"時給${totals.hourlyJobsCount}件 / 日給${totals.dailyJobsCount}件"`,
    '""',
    `"月 約${formatHours(totals.totalMonthlyHours)}時間 (週 約${formatHours(totals.totalWeeklyHours)}時間)"`,
    '""',
    totals.totalMonthlyIncome,
    totals.totalAnnualIncome,
    '"100%"',
  ].join(',');

  const noteRow = ['"※計算基準: 1年=52週、1ヶ月=約4.33週(52週÷12ヶ月)として算出。税金・深夜手当等は含みません。"'].join(',');

  return bom + [header.join(','), ...rows, totalRow, '', noteRow].join('\r\n');
}

export function downloadCSV(totals: TotalCalculation) {
  const csvContent = generateCSV(totals);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `掛け持ちバイト収入シミュレーション_${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Japanese Tax & Exemption Thresholds (年収の壁 reference)
export interface TaxThreshold {
  amount: number;
  label: string;
  shortDesc: string;
  fullDesc: string;
  badge: string;
}

export const TAX_THRESHOLDS: TaxThreshold[] = [
  {
    amount: 1030000,
    label: '103万円の壁',
    shortDesc: '所得税・扶養控除の基準',
    fullDesc: '年収103万円を超えると所得税の課税対象となり、親や配偶者の扶養親族控除の適用区分が変わります。',
    badge: '学生・配偶者注目',
  },
  {
    amount: 1060000,
    label: '106万円の壁',
    shortDesc: '社会保険加入（大企業基準）',
    fullDesc: '従業員数51人以上の企業で週20時間以上かつ月収8.8万円以上勤務する場合、社会保険加入義務が生じます。',
    badge: '社保加入',
  },
  {
    amount: 1300000,
    label: '130万円の壁',
    shortDesc: '社会保険の扶養から外れる基準',
    fullDesc: '企業の規模に関係なく、年収130万円以上になると親や配偶者の社会保険の扶養から完全に外れ、自身で保険料負担が発生します。',
    badge: '扶養完全脱退',
  },
  {
    amount: 1500000,
    label: '150万円の壁',
    shortDesc: '配偶者特別控除（満額適用限度）',
    fullDesc: '配偶者控除の満額38万円が受けられる上限額です。150万円を超えると控除額が段階的に減少し、201万円でゼロになります。',
    badge: '配偶者控除満額',
  },
];
