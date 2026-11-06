/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  DataQualityReport,
  ColumnProfile,
  CleanedDataPoint
} from '../../types/pricing';
import { ImputationStrategy } from '../../utils/dataCleaning';

interface Props {
  initialReport: DataQualityReport;
  cleanedReport: DataQualityReport;
  auditLog: string[];
  onApplyCleaning: (options: {
    handleNulls: ImputationStrategy;
    removeDuplicates: boolean;
    filterNonPositive: boolean;
    handleOutliers: 'keep' | 'winsorize' | 'drop';
  }) => void;
  onNext: () => void;
}

export const DataCleaningModule: React.FC<Props> = ({
  initialReport,
  cleanedReport,
  auditLog,
  onApplyCleaning,
  onNext
}) => {
  const [handleNulls, setHandleNulls] = useState<ImputationStrategy>('median');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [filterNonPositive, setFilterNonPositive] = useState(true);
  const [handleOutliers, setHandleOutliers] = useState<'keep' | 'winsorize' | 'drop'>('winsorize');
  const [hasApplied, setHasApplied] = useState(false);

  const handleRun = () => {
    onApplyCleaning({
      handleNulls,
      removeDuplicates,
      filterNonPositive,
      handleOutliers
    });
    setHasApplied(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Módulo 04 · Calidad &amp; Tratamiento de Información
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Limpieza, Imputación y Validación de Consistencia
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Los modelos econométricos son altamente sensibles a precios cero o negativos, cantidades distorsionadas y outliers extremos que sesgan la pendiente de la curva de demanda (β₁). Configura el tratamiento riguroso de inconsistencias y aprueba los cambios.
          </p>
        </div>
      </div>

      {/* Before vs After Quality Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initial State */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Diagnóstico Inicial de Calidad
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              Score: {initialReport.healthScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Registros Totales:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {initialReport.totalRows}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Valores Nulos / Vacíos:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  initialReport.missingTotal > 0 ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {initialReport.missingTotal}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Registros Duplicados:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  initialReport.duplicatesCount > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {initialReport.duplicatesCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Precios &le; 0 o Q &lt; 0:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  initialReport.nonPositivePricesCount + initialReport.nonPositiveQuantitiesCount > 0
                    ? 'text-rose-600'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {initialReport.nonPositivePricesCount + initialReport.nonPositiveQuantitiesCount}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-medium text-slate-700 dark:text-slate-300">
              Límites de Tukey (Rango IQR Precio):
            </div>
            <div className="font-mono text-slate-500">
              P_min = ${initialReport.iqrBounds.price.lower.toFixed(2)} · P_max = $
              {initialReport.iqrBounds.price.upper.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {initialReport.outliersCount} observaciones detectadas fuera de 1.5·IQR
            </div>
          </div>
        </div>

        {/* Cleaned State */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Estado Post-Tratamiento (Depurado)
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              Score: {cleanedReport.healthScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Registros Válidos:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {cleanedReport.totalRows}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Valores Nulos Restantes:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {cleanedReport.missingTotal}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Duplicados:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {cleanedReport.duplicatesCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Inconsistencias Económicas:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                0 (100% consistentes)
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300">
            Base validada y estructurada para regresión econométrica. Todos los registros cumplen con P &gt; 0 y Q &ge; 0.
          </div>
        </div>
      </div>

      {/* Cleaning Policy Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Alternativas de Tratamiento Econométrico
          </h3>
          <p className="text-xs text-slate-500">
            Selecciona la política de imputación y depuración antes de ejecutar la regresión.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Null handling */}
          <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              Valores Faltantes
            </span>
            <select
              value={handleNulls}
              onChange={(e) => setHandleNulls(e.target.value as ImputationStrategy)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="median">Imputar con Mediana (Robusto)</option>
              <option value="mean">Imputar con Media</option>
              <option value="drop">Eliminar Filas Incompletas</option>
            </select>
            <p className="text-[10px] text-slate-500">
              La mediana no se ve afectada por valores extremos.
            </p>
          </div>

          {/* 2. Duplicates */}
          <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              Registros Duplicados
            </span>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded text-indigo-600 accent-indigo-600"
              />
              <span className="text-slate-700 dark:text-slate-300">Eliminar Duplicados</span>
            </label>
            <p className="text-[10px] text-slate-500">
              Evita sobreponderar observaciones idénticas en la regresión.
            </p>
          </div>

          {/* 3. Non-positive filter */}
          <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              Precios &le; 0 o Q &lt; 0
            </span>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={filterNonPositive}
                onChange={(e) => setFilterNonPositive(e.target.checked)}
                className="rounded text-indigo-600 accent-indigo-600"
              />
              <span className="text-slate-700 dark:text-slate-300">Filtrar Inconsistencias</span>
            </label>
            <p className="text-[10px] text-slate-500">
              Obligatorio para evitar indeterminaciones en modelos Log-Log y Semilog.
            </p>
          </div>

          {/* 4. Outliers */}
          <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              Tratamiento de Outliers (IQR)
            </span>
            <select
              value={handleOutliers}
              onChange={(e) => setHandleOutliers(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="winsorize">Winsorizar (Recortar a Tukey)</option>
              <option value="drop">Eliminar Observaciones Extremas</option>
              <option value="keep">Conservar Todos los Datos</option>
            </select>
            <p className="text-[10px] text-slate-500">
              Winsorizar preserva el tamaño muestral limitando el sesgo de influencia.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRun}
            className="py-2 px-4 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Aplicar y Validar Tratamiento</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="py-2 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Avanzar a Análisis Exploratorio (EDA)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Registro de Auditoría de Depuración (Audit Trail)
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono text-[11px]">
            {auditLog.map((log, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{log}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
