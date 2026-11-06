/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  ArrowRight,
  ShieldAlert,
  PieChart,
  Scale
} from 'lucide-react';
import {
  CostStructure,
  OptimizationResult,
  RegressionResult
} from '../../types/pricing';

interface Props {
  costStructure: CostStructure;
  onChangeCostStructure: (val: CostStructure) => void;
  optimization: OptimizationResult;
  model: RegressionResult;
  onNext: () => void;
}

export const ProfitCostModule: React.FC<Props> = ({
  costStructure,
  onChangeCostStructure,
  optimization,
  model,
  onNext
}) => {
  const p = optimization.optimalProfitPrice;
  const q = optimization.optimalProfitQuantity;
  const cv = costStructure.variableCostPerUnit;
  const cf = costStructure.fixedCosts;

  const totalRev = p * q;
  const totalVarCost = cv * q;
  const totalCost = cf + totalVarCost;
  const profit = totalRev - totalCost;
  const marginPct = totalRev > 0 ? (profit / totalRev) * 100 : 0;

  const unitContribution = p - cv;
  const contributionMarginRatio = p > 0 ? (unitContribution / p) * 100 : 0;

  const breakEvenUnits = unitContribution > 0 ? cf / unitContribution : 0;
  const breakEvenRev = breakEvenUnits * p;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Módulo 08 · Estructura Financiera de Costos &amp; Rentabilidad
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Integración de Demanda con Ingresos, Costos y Utilidad Operativa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            La maximización económica requiere modelar conjuntamente la curva de ingresos totales IT(P) = P·Q(P) y la estructura de costos totales CT(Q) = CF + CV(Q) para encontrar el precio donde el ingreso marginal iguala al costo marginal (IMg = CMg).
          </p>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Ingresos Totales (IT):</span>
          <span className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100 mt-1 block">
            ${Math.round(totalRev).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {Math.round(q).toLocaleString()} un. a ${p.toFixed(2)}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Costos Totales (CT):</span>
          <span className="font-mono font-bold text-lg text-rose-600 dark:text-rose-400 mt-1 block">
            ${Math.round(totalCost).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            CF: ${cf.toLocaleString()} · CV: ${Math.round(totalVarCost).toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Utilidad Neta π(P*):</span>
          <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 mt-1 block">
            ${Math.round(profit).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Margen Neto: {marginPct.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Punto de Equilibrio (BEP):</span>
          <span className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-1 block">
            {Math.round(breakEvenUnits).toLocaleString()} un.
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Facturación Mínima: ${Math.round(breakEvenRev).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cost Structure Tuning & Break-Even Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Tuner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Parámetros de la Estructura de Costos
            </h3>
            <p className="text-xs text-slate-500">
              Modifica los costos para recalcular inmediatamente el precio óptimo y el margen.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1 text-slate-700 dark:text-slate-300">
                <span>Costo Variable Unitario (c_v) ($)</span>
                <span className="font-mono font-bold">${cv.toFixed(2)}</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={cv}
                onChange={(e) =>
                  onChangeCostStructure({
                    ...costStructure,
                    variableCostPerUnit: Math.max(0.01, Number(e.target.value))
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Materia prima, empaque, comisión transaccional directa por unidad.
              </span>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1 text-slate-700 dark:text-slate-300">
                <span>Costos Fijos del Periodo (CF) ($)</span>
                <span className="font-mono font-bold">${cf.toLocaleString()}</span>
              </div>
              <input
                type="number"
                step="1000"
                value={cf}
                onChange={(e) =>
                  onChangeCostStructure({
                    ...costStructure,
                    fixedCosts: Math.max(0, Number(e.target.value))
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Nómina fija, alquiler de planta/oficina, servidores, gastos administrativos.
              </span>
            </div>

            {/* Contribution margin card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-2 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Margen de Contribución Unitario (MCU):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  ${unitContribution.toFixed(2)} ({contributionMarginRatio.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, contributionMarginRatio))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Cada unidad vendida a P* aporta ${unitContribution.toFixed(2)} para cubrir costos fijos y generar ganancia neta.
              </span>
            </div>
          </div>
        </div>

        {/* Break-even & Marginal Analysis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                Análisis de Punto de Equilibrio &amp; Principio Marginal
              </h3>
              <p className="text-xs text-slate-500">
                Validación de cobertura de costos y condición de primer orden dπ/dP = 0.
              </p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg space-y-1">
                <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                  Fórmula de Punto de Equilibrio:
                </div>
                <div className="font-mono text-indigo-700 dark:text-indigo-400">
                  Q_be = CF / (P - c_v) = ${cf} / (${p.toFixed(2)} - ${cv.toFixed(2)}) = {Math.round(breakEvenUnits)} un.
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  La demanda estimada ({Math.round(q)} un.) supera el punto de equilibrio en un{' '}
                  <strong className="text-emerald-600">
                    +{Math.round(((q - breakEvenUnits) / Math.max(1, breakEvenUnits)) * 100)}%
                  </strong>
                  , garantizando solvencia operativa holgada.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Condición Microeconómica Marginal (IMg = CMg):
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Para una curva lineal Q = a + b·P, la utilidad máxima ocurre exactamente en:
                </p>
                <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  P* = (c_v - a/b) / 2
                </div>
                <p className="text-[10px] text-slate-500">
                  El precio óptimo es el punto medio entre el costo variable unitario ($c_v) y el precio de reserva máximo (-a/b).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar a Simulación &amp; Optimización</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
