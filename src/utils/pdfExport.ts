import { jsPDF } from 'jspdf';
import { TotalCalculation } from '../types';
import { formatHours, formatYen } from './calculator';

// Helper to draw rounded rectangle with cross-browser fallback
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth: number = 1
) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

export async function generateIncomePDF(
  totals: TotalCalculation,
  customFilename?: string
): Promise<void> {
  // Ensure web fonts are ready if available
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue anyway
    }
  }

  const canvas = document.createElement('canvas');
  const width = 1600;
  // Calculate dynamic height based on number of jobs
  const baseHeight = 1600;
  const tableRowsHeight = totals.items.length * 60;
  const height = Math.max(2260, baseHeight + tableRowsHeight);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // 1. Clean White Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const marginX = 80;
  let currentY = 80;

  // 2. Top Header
  // Top brand orange strip
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(marginX, currentY, 1440, 6);
  currentY += 28;

  // App Tag
  ctx.font = 'bold 22px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#ea580c';
  ctx.fillText('掛け持ちバイト・副業 月収＆年収シミュレーター', marginX, currentY);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.font = 'normal 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';
  ctx.fillText(`作成日: ${dateStr}`, width - marginX, currentY);
  ctx.textAlign = 'left';

  currentY += 45;

  // Main Title
  ctx.font = '900 42px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('収入試算・シミュレーション結果シート', marginX, currentY);

  currentY += 32;

  // Subtitle
  ctx.font = 'normal 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('※税金・社会保険料控除前の総支給（額面）理論値レポート（対象: ' + totals.items.length + '件の仕事）', marginX, currentY);

  currentY += 40;

  // Horizontal divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, currentY);
  ctx.lineTo(width - marginX, currentY);
  ctx.stroke();

  currentY += 40;

  // 3. Three KPI Highlight Cards
  const cardWidth = (1440 - 40) / 3;
  const cardHeight = 170;

  // Card 1: 合計月収 (予測)
  drawRoundedRect(ctx, marginX, currentY, cardWidth, cardHeight, 18, '#fff7ed', '#fdba74', 2.5);
  ctx.font = 'bold 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#9a3412';
  ctx.fillText('合計月収（予測）', marginX + 24, currentY + 42);

  ctx.font = 'bold 15px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#ea580c';
  ctx.textAlign = 'right';
  ctx.fillText('手取り目安基準', marginX + cardWidth - 24, currentY + 42);
  ctx.textAlign = 'left';

  ctx.font = '900 48px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#ea580c';
  ctx.fillText(formatYen(totals.totalMonthlyIncome), marginX + 24, currentY + 110);

  ctx.font = 'normal 18px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#7c2d12';
  ctx.fillText('現在のシフトに基づく月間総支給見込', marginX + 24, currentY + 145);

  // Card 2: 合計年収 (予測)
  const card2X = marginX + cardWidth + 20;
  drawRoundedRect(ctx, card2X, currentY, cardWidth, cardHeight, 18, '#f8fafc', '#e2e8f0', 2);
  ctx.font = 'bold 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('合計年収（予測）', card2X + 24, currentY + 42);

  ctx.font = '900 44px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(formatYen(totals.totalAnnualIncome), card2X + 24, currentY + 110);

  ctx.font = 'normal 18px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('年間52週換算の総額', card2X + 24, currentY + 145);

  // Card 3: 総労働時間
  const card3X = marginX + (cardWidth + 20) * 2;
  drawRoundedRect(ctx, card3X, currentY, cardWidth, cardHeight, 18, '#f8fafc', '#e2e8f0', 2);
  ctx.font = 'bold 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('総労働時間（時給制合算）', card3X + 24, currentY + 42);

  ctx.font = '900 40px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`月 約${formatHours(totals.totalMonthlyHours)}時間`, card3X + 24, currentY + 110);

  ctx.font = 'normal 18px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`週 約${formatHours(totals.totalWeeklyHours)}時間（時給制${totals.hourlyJobsCount}件）`, card3X + 24, currentY + 145);

  currentY += cardHeight + 40;

  // 4. Breakdown Bar
  drawRoundedRect(ctx, marginX, currentY, 1440, 140, 16, '#f8fafc', '#e2e8f0', 1.5);

  ctx.font = 'bold 22px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('収入の内訳（月収構成比）', marginX + 24, currentY + 36);

  // The Bar
  const barY = currentY + 54;
  const barWidth = 1440 - 48;
  const barHeight = 36;
  const barX = marginX + 24;

  drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 8, '#e2e8f0');

  let currentBarX = barX;
  totals.items.forEach((item, index) => {
    if (item.percentage <= 0) return;
    const segWidth = (item.percentage / 100) * barWidth;
    ctx.fillStyle = item.color.barHex;
    // Draw segment
    if (index === 0 && totals.items.length === 1) {
      drawRoundedRect(ctx, currentBarX, barY, segWidth, barHeight, 8, item.color.barHex);
    } else {
      ctx.fillRect(currentBarX, barY, segWidth, barHeight);
    }

    if (item.percentage >= 8) {
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.percentage}%`, currentBarX + segWidth / 2, barY + 24);
      ctx.textAlign = 'left';
    }

    currentBarX += segWidth;
  });

  // Legend
  let legendX = marginX + 24;
  const legendY = currentY + 115;
  totals.items.forEach((item) => {
    ctx.fillStyle = item.color.barHex;
    ctx.beginPath();
    ctx.arc(legendX + 8, legendY - 6, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 16px system-ui, -apple-system, "Noto Sans JP", sans-serif';
    ctx.fillStyle = '#1e293b';
    const text = `${item.displayName}: ${formatYen(item.monthlyIncome)} (${item.percentage}%)`;
    ctx.fillText(text, legendX + 22, legendY);

    legendX += ctx.measureText(text).width + 36;
  });

  currentY += 175;

  // 5. Details Table
  ctx.font = '900 24px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('仕事別 明細一覧', marginX, currentY);

  currentY += 20;

  // Table Columns
  // Total width: 1440
  // Cols: # (60), 仕事名 (320), 給与形態 (130), 単価 (170), 1日時間 (180), 頻度 (170), 月収 (210), 年収 (200)
  const cols = [
    { label: '#', width: 60, align: 'center' },
    { label: '仕事名', width: 320, align: 'left' },
    { label: '給与形態', width: 130, align: 'center' },
    { label: '単価', width: 170, align: 'right' },
    { label: '1日の労働時間', width: 180, align: 'center' },
    { label: '働く頻度', width: 170, align: 'center' },
    { label: '月収見込', width: 210, align: 'right' },
    { label: '年収見込', width: 200, align: 'right' },
  ];

  // Table Header Row
  const tableHeaderY = currentY;
  const rowHeight = 52;
  drawRoundedRect(ctx, marginX, tableHeaderY, 1440, rowHeight, 10, '#f1f5f9', '#cbd5e1', 1.5);

  ctx.font = 'bold 18px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#334155';

  let colX = marginX;
  cols.forEach((col) => {
    let textX = colX + col.width / 2;
    if (col.align === 'left') textX = colX + 20;
    if (col.align === 'right') textX = colX + col.width - 20;

    ctx.textAlign = col.align as CanvasTextAlign;
    ctx.fillText(col.label, textX, tableHeaderY + 33);
    colX += col.width;
  });
  ctx.textAlign = 'left';

  currentY += rowHeight;

  // Table Data Rows
  totals.items.forEach((item, index) => {
    const rowY = currentY;
    const isEven = index % 2 === 0;

    ctx.fillStyle = isEven ? '#ffffff' : '#f8fafc';
    ctx.fillRect(marginX, rowY, 1440, rowHeight);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(marginX, rowY, 1440, rowHeight);

    const values = [
      `${index + 1}`,
      item.displayName,
      item.job.wageType === 'hourly' ? '時給制' : '日給制',
      `¥${item.job.wageAmount.toLocaleString()}`,
      item.job.wageType === 'hourly' ? `${item.job.hoursPerDay}時間` : '—',
      item.job.frequencyType === 'weekly' ? `週 ${item.job.frequencyDays}日` : `月 ${item.job.frequencyDays}日`,
      formatYen(item.monthlyIncome),
      formatYen(item.annualIncome),
    ];

    let cellX = marginX;
    values.forEach((val, valIdx) => {
      const col = cols[valIdx];
      let textX = cellX + col.width / 2;
      if (col.align === 'left') textX = cellX + 20;
      if (col.align === 'right') textX = cellX + col.width - 20;

      ctx.textAlign = col.align as CanvasTextAlign;

      if (valIdx === 1) {
        // Job name in bold with color indicator
        ctx.fillStyle = item.color.barHex;
        ctx.beginPath();
        ctx.arc(cellX + 16, rowY + rowHeight / 2, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 18px system-ui, -apple-system, "Noto Sans JP", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(val, cellX + 32, rowY + 33);
      } else if (valIdx === 6) {
        // Monthly Income highlight
        ctx.font = 'bold 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
        ctx.fillStyle = '#ea580c';
        ctx.fillText(val, textX, rowY + 33);
      } else {
        ctx.font = 'normal 18px system-ui, -apple-system, "Noto Sans JP", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(val, textX, rowY + 33);
      }

      cellX += col.width;
    });

    currentY += rowHeight;
  });

  // Table Footer (Total Row)
  const footerRowY = currentY;
  drawRoundedRect(ctx, marginX, footerRowY, 1440, 60, 10, '#fff7ed', '#fdba74', 2);

  ctx.font = 'bold 20px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.fillText(`合計 (${totals.totalJobsCount}件)`, marginX + 20, footerRowY + 37);

  ctx.font = 'normal 17px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(
    `時給${totals.hourlyJobsCount}件 / 日給${totals.dailyJobsCount}件（月 約${formatHours(totals.totalMonthlyHours)}h）`,
    marginX + 200,
    footerRowY + 37
  );

  // Total Monthly
  ctx.font = '900 24px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#ea580c';
  ctx.textAlign = 'right';
  ctx.fillText(formatYen(totals.totalMonthlyIncome), marginX + 1440 - 220, footerRowY + 38);

  // Total Annual
  ctx.font = '900 22px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(formatYen(totals.totalAnnualIncome), marginX + 1440 - 20, footerRowY + 38);
  ctx.textAlign = 'left';

  currentY += 80;

  // 6. Calculation Conditions & Footer Notes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginX, currentY);
  ctx.lineTo(width - marginX, currentY);
  ctx.stroke();

  currentY += 28;

  ctx.font = 'bold 17px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('【計算条件とご留意事項】', marginX, currentY);

  currentY += 25;
  ctx.font = 'normal 16px system-ui, -apple-system, "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#64748b';
  const notes = [
    '・「週○日」勤務の換算：週給 = 1日給与 × 週日数 / 年収 = 週給 × 52週 / 月収 = 年収 ÷ 12ヶ月（1ヶ月＝約4.33週）として計算しています。',
    '・「月○日」勤務の換算：月収 = 1日給与 × 月日数 / 年収 = 月収 × 12ヶ月として計算しています。',
    '・労働時間は時給制の仕事のみ合算しています（日給制の仕事は除外しています）。',
    '・本シミュレーション結果は額面上の計算値です。税金（所得税・住民税）や社会保険料の控除、ならびに交通費支給や深夜割増手当等は含まれておりません。',
  ];

  notes.forEach((note) => {
    ctx.fillText(note, marginX, currentY);
    currentY += 24;
  });

  // 7. Convert Canvas to PDF
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const marginMm = 8;
  const printableWidth = pdfWidth - marginMm * 2;
  const contentHeight = (canvas.height * printableWidth) / canvas.width;

  if (contentHeight <= pdfHeight - marginMm * 2) {
    // Fits comfortably on single page
    pdf.addImage(imgData, 'PNG', marginMm, marginMm, printableWidth, contentHeight, undefined, 'FAST');
  } else {
    // Fit to single page proportionally
    const scaledHeight = pdfHeight - marginMm * 2;
    const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
    const offsetX = (pdfWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', offsetX, marginMm, scaledWidth, scaledHeight, undefined, 'FAST');
  }

  // Generate Filename
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const filename = customFilename || `掛け持ちバイト収入シミュレーション_${yyyy}${mm}${dd}.pdf`;

  // Output blob and trigger browser download
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();

  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
