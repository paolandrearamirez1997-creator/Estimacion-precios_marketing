/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ElasticityAnalysis } from '../../types/pricing';

interface Props {
  elasticity: ElasticityAnalysis;
  currentPrice: number;
  optimalPrice: number;
}

export const ElasticitySpectrumChart: React.FC<Props> = ({
  elasticity,
  currentPrice,
  optimalPrice
}) => {
  const curE = elasticity.pointElasticityAtCurrentPrice;
  const optE = elasticity.pointElasticityAtOptimalPrice;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Espectro de Elasticidad Precio de la Demanda (PED)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comportamiento microeconómico y sensibilidad de ingresos ante variaciones de precio
          </p>
        </div>
        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          |ε| Actual: {Math.abs(curE).toFixed(2)} ({elasticity.type.toUpperCase()})
        </span>
      </div>

      {/* Spectrum Bar */}
      <div className="relative mt-6 mb-8 pt-4">
        {/* Color Bands */}
        <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-semibold text-white">
          <div className="w-1/3 bg-emerald-600 flex items-center justify-center">
            Inelástica (|ε| &lt; 1.0)
          </div>
          <div className="w-1/6 bg-amber-500 flex items-center justify-center">
            Unitaria (=1.0)
          </div>
          <div className="w-1/2 bg-indigo-600 flex items-center justify-center">
            Elástica (|ε| &gt; 1.0)
          </div>
        </div>

        {/* Current Price Marker */}
        <div
          className="absolute -top-3 -translate-x-1/2 flex flex-col items-center"
          style={{
            left: `${Math.min(95, Math.max(5, (Math.abs(curE) / 2.5) * 100))}%`
          }}
        >
          <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow">
            P. Actual: ${currentPrice.toFixed(2)} (ε = {curE.toFixed(2)})
          </span>
          <div className="w-0.5 h-6 bg-slate-900 mt-0.5" />
        </div>

        {/* Optimal Price Marker */}
        <div
          className="absolute top-10 -translate-x-1/2 flex flex-col items-center"
          style={{
            left: `${Math.min(95, Math.max(5, (Math.abs(optE) / 2.5) * 100))}%`
          }}
        >
          <div className="w-0.5 h-6 bg-emerald-600" />
          <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow mt-0.5">
            P* Óptimo: ${optimalPrice.toFixed(2)} (ε = {optE.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Microeconomic explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-6 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-lg">
          <div className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
            Zona Inelástica (|ε| &lt; 1.0)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            ↑ Precio → ↑ Ingresos Totales. La pérdida en volumen es menor que la ganancia por unidad. Oportunidad para capturar margen.
          </p>
        </div>

        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-lg">
          <div className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
            Elasticidad Unitaria (|ε| = 1.0)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            Ingresos Totales en su punto máximo (dIT/dP = 0). Cambios de precio no alteran los ingresos brutos, pero sí pueden modificar los costos.
          </p>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 rounded-lg">
          <div className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
            Zona Elástica (|ε| &gt; 1.0)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            ↑ Precio → ↓ Ingresos Totales. Alta sensibilidad del consumidor a sustitutos o competidores. Bajar precio puede aumentar la facturación.
          </p>
        </div>
      </div>
    </div>
  );
};
