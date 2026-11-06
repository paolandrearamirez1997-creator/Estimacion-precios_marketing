/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingDown,
  ArrowRight,
  HelpCircle,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ElasticityAnalysis } from '../../types/pricing';
import { ElasticitySpectrumChart } from '../charts/ElasticitySpectrumChart';

interface Props {
  elasticity: ElasticityAnalysis;
  currentPrice: number;
  optimalPrice: number;
  onNext: () => void;
}

export const ElasticityModule: React.FC<Props> = ({
  elasticity,
  currentPrice,
  optimalPrice,
  onNext
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Módulo 07 · Elasticidad Precio de la Demanda (PED)
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Sensibilidad al Precio, Elasticidad Puntual y de Arco
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            La elasticidad precio de la demanda mide el porcentaje de cambio en las unidades vendidas ante una variación del 1% en el precio. Es el concepto central para determinar si subir o bajar precios maximizará la facturación.
          </p>
        </div>
      </div>

      {/* Visual Spectrum */}
      <ElasticitySpectrumChart
        elasticity={elasticity}
        currentPrice={currentPrice}
        optimalPrice={optimalPrice}
      />

      {/* Diagnostic & Advice Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          Dictamen Microeconómico &amp; Recomendación Directa
        </h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {elasticity.explanation}
        </p>
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-xs text-indigo-900 dark:text-indigo-300 font-medium">
          {elasticity.pricingAdvice}
        </div>
      </div>

      {/* Sensitivity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Matriz de Sensibilidad de Demanda e Ingresos ante Variaciones de Precio
          </h3>
          <p className="text-xs text-slate-500">
            Simulación de variaciones porcentuales del precio actual y su impacto en cantidad e ingresos brutos.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800 font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-2.5">Variación Precio (ΔP %)</th>
                <th className="px-3 py-2.5 text-right">Precio Simulado ($)</th>
                <th className="px-3 py-2.5 text-right">Demanda Esperada (Q)</th>
                <th className="px-3 py-2.5 text-right">Variación Demanda (ΔQ %)</th>
                <th className="px-3 py-2.5 text-right">Ingresos Proyectados ($)</th>
                <th className="px-3 py-2.5 text-right">Variación Ingresos (ΔIT %)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {elasticity.sensitivityTable.map((row) => {
                const isPositiveRev = row.revenueVariationPct > 0;
                const isZero = row.priceVariationPct === 0;

                return (
                  <tr
                    key={row.priceVariationPct}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                      isZero ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="px-4 py-2">
                      {row.priceVariationPct > 0 ? `+${row.priceVariationPct}%` : `${row.priceVariationPct}%`}
                    </td>
                    <td className="px-3 py-2 text-right">${row.simulatedPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{Math.round(row.simulatedQuantity).toLocaleString()} un.</td>
                    <td
                      className={`px-3 py-2 text-right ${
                        row.quantityVariationPct < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {row.quantityVariationPct > 0 ? `+${row.quantityVariationPct.toFixed(1)}%` : `${row.quantityVariationPct.toFixed(1)}%`}
                    </td>
                    <td className="px-3 py-2 text-right">${Math.round(row.simulatedRevenue).toLocaleString()}</td>
                    <td
                      className={`px-3 py-2 text-right font-bold ${
                        isPositiveRev ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.revenueVariationPct > 0 ? `+${row.revenueVariationPct.toFixed(1)}%` : `${row.revenueVariationPct.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pedagogical Note: Movement along curve vs Curve Shifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
            Movimiento SOBRE la Curva de Demanda
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            Ocurre única y exclusivamente por un cambio en el <strong>precio del propio producto</strong>. Si aumentamos el precio de $15 a $18, nos deslizamos hacia arriba sobre la misma función matemática; la función de demanda no ha cambiado, solo la cantidad demandada.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            Desplazamiento DE la Curva de Demanda (Shifts)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            Ocurre cuando cambian <strong>factores externos exógenos</strong>: aumento del poder adquisitivo de los clientes, una campaña masiva de marketing, o un aumento en el precio del competidor. La curva entera se desplaza hacia la derecha, vendiendo más unidades a todos los niveles de precio.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Continuar a Costos &amp; Profit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
