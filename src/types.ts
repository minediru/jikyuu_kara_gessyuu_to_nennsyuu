export type WageType = 'hourly' | 'daily';
export type FrequencyType = 'weekly' | 'monthly';

export interface Job {
  id: string;
  name: string;
  wageType: WageType;
  wageAmount: number; // 円 (時給 or 日給)
  hoursPerDay: number; // 1日の労働時間 (時給のみ使用)
  frequencyType: FrequencyType; // 'weekly' | 'monthly'
  frequencyDays: number; // 週○日 or 月○日
}

export interface JobCalculation {
  job: Job;
  displayName: string;
  dailyIncome: number;
  weeklyIncome: number;
  monthlyIncome: number;
  annualIncome: number;
  weeklyHours: number;
  monthlyHours: number;
  percentage: number; // 0 - 100
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    dotBg: string;
    barHex: string;
  };
}

export interface TotalCalculation {
  totalMonthlyIncome: number;
  totalAnnualIncome: number;
  totalMonthlyHours: number;
  totalWeeklyHours: number;
  hourlyJobsCount: number;
  dailyJobsCount: number;
  totalJobsCount: number;
  items: JobCalculation[];
}
