/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Activity,
  ArrowRight,
  Sliders,
  Layers,
  Calendar
} from 'lucide-react';
import {
  CleanedDataPoint,
  DescriptiveStats,
  CostStructure
} from '../../types/pricing';
import { calculateDescriptiveStats } from '../../utils/econometrics';
import { DistributionHistogram } from '../charts/DistributionHistogram';

interface Props {
  data: CleanedDataPoint[];
  costStructure: CostStructure;
  onChangeCostStructure: (val: CostStructure) => void;
  onNext: () => void;
}

export const EdaModule: React.FC<Props> = ({
  data,
  costStructure,
  onChangeCostStructure,
  onNext
}) => {
  const prices = useMemo(() => data.map((d) => d.precio), [data]);
  const quantities = useMemo(() => data.map((d) => d.cantidad), [data]);
  const revenues = useMemo(() => data.map((d) => d.ingresos ?? d.precio * d.cantidad), [data]);

  const priceStats = useMemo(() => calculateDescriptiveStats(prices), [prices]);
  const quantityStats = useMemo(() => calculateDescriptiveStats(quantities), [quantities]);
  const revenueStats = useMemo(() => calculateDescriptiveStats(revenues), [revenues]);

  // Pearson Correlation between P and Q
  const correlation = useMemo(() => {
    const n = data.length;
    if (n < 3) return 0;
    const meanP = priceStats.mean;
    const meanQ = quantityStats.mean;
    let num = 0;
    let denP = 0;
    let denQ = 0;

    for (const d of data) {
      const dp = d.precio - meanP;
      const dq = d.cantidad - meanQ;
      num += dp * dq;
      denP += dp * dp;
      denQ += dq * dq;
    }

    const den = Math.sqrt(denP * denQ);
    return den > 0 ? num / den : 0;
  }, [data, priceStats, quantityStats]);

  // Channel breakdown if available
  const channelBreakdown = useMemo(() => {
    const map: Record<string, { count: number; volume: number; revenue: number }> = {};
    data.forEach((d) => {
      const ch = d.canal || 'Canal Único / General';
      if (!map[ch]) {
        map[ch] = { count: 0, volume: 0, revenue: 0 };
      }
      map[ch].count++;
      map[ch].volume += d.cantidad;
      map[ch].revenue += d.ingresos ?? d.precio * d.cantidad;
    });
    return Object.entries(map).map(([channel, metrics]) => ({
      channel,
      ...metrics
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Módulo 05 · Análisis Exploratorio de Datos (EDA) &amp; Restricciones
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Comportamiento Histórico, Correlaciones y Reglas Operativas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Diagnóstico estadístico descriptivo, dispersión precio-volumen, análisis de canales y parametrización de las restricciones comerciales de producción y margen.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Correlación Precio-Cantidad (r):</span>
            <span
              className={`font-mono font-bold text-lg ${
                correlation < 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600'
              }`}
            >
              r = {correlation.toFixed(3)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {correlation < -0.5
                ? 'Fuerte relación inversa (Ley de Demanda)'
                : 'Relación débil o moderada'}
            </span>
          </div>
        </div>
      </div>

      {/* Descriptive Statistics Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Resumen de Estadísticos Descriptivos
          </h3>
          <p className="text-xs text-slate-500">
            Medidas de tendencia central, dispersión y percentiles de las variables nucleares.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Variable</th>
                <th className="px-3 py-3 text-right">Muestra (N)</th>
                <th className="px-3 py-3 text-right">Media (x̄)</th>
                <th className="px-3 py-3 text-right">Mediana</th>
                <th className="px-3 py-3 text-right">Desv. Est. (s)</th>
                <th className="px-3 py-3 text-right">CV (%)</th>
                <th className="px-3 py-3 text-right">Mínimo</th>
                <th className="px-3 py-3 text-right">P25</th>
                <th className="px-3 py-3 text-right">P75</th>
                <th className="px-3 py-3 text-right">Máximo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 dark:text-slate-100">
                  Precio de Venta ($)
                </td>
                <td className="px-3 py-2.5 text-right">{priceStats.count}</td>
                <td className="px-3 py-2.5 text-right">${priceStats.mean.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">${priceStats.median.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">${priceStats.stdDev.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">{(priceStats.cv * 100).toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right">${priceStats.min.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">${priceStats.p25.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">${priceStats.p75.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">${priceStats.max.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 dark:text-slate-100">
                  Cantidad Demandada (Q)
                </td>
                <td className="px-3 py-2.5 text-right">{quantityStats.count}</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.mean).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.median).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.stdDev).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{(quantityStats.cv * 100).toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.min).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.p25).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.p75).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{Math.round(quantityStats.max).toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 dark:text-slate-100">
                  Ingresos Totales ($)
                </td>
                <td className="px-3 py-2.5 text-right">{revenueStats.count}</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.mean).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.median).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.stdDev).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">{(revenueStats.cv * 100).toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.min).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.p25).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.p75).toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">${Math.round(revenueStats.max).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Histograms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionHistogram
          title="Distribución de Frecuencia del Precio de Venta"
          unit="$"
          values={prices}
          stats={priceStats}
          color="#4f46e5"
        />
        <DistributionHistogram
          title="Distribución de Frecuencia del Volumen de Ventas (Q)"
          unit="un."
          values={quantities}
          stats={quantityStats}
          color="#0ea5e9"
        />
      </div>

      {/* Commercial Breakdown & Business Rules Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Channel Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Desglose Comercial por Canal / Segmento
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de volumen e ingresos para identificar elasticidades cruzadas o de canal.
            </p>
          </div>

          <div className="space-y-3">
            {channelBreakdown.map((ch, idx) => {
              const totalRev = revenueStats.mean * revenueStats.count || 1;
              const revShare = Math.min(100, Math.round((ch.revenue / totalRev) * 100));

              return (
                <div
                  key={idx}
                  className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 bg-slate-50/40 dark:bg-slate-800/20"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ch.channel}
                    </span>
                    <span className="font-mono text-slate-500">
                      {ch.count} periodos · {revShare}% de ingresos
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${revShare}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                    <span>Volumen: {Math.round(ch.volume).toLocaleString()} un.</span>
                    <span>Ingresos: ${Math.round(ch.revenue).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Business Rules Adjuster */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Restricciones de Negocio para el Optimizador
              </h3>
              <p className="text-xs text-slate-500">
                El optimizador no propondrá precios inviables fuera de estos límites.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Precio Mínimo Permitido (Piso) ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={costStructure.minPriceFloor ?? (priceStats.min * 0.8).toFixed(1)}
                  onChange={(e) =>
                    onChangeCostStructure({
                      ...costStructure,
                      minPriceFloor: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Precio Máximo Permitido (Techo) ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={costStructure.maxPriceCeiling ?? (priceStats.max * 1.3).toFixed(1)}
                  onChange={(e) =>
                    onChangeCostStructure({
                      ...costStructure,
                      maxPriceCeiling: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Capacidad Máxima de Producción / Inventario (unidades)
                </label>
                <input
                  type="number"
                  step="100"
                  value={costStructure.capacityLimit ?? Math.round(quantityStats.max * 1.25)}
                  onChange={(e) =>
                    onChangeCostStructure({
                      ...costStructure,
                      capacityLimit: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNext}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar a Curvas de Demanda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
