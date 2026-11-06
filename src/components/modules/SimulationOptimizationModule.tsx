/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sliders,
  TrendingUp,
  Download,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import {
  OptimizationResult,
  CostStructure,
  RegressionResult,
  ScenarioPoint
} from '../../types/pricing';
import { ProfitRevenueChart } from '../charts/ProfitRevenueChart';
import { ScenarioBarChart } from '../charts/ScenarioBarChart';
import { exportSimulationCSV } from '../../utils/exportUtils';

interface Props {
  optimization: OptimizationResult;
  model: RegressionResult;
  costStructure: CostStructure;
  currentPrice: number;
  onSetSimulatedPrice: (p: number) => void;
  onNext: () => void;
}

export const SimulationOptimizationModule: React.FC<Props> = ({
  optimization,
  model,
  costStructure,
  currentPrice,
  onSetSimulatedPrice,
  onNext
}) => {
  // Live slider state
  const [sliderPrice, setSliderPrice] = useState<number>(optimization.optimalProfitPrice);
  const [filterFeasibleOnly, setFilterFeasibleOnly] = useState(false);

  // Compute live sandbox metrics
  const simQ = model.predict(sliderPrice);
  const simRev = sliderPrice * simQ;
  const simVarCost = costStructure.variableCostPerUnit * simQ;
  const simTotCost = costStructure.fixedCosts + simVarCost;
  const simProfit = simRev - simTotCost;
  const simMarginPct = simRev > 0 ? (simProfit / simRev) * 100 : 0;
  const simElasticity =
    model.modelType === 'log_log'
      ? model.slope
      : simQ > 0
      ? model.slope * (sliderPrice / simQ)
      : -1;

  const minGridPrice = optimization.simulationGrid[0]?.price || 1;
  const maxGridPrice =
    optimization.simulationGrid[optimization.simulationGrid.length - 1]?.price || 100;

  const filteredGrid = filterFeasibleOnly
    ? optimization.simulationGrid.filter((pt) => pt.isFeasible)
    : optimization.simulationGrid;

  // Subsample 25 rows for readable table presentation
  const step = Math.max(1, Math.floor(filteredGrid.length / 25));
  const displayRows = filteredGrid.filter((_, i) => i % step === 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Módulo 09 · Simulación &amp; Optimización Matemática
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Motor de Simulación Numérica y Optimización de Precios
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              El optimizador calcula las soluciones analíticas y numéricas respetando restricciones de capacidad, piso de margen y rangos económicos válidos (sin cantidades negativas ni extrapolaciones absurdas).
            </p>
          </div>

          <button
            type="button"
            onClick={() => exportSimulationCSV(optimization.simulationGrid)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Tabla CSV</span>
          </button>
        </div>
      </div>

      {/* Target Objectives Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profit Maximization (Main Objective) */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500 dark:border-emerald-600 rounded-xl relative">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Objetivo Principal: Max Utilidad (π*)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono font-bold text-2xl text-emerald-800 dark:text-emerald-300">
              ${optimization.optimalProfitPrice.toFixed(2)}
            </span>
            <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
              +${Math.round(optimization.optimalProfit).toLocaleString()} ganancia
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
            <div>Demanda: {Math.round(optimization.optimalProfitQuantity).toLocaleString()} un.</div>
            <div>Margen Bruto: {optimization.optimalProfitMarginPct.toFixed(1)}%</div>
          </div>
          <button
            type="button"
            onClick={() => setSliderPrice(optimization.optimalProfitPrice)}
            className="mt-3 w-full py-1.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
          >
            Cargar en Simulador
          </button>
        </div>

        {/* Revenue Maximization */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Objetivo: Max Ingresos Totales (IT)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono font-bold text-2xl text-slate-900 dark:text-slate-100">
              ${optimization.optimalRevenuePrice.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-blue-600">
              ${Math.round(optimization.optimalRevenue).toLocaleString()} facturación
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <div>Demanda: {Math.round(optimization.optimalRevenueQuantity).toLocaleString()} un.</div>
            <div>Elasticidad: |ε| ≈ 1.0 (Unitaria)</div>
          </div>
          <button
            type="button"
            onClick={() => setSliderPrice(optimization.optimalRevenuePrice)}
            className="mt-3 w-full py-1.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors cursor-pointer"
          >
            Cargar en Simulador
          </button>
        </div>

        {/* Current Reference */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Punto de Referencia Actual
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono font-bold text-2xl text-slate-900 dark:text-slate-100">
              ${optimization.currentPrice.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ${Math.round(optimization.currentProfit).toLocaleString()} actual
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <div>Demanda: {Math.round(optimization.currentQuantity).toLocaleString()} un.</div>
            <div>Margen Actual: {optimization.currentMarginPct.toFixed(1)}%</div>
          </div>
          <button
            type="button"
            onClick={() => setSliderPrice(optimization.currentPrice)}
            className="mt-3 w-full py-1.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors cursor-pointer"
          >
            Cargar en Simulador
          </button>
        </div>
      </div>

      {/* Profit & Revenue Frontier Chart */}
      <ProfitRevenueChart
        simulationGrid={optimization.simulationGrid}
        optimalProfitPrice={optimization.optimalProfitPrice}
        optimalRevenuePrice={optimization.optimalRevenuePrice}
        currentPrice={currentPrice}
      />

      {/* Interactive Sandbox Slider */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Simulador Interactivo en Tiempo Real
            </h3>
            <p className="text-xs text-slate-500">
              Arrastra el control para explorar el impacto de cualquier precio sobre la rentabilidad.
            </p>
          </div>
          <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg">
            Precio Seleccionado: ${sliderPrice.toFixed(2)}
          </div>
        </div>

        <div>
          <input
            type="range"
            min={minGridPrice}
            max={maxGridPrice}
            step={(maxGridPrice - minGridPrice) / 100 || 0.1}
            value={sliderPrice}
            onChange={(e) => setSliderPrice(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Min: ${minGridPrice.toFixed(2)}</span>
            <span>P* Óptimo: ${optimization.optimalProfitPrice.toFixed(2)}</span>
            <span>Max: ${maxGridPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Live metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            <span className="text-[10px] text-slate-500 block font-sans">Demanda Estimada:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {Math.round(simQ).toLocaleString()} un.
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            <span className="text-[10px] text-slate-500 block font-sans">Ingresos Totales:</span>
            <span className="font-bold text-blue-600 text-sm">
              ${Math.round(simRev).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            <span className="text-[10px] text-slate-500 block font-sans">Costos Totales:</span>
            <span className="font-bold text-rose-600 text-sm">
              ${Math.round(simTotCost).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            <span className="text-[10px] text-slate-500 block font-sans">Utilidad Neta:</span>
            <span
              className={`font-bold text-sm ${
                simProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              ${Math.round(simProfit).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            <span className="text-[10px] text-slate-500 block font-sans">Margen / Elasticidad:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {simMarginPct.toFixed(1)}% · ε={simElasticity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Stress Scenarios Comparison */}
      <ScenarioBarChart scenarios={optimization.scenarios} />

      {/* Scenario Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tabla Completa de Escenarios de Simulación de Precios
            </h3>
            <p className="text-xs text-slate-500">
              Muestra paso a paso de combinaciones precio-volumen-rentabilidad.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFeasibleOnly}
              onChange={(e) => setFilterFeasibleOnly(e.target.checked)}
              className="rounded text-indigo-600 accent-indigo-600"
            />
            <span>Filtrar sólo escenarios factibles (cumplen reglas de negocio)</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800 font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2.5">Precio ($)</th>
                <th className="px-3 py-2.5 text-right">Demanda (Q)</th>
                <th className="px-3 py-2.5 text-right">Ingresos ($)</th>
                <th className="px-3 py-2.5 text-right">Costos ($)</th>
                <th className="px-3 py-2.5 text-right">Utilidad ($)</th>
                <th className="px-3 py-2.5 text-right">Margen (%)</th>
                <th className="px-3 py-2.5 text-right">Elasticidad (ε)</th>
                <th className="px-3 py-2.5">Factibilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
              {displayRows.map((row, idx) => {
                const isOptimal = Math.abs(row.price - optimization.optimalProfitPrice) < 0.2;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                      isOptimal ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                      ${row.price.toFixed(2)}
                      {isOptimal && (
                        <span className="ml-1.5 text-[9px] font-sans font-bold text-emerald-600">
                          (P* ÓPTIMO)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{Math.round(row.quantity).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">${Math.round(row.revenue).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-rose-600">${Math.round(row.totalCost).toLocaleString()}</td>
                    <td className={`px-3 py-2 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${Math.round(row.profit).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">{row.grossMarginPct.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right">{row.elasticity.toFixed(2)}</td>
                    <td className="px-3 py-2 font-sans">
                      {row.isFeasible ? (
                        <span className="text-emerald-600 font-semibold text-[10px]">Factible</span>
                      ) : (
                        <span className="text-amber-600 text-[10px] truncate block max-w-[160px]" title={row.constraintViolations.join(', ')}>
                          {row.constraintViolations[0]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Continuar a Políticas &amp; Estrategias</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
