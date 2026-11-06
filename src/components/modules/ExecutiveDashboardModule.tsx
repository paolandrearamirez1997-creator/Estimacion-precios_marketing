/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  PieChart,
  FileSpreadsheet,
  CheckCircle,
  Building2,
  BookOpen
} from 'lucide-react';
import {
  OptimizationResult,
  RegressionResult,
  ElasticityAnalysis,
  CostStructure,
  CleanedDataPoint,
  StrategicRecommendation,
  SectorType
} from '../../types/pricing';
import { DemandCurveChart } from '../charts/DemandCurveChart';
import { ProfitRevenueChart } from '../charts/ProfitRevenueChart';
import { exportFullExcelWorkbook, exportSimulationCSV } from '../../utils/exportUtils';
import { SECTOR_PRESETS } from '../../data/sampleDatasets';

interface Props {
  productName: string;
  selectedSector: SectorType;
  cleanedData: CleanedDataPoint[];
  model: RegressionResult;
  optimization: OptimizationResult;
  elasticity: ElasticityAnalysis;
  costStructure: CostStructure;
  recommendations: StrategicRecommendation[];
}

export const ExecutiveDashboardModule: React.FC<Props> = ({
  productName,
  selectedSector,
  cleanedData,
  model,
  optimization,
  elasticity,
  costStructure,
  recommendations
}) => {
  const sectorInfo = SECTOR_PRESETS.find((s) => s.id === selectedSector) || SECTOR_PRESETS[0];

  const handleExportExcel = () => {
    exportFullExcelWorkbook({
      productName,
      sectorName: sectorInfo.name,
      cleanedData,
      model,
      optimization,
      elasticity,
      recommendations
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const priceDiffPct =
    ((optimization.optimalProfitPrice - optimization.currentPrice) / optimization.currentPrice) * 100;
  const demandDiffPct =
    ((optimization.optimalProfitQuantity - optimization.currentQuantity) /
      Math.max(1, optimization.currentQuantity)) *
    100;
  const revDiffPct =
    ((optimization.optimalProfitRevenue - optimization.currentRevenue) /
      Math.max(1, optimization.currentRevenue)) *
    100;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Executive Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <span>Módulo 11 · Dashboard Ejecutivo de Pricing Analytics</span>
            <span>·</span>
            <span>{sectorInfo.name}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Dictamen Económico &amp; Optimización de Precios: {productName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recomendación de política de precios sustentada en {cleanedData.length} observaciones históricas y modelo {model.modelName}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel Completo (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main KPI Comparison Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Price KPI */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Precio de Venta (P)</span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                priceDiffPct >= 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              {priceDiffPct >= 0 ? `+${priceDiffPct.toFixed(1)}%` : `${priceDiffPct.toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
              ${optimization.optimalProfitPrice.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-slate-400 line-through">
              ${optimization.currentPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            P* Óptimo vs Precio Actual
          </span>
        </div>

        {/* Demand KPI */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Demanda Estimada (Q)</span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {demandDiffPct >= 0 ? `+${demandDiffPct.toFixed(1)}%` : `${demandDiffPct.toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(optimization.optimalProfitQuantity).toLocaleString()}
            </span>
            <span className="font-mono text-xs text-slate-400">
              unidades
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            vs {Math.round(optimization.currentQuantity).toLocaleString()} un. actuales
          </span>
        </div>

        {/* Revenue KPI */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Ingresos Totales (IT)</span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              {revDiffPct >= 0 ? `+${revDiffPct.toFixed(1)}%` : `${revDiffPct.toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
              ${Math.round(optimization.optimalProfitRevenue).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            vs ${Math.round(optimization.currentRevenue).toLocaleString()} actual
          </span>
        </div>

        {/* Profit Gain KPI (Highlight) */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-500 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <span>Utilidad Neta π*</span>
            <span className="font-mono text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
              +{optimization.profitGainPct.toFixed(1)}% Ganancia
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-bold text-emerald-800 dark:text-emerald-300">
              ${Math.round(optimization.optimalProfit).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-mono">
            Margen de Utilidad: {optimization.optimalProfitMarginPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Core Charts Dual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemandCurveChart
          points={cleanedData.map((d) => ({ precio: d.precio, cantidad: d.cantidad }))}
          model={model}
          currentPrice={optimization.currentPrice}
          optimalPrice={optimization.optimalProfitPrice}
        />

        <ProfitRevenueChart
          simulationGrid={optimization.simulationGrid}
          optimalProfitPrice={optimization.optimalProfitPrice}
          optimalRevenuePrice={optimization.optimalRevenuePrice}
          currentPrice={optimization.currentPrice}
        />
      </div>

      {/* Econometric & Microeconomic Synthesis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model Spec */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
            Especificación Econométrica
          </span>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
            {model.formula}
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 font-mono">
            <span>R²: {(model.rSquared * 100).toFixed(1)}%</span>
            <span>F: {model.fStatistic.toFixed(1)}</span>
            <span>DW: {model.durbinWatson.toFixed(2)}</span>
            <span>RMSE: {model.rmse.toFixed(1)}</span>
          </div>
        </div>

        {/* Elasticity Diagnostic */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
            Elasticidad Precio (PED)
          </span>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded font-mono text-[11px]">
            <span className="text-slate-500">|ε| al Precio Óptimo:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {Math.abs(elasticity.pointElasticityAtOptimalPrice).toFixed(2)} ({elasticity.type.toUpperCase()})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {elasticity.pricingAdvice}
          </p>
        </div>

        {/* Break-even & Cost Structure */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
            Cobertura &amp; Punto de Equilibrio
          </span>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded font-mono text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Punto de Equilibrio:</span>
              <span className="font-bold">{Math.round(optimization.breakEvenUnits).toLocaleString()} un.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MCU Unitario:</span>
              <span className="font-bold">
                ${(optimization.optimalProfitPrice - costStructure.variableCostPerUnit).toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Costos fijos cubiertos con el {Math.round((optimization.breakEvenUnits / Math.max(1, optimization.optimalProfitQuantity)) * 100)}% de la demanda proyectada.
          </p>
        </div>
      </div>

      {/* Top Strategic Recommendations Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Resumen de Recomendaciones Estratégicas para el Comité Comercial
          </h3>
          <p className="text-xs text-slate-500">
            Planes de acción recomendados para maximizar rentabilidad protegiendo la cuota de mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {recommendations.slice(0, 3).map((rec, i) => (
            <div
              key={i}
              className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 bg-slate-50/30 dark:bg-slate-800/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {rec.strategyName}
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  ${rec.recommendedPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {rec.description}
              </p>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                {rec.expectedImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodological References */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-2">
        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Fuentes Técnicas y Marco Bibliográfico de la Metodología
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div>
            <strong>Microeconomía &amp; Elasticidad:</strong>
            <p>Hal Varian (Microeconomía Intermedia), Pindyck &amp; Rubinfeld (Microeconomía), N. Gregory Mankiw.</p>
          </div>
          <div>
            <strong>Pricing Strategy &amp; Rentabilidad:</strong>
            <p>Thomas T. Nagle &amp; John Hogan (The Strategy and Tactics of Pricing), Hermann Simon (Confessions of the Pricing Man).</p>
          </div>
          <div>
            <strong>Econometría &amp; Modelamiento:</strong>
            <p>Jeffrey M. Wooldridge (Introductory Econometrics), Stock &amp; Watson (Introduction to Econometrics).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
