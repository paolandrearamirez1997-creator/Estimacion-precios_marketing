/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DescriptiveStats } from '../../types/pricing';

interface Props {
  title: string;
  unit: string;
  values: number[];
  stats: DescriptiveStats;
  color?: string;
}

export const DistributionHistogram: React.FC<Props> = ({
  title,
  unit,
  values,
  stats,
  color = '#4f46e5'
}) => {
  if (!values || values.length === 0) return null;

  const binsCount = 10;
  const min = stats.min;
  const max = stats.max;
  const binWidth = (max - min) / binsCount || 1;

  const bins: { label: string; count: number; start: number; end: number }[] = Array.from(
    { length: binsCount }
  ).map((_, i) => {
    const start = min + i * binWidth;
    const end = start + binWidth;
    return {
      label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count: 0,
      start,
      end
    };
  });

  values.forEach((v) => {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= binsCount) idx = binsCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  });

  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          {title}
        </h5>
        <span className="text-[11px] font-mono text-slate-500">
          Media: {stats.mean.toFixed(2)} {unit} · CV: {(stats.cv * 100).toFixed(1)}%
        </span>
      </div>

      {/* Histogram bars */}
      <div className="h-32 flex items-end gap-1.5 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        {bins.map((b, i) => {
          const heightPct = Math.max(4, (b.count / maxCount) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div
                className="w-full rounded-t transition-all group-hover:opacity-80"
                style={{ height: `${heightPct}%`, backgroundColor: color }}
              />
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10 transition-opacity">
                {b.count} obs ({b.label})
              </div>
            </div>
          );
        })}
      </div>

      {/* Range labels */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
        <span>Min: {stats.min.toFixed(1)}</span>
        <span>P50: {stats.median.toFixed(1)}</span>
        <span>Max: {stats.max.toFixed(1)}</span>
      </div>
    </div>
  );
};
