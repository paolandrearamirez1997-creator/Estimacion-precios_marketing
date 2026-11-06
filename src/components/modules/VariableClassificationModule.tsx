/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Table,
  ArrowRight,
  SlidersHorizontal,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  ColumnProfile,
  VariableClassificationType,
  VariableModelRole
} from '../../types/pricing';

interface Props {
  columnProfiles: ColumnProfile[];
  onUpdateClassification: (colName: string, classification: VariableClassificationType) => void;
  onUpdateRole: (colName: string, role: VariableModelRole) => void;
  onNext: () => void;
}

export const VariableClassificationModule: React.FC<Props> = ({
  columnProfiles,
  onUpdateClassification,
  onUpdateRole,
  onNext
}) => {
  const quantCount = columnProfiles.filter((c) => c.classification.startsWith('cuantitativa')).length;
  const qualCount = columnProfiles.filter((c) => c.classification.startsWith('cualitativa')).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Módulo 03 · Tipificación &amp; Clasificación Estadística
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Clasificación y Rol Econométrico de las Variables
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Diferenciación rigurosa entre variables cuantitativas (continuas o discretas) y cualitativas (nominales u ordinales). Puedes corregir manualmente cualquier clasificación antes de avanzar a la limpieza y modelamiento.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg font-mono">
              {quantCount} Cuantitativas
            </span>
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg font-mono">
              {qualCount} Cualitativas
            </span>
          </div>
        </div>
      </div>

      {/* Main Classification Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Nombre Variable</th>
                <th className="px-3 py-3">Tipo Origen</th>
                <th className="px-3 py-3">Clasificación Estadística</th>
                <th className="px-3 py-3 text-right">Valores Únicos</th>
                <th className="px-3 py-3 text-right">Faltantes (%)</th>
                <th className="px-4 py-3">Función en el Modelo</th>
                <th className="px-3 py-3">Muestra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {columnProfiles.map((col) => {
                const isHighMissing = col.missingPct > 15;
                return (
                  <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {col.name}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-slate-500">
                      {col.originalType}
                    </td>

                    <td className="px-3 py-2.5">
                      <select
                        value={col.classification}
                        onChange={(e) =>
                          onUpdateClassification(
                            col.name,
                            e.target.value as VariableClassificationType
                          )
                        }
                        className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      >
                        <option value="cuantitativa_continua">Cuantitativa Continua</option>
                        <option value="cuantitativa_discreta">Cuantitativa Discreta</option>
                        <option value="cualitativa_nominal">Cualitativa Nominal</option>
                        <option value="cualitativa_ordinal">Cualitativa Ordinal</option>
                      </select>
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {col.uniqueValuesCount.toLocaleString()}
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono">
                      <span
                        className={
                          isHighMissing
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {col.missingPct}%
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <select
                        value={col.role}
                        onChange={(e) =>
                          onUpdateRole(col.name, e.target.value as VariableModelRole)
                        }
                        className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                      >
                        <option value="precio">Precio de Venta (P)</option>
                        <option value="cantidad">Cantidad Demandada (Q)</option>
                        <option value="ingresos">Ingresos</option>
                        <option value="costo_unitario">Costo Unitario / Variable</option>
                        <option value="costo_fijo">Costos Fijos</option>
                        <option value="competencia_precio">Precio Competidor</option>
                        <option value="descuento">Descuento / Promo</option>
                        <option value="fecha">Fecha / Periodo</option>
                        <option value="segmento">Segmento Clientes</option>
                        <option value="canal">Canal Comercial</option>
                        <option value="producto">Producto / SKU</option>
                        <option value="otra_explicativa">Otra Explicativa</option>
                        <option value="ignorar">Ignorar</option>
                      </select>
                    </td>

                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
                      {col.sampleValues.slice(0, 3).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info & Proceed button */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Asegúrate de que <strong className="text-slate-700 dark:text-slate-300">Precio (P)</strong> y <strong className="text-slate-700 dark:text-slate-300">Cantidad (Q)</strong> estén debidamente asignadas para construir las funciones econométricas de demanda.
          </div>
          <button
            type="button"
            onClick={onNext}
            className="py-2 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Confirmar y Pasar a Limpieza de Datos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
