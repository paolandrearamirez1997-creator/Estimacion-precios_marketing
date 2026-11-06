/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Rocket,
  Swords,
  PackagePlus,
  Coins,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import {
  StrategicRecommendation,
  OptimizationResult,
  ElasticityAnalysis,
  CostStructure
} from '../../types/pricing';

interface Props {
  recommendations: StrategicRecommendation[];
  optimization: OptimizationResult;
  elasticity: ElasticityAnalysis;
  costStructure: CostStructure;
  onNext: () => void;
}

export const PricingStrategyModule: React.FC<Props> = ({
  recommendations,
  optimization,
  elasticity,
  costStructure,
  onNext
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lanzamiento' | 'competencia' | 'complementarios' | 'tacticas'>('all');

  const filtered = selectedFilter === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category === selectedFilter);

  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    lanzamiento: <Rocket className="w-4 h-4 text-indigo-600" />,
    competencia: <Swords className="w-4 h-4 text-rose-600" />,
    complementarios: <PackagePlus className="w-4 h-4 text-blue-600" />,
    tacticas: <Coins className="w-4 h-4 text-amber-600" />
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Módulo 10 · Políticas &amp; Estrategias de Precios
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Recomendaciones Estratégicas Sustentadas en Evidencia Empírica
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Directrices comerciales fundamentadas en la elasticidad precio calculada (|ε| = {Math.abs(elasticity.pointElasticityAtCurrentPrice).toFixed(2)}), el precio óptimo económico ($ {optimization.optimalProfitPrice.toFixed(2)}) y la literatura académica (Hermann Simon, Thomas Nagle).
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas las Recomendaciones ({recommendations.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('lanzamiento')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedFilter === 'lanzamiento'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Lanzamiento &amp; Penetración
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('competencia')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedFilter === 'competencia'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Respuesta Competitiva
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('complementarios')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedFilter === 'complementarios'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Paquetes &amp; Bundling
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('tacticas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedFilter === 'tacticas'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Psicológicos &amp; Segmentación
          </button>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rec, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {CATEGORY_ICONS[rec.category] || <Lightbulb className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {rec.category.toUpperCase()} · {rec.strategyName}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {rec.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Precio Objetivo:</span>
                  <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                    ${rec.recommendedPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {rec.description}
              </p>

              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="font-medium text-[11px] leading-snug">
                    Impacto Estimado: {rec.expectedImpact}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span className="text-[11px] leading-snug">
                    Riesgo &amp; Mitigación: {rec.risksAndMitigation}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Idoneidad con Datos Actuales:
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase text-[10px] tracking-wider">
                {rec.suitabilityScore} Prioridad
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Academic Citation Box */}
      <div className="p-4 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
          Referencia Metodológica de Pricing:
        </span>
        <p className="text-[11px] leading-relaxed">
          Las estrategias implementan los principios de fijación basada en valor de <em>Thomas Nagle (The Strategy and Tactics of Pricing)</em> y el aprovechamiento de curvas no lineales y psicología del precio de <em>Hermann Simon (Confessions of the Pricing Man)</em>.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Continuar a Dashboard Ejecutivo &amp; Reporte</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
