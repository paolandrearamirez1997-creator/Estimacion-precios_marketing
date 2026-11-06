/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LineChart,
  Sliders,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  HelpCircle,
  TrendingDown,
  Calculator,
  Info
} from 'lucide-react';
import {
  RegressionResult,
  CleanedDataPoint,
  SubjectiveDemandPoint,
  SubjectiveDemandCurve
} from '../../types/pricing';
import { DemandCurveChart } from '../charts/DemandCurveChart';

interface Props {
  data: CleanedDataPoint[];
  activeModel: RegressionResult;
  allModels: {
    linear: RegressionResult;
    logLog: RegressionResult;
    semilog: RegressionResult;
    multivariable: RegressionResult;
  };
  onSelectModelType: (type: 'linear' | 'log_log' | 'semilog' | 'multivariable') => void;
  currentPrice: number;
  optimalPrice: number;
  subjectiveDemand: SubjectiveDemandCurve;
  onUpdateSubjectivePoints: (points: SubjectiveDemandPoint[]) => void;
  onNext: () => void;
}

export const DemandCurveModule: React.FC<Props> = ({
  data,
  activeModel,
  allModels,
  onSelectModelType,
  currentPrice,
  optimalPrice,
  subjectiveDemand,
  onUpdateSubjectivePoints,
  onNext
}) => {
  const [activeTab, setActiveTab] = useState<'econometrica' | 'subjetiva'>('econometrica');
  const [showSubjectiveOverlay, setShowSubjectiveOverlay] = useState(false);
  const [calcPrice, setCalcPrice] = useState<number>(currentPrice);

  // New subjective anchor point state
  const [newLabel, setNewLabel] = useState('');
  const [newP, setNewP] = useState<number>(currentPrice);
  const [newQ, setNewQ] = useState<number>(activeModel.predict(currentPrice));

  const handleAddAnchorPoint = () => {
    if (newP <= 0 || newQ <= 0) return;
    const newPt: SubjectiveDemandPoint = {
      id: `SUB-${Date.now()}`,
      label: newLabel.trim() || `Punto $${newP}`,
      price: Number(newP),
      expectedQuantity: Number(newQ),
      confidenceWeight: 4
    };
    onUpdateSubjectivePoints([...subjectiveDemand.anchorPoints, newPt]);
    setNewLabel('');
  };

  const handleRemoveAnchorPoint = (id: string) => {
    onUpdateSubjectivePoints(subjectiveDemand.anchorPoints.filter((p) => p.id !== id));
  };

  // Prediction calculator
  const predictedQ = activeModel.predict(calcPrice);
  const predictedRev = calcPrice * predictedQ;
  const isExtrapolated =
    calcPrice < activeModel.diagnostics.extrapolationMinPrice ||
    calcPrice > activeModel.diagnostics.extrapolationMaxPrice;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Módulo 06 · Construcción de Curvas de Demanda
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Modelos Econométricos y Curva de Demanda Subjetiva
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Estimación rigurosa de la sensibilidad al precio mediante Mínimos Cuadrados Ordinarios (MCO), especificaciones funcionales alternativas (Lineal, Log-Log, Semilog y Multivariable con competencia) y calibración experta subjetiva mediante Splines PCHIP.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('econometrica')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'econometrica'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Curva Econométrica (MCO)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subjetiva')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'subjetiva'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Curva Subjetiva / Expertos
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'econometrica' ? (
        <div className="space-y-6">
          {/* Model Specification Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                id: 'linear',
                name: 'Lineal (MCO)',
                formula: 'Q = β₀ + β₁·P',
                r2: allModels.linear.rSquared,
                selected: activeModel.modelType === 'linear'
              },
              {
                id: 'log_log',
                name: 'Log-Log (Elasticidad Cte.)',
                formula: 'ln(Q) = β₀ + β₁·ln(P)',
                r2: allModels.logLog.rSquared,
                selected: activeModel.modelType === 'log_log'
              },
              {
                id: 'semilog',
                name: 'Semilogarítmico',
                formula: 'ln(Q) = β₀ + β₁·P',
                r2: allModels.semilog.rSquared,
                selected: activeModel.modelType === 'semilog_log_lin'
              },
              {
                id: 'multivariable',
                name: 'Multivariable (Competencia)',
                formula: 'Q = β₀ + β₁·P + β₂·Pcomp',
                r2: allModels.multivariable.rSquared,
                selected: activeModel.modelType === 'multivariable'
              }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModelType(m.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  m.selected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {m.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    R² = {(m.r2 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                  {m.formula}
                </div>
              </button>
            ))}
          </div>

          {/* Demand Curve Chart with Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={showSubjectiveOverlay}
                  onChange={(e) => setShowSubjectiveOverlay(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-600"
                />
                <span>Superponer Curva Subjetiva de Expertos</span>
              </label>
            </div>

            <DemandCurveChart
              points={data.map((d) => ({ precio: d.precio, cantidad: d.cantidad }))}
              model={activeModel}
              currentPrice={currentPrice}
              optimalPrice={optimalPrice}
              subjectivePoints={subjectiveDemand.anchorPoints}
              subjectiveCurve={subjectiveDemand.interpolatedCurve}
              showSubjective={showSubjectiveOverlay}
            />
          </div>

          {/* Econometric Regression Table & Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Regression Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Tabla de Coeficientes &amp; Significancia Estadística (MCO)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeModel.modelName} · gl = {activeModel.degreesOfFreedom}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2.5">Parámetro</th>
                      <th className="px-3 py-2.5 text-right">Coeficiente (β)</th>
                      <th className="px-3 py-2.5 text-right">Error Estándar</th>
                      <th className="px-3 py-2.5 text-right">Estadístico t</th>
                      <th className="px-3 py-2.5 text-right">P-Valor</th>
                      <th className="px-3 py-2.5 text-center">Signif.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-medium">Intercepto (β₀)</td>
                      <td className="px-3 py-2 text-right">{activeModel.intercept.toFixed(4)}</td>
                      <td className="px-3 py-2 text-right">{activeModel.interceptStdError.toFixed(4)}</td>
                      <td className="px-3 py-2 text-right">{activeModel.interceptTStat.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        {activeModel.interceptPValue < 0.001
                          ? '< 0.001'
                          : activeModel.interceptPValue.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 text-center text-emerald-600 font-bold">
                        {activeModel.interceptPValue < 0.01 ? '***' : '*'}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-medium text-indigo-600 dark:text-indigo-400">
                        Sensibilidad Precio (β₁)
                      </td>
                      <td className="px-3 py-2 text-right font-bold">{activeModel.slope.toFixed(4)}</td>
                      <td className="px-3 py-2 text-right">{activeModel.slopeStdError.toFixed(4)}</td>
                      <td className="px-3 py-2 text-right">{activeModel.slopeTStat.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        {activeModel.slopePValue < 0.001
                          ? '< 0.001'
                          : activeModel.slopePValue.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 text-center text-emerald-600 font-bold">
                        {activeModel.slopePValue < 0.01 ? '***' : '*'}
                      </td>
                    </tr>
                    {(activeModel.additionalCoefficients || []).map((ac, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-medium">{ac.variableName}</td>
                        <td className="px-3 py-2 text-right font-bold">{ac.coef.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right">{ac.stdError.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right">{ac.tStat.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          {ac.pValue < 0.001 ? '< 0.001' : ac.pValue.toFixed(4)}
                        </td>
                        <td className="px-3 py-2 text-center text-emerald-600 font-bold">
                          {ac.pValue < 0.01 ? '***' : '*'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Goodness of Fit Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">R² Determinación:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(activeModel.rSquared * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">R² Ajustado:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(activeModel.adjRSquared * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">F-Statistic:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeModel.fStatistic.toFixed(2)} (p &lt; 0.01)
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Durbin-Watson:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeModel.durbinWatson.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Demand Prediction Calculator & Warnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    Simulador Puntual de Demanda
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evalúa la demanda proyectada para cualquier valor de precio.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Precio a Evaluar ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-sm"
                    />
                  </div>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Demanda Estimada Q̂:</span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {Math.round(predictedQ).toLocaleString()} un.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ingresos Proyectados:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ${Math.round(predictedRev).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isExtrapolated && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Advertencia de extrapolación: El precio ${calcPrice.toFixed(2)} está fuera del rango muestral observado [${activeModel.diagnostics.extrapolationMinPrice.toFixed(2)}, ${activeModel.diagnostics.extrapolationMaxPrice.toFixed(2)}]. Los intervalos de confianza se ensanchan exponencialmente.
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[11px] text-slate-500 leading-relaxed">
                    <strong>Rigor Econométrico:</strong> {activeModel.diagnostics.endogeneityWarning}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onNext}
                  className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar a Elasticidad</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Subjetive Demand Tab */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Construcción de Curva de Demanda Subjetiva (Juicio de Expertos)
              </h3>
              <p className="text-xs text-slate-500">
                Añade puntos de calibración basados en estudios Van Westendorp, encuestas de disposición a pagar (WTP) o conocimiento comercial del equipo.
              </p>
            </div>

            {/* Input form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Etiqueta / Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Precio Reserva, Precio Promocional"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Precio Propuesto ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newP}
                  onChange={(e) => setNewP(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Cantidad Esperada (unidades)
                </label>
                <input
                  type="number"
                  step="50"
                  value={newQ}
                  onChange={(e) => setNewQ(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddAnchorPoint}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Punto</span>
                </button>
              </div>
            </div>

            {/* Anchor points table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-2.5">Etiqueta</th>
                    <th className="px-3 py-2.5 text-right">Precio ($)</th>
                    <th className="px-3 py-2.5 text-right">Cantidad Esperada (Q)</th>
                    <th className="px-3 py-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {subjectiveDemand.anchorPoints.map((pt) => (
                    <tr key={pt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {pt.label}
                      </td>
                      <td className="px-3 py-2 text-right">${pt.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{Math.round(pt.expectedQuantity).toLocaleString()} un.</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveAnchorPoint(pt.id)}
                          className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Spline note */}
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-lg text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                La curva se interpola automáticamente mediante el algoritmo de Hermite Monótono por Tramos (PCHIP), asegurando que la demanda descienda consistentemente al subir el precio, sin oscilaciones no físicas.
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar a Elasticidad</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
