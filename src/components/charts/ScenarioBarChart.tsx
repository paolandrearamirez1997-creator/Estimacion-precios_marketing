/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScenarioSummary } from '../../types/pricing';

interface Props {
  scenarios: {
    pessimistic: ScenarioSummary;
    base: ScenarioSummary;
    optimistic: ScenarioSummary;
  };
}

export const ScenarioBarChart: React.FC<Props> = ({ scenarios }) => {
  const items = [
    { ...scenarios.pessimistic, label: 'Pesimista (-15% Demanda)', color: 'bg-rose-500', barColor: '#f43f5e' },
    { ...scenarios.base, label: 'Base (Condiciones Actuales)', color: 'bg-indigo-600', barColor: '#4f46e5' },
    { ...scenarios.optimistic, label: 'Optimista (+15% Demanda)', color: 'bg-emerald-500', barColor: '#10b981' }
  ];

  const maxVal = Math.max(...items.map((i) => i.revenue)) * 1.15;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Comparativa de Escenarios de Estrés (Base, Optimista y Pesimista)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resiliencia de la utilidad y los ingresos ante shocks exógenos de mercado y costos
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Utilidad Neta</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((sc, idx) => {
          const revHeightPct = Math.min(100, Math.max(10, (sc.revenue / maxVal) * 100));
          const profHeightPct = Math.min(100, Math.max(5, (Math.max(0, sc.profit) / maxVal) * 100));

          return (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
            >
              <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {sc.label}
                </span>
                <span className="text-[11px] text-slate-500">
                  Precio P*: ${sc.price.toFixed(2)} · Vol: {Math.round(sc.quantity).toLocaleString()} un.
                </span>
              </div>

              {/* Mini visual bar stack */}
              <div className="h-28 flex items-end justify-center gap-4 py-2">
                <div className="flex flex-col items-center gap-1 h-full justify-end w-12">
                  <span className="text-[10px] font-mono text-slate-500">
                    ${(sc.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full bg-blue-600 rounded-t transition-all duration-500"
                    style={{ height: `${revHeightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Ingresos</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end w-12">
                  <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ${(sc.profit / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all duration-500"
                    style={{ height: `${profHeightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Utilidad</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                <span className="text-slate-500">Margen Rentable:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {sc.marginPct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
