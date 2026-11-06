/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Database,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ColumnProfile, VariableModelRole } from '../../types/pricing';
import { BENCHMARK_DATASETS, BenchmarkDatasetMeta } from '../../data/sampleDatasets';

interface Props {
  rawData: Record<string, any>[];
  onLoadData: (data: Record<string, any>[], sourceName?: string) => void;
  columnProfiles: ColumnProfile[];
  onUpdateColumnRole: (colName: string, role: VariableModelRole) => void;
  priceCol: string;
  quantityCol: string;
  onSetPriceCol: (col: string) => void;
  onSetQuantityCol: (col: string) => void;
  onNext: () => void;
  onLoadBenchmark: (benchmark: BenchmarkDatasetMeta) => void;
}

export const DataImportModule: React.FC<Props> = ({
  rawData,
  onLoadData,
  columnProfiles,
  onUpdateColumnRole,
  priceCol,
  quantityCol,
  onSetPriceCol,
  onSetQuantityCol,
  onNext,
  onLoadBenchmark
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setLoadError(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onLoadData(parsed, file.name);
          } else {
            setLoadError('El archivo JSON debe contener un arreglo de objetos.');
          }
        } catch {
          setLoadError('Error al procesar el archivo JSON. Verifica el formato.');
        }
      };
      reader.readAsText(file);
    } else {
      // Excel, CSV, TXT via XLSX parser
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            defval: null
          });

          if (jsonData.length > 0) {
            onLoadData(jsonData, file.name);
          } else {
            setLoadError('La hoja seleccionada está vacía.');
          }
        } catch {
          setLoadError('No se pudo leer el archivo. Asegúrate de que sea un CSV, XLSX o TXT válido.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownloadCurrentData = () => {
    if (rawData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rawData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, 'base_comercial_importada.xlsx');
  };

  const hasData = rawData.length > 0;
  const previewRows = rawData.slice(0, 5);
  const totalCols = hasData ? Object.keys(rawData[0]).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Módulo 02 · Ingesta &amp; Mapeo de Variables Comerciales
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Importación, Validación y Asignación de Variables
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Carga tus bases de datos comerciales en formato CSV, Excel (.xlsx, .xls), JSON o TXT, o explora inmediatamente cargando uno de los 5 benchmarks sectoriales calibrados por nuestro equipo econométrico.
            </p>
          </div>

          {/* Benchmark Presets Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Cargar Benchmark:</span>
            {BENCHMARK_DATASETS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onLoadBenchmark(b)}
                className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title={b.description}
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{b.productName.split(' ')[0]} ({b.sectorId})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
              dragOver
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Arrastra tu archivo o haz clic para explorar
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Soporta archivos CSV, XLSX, XLS, JSON y TXT
            </p>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-mono">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Detección automática de columnas</span>
            </div>
          </div>

          {loadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Dataset Status Summary */}
          {hasData && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  Resumen de Ingesta
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCurrentData}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Descargar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Registros (N):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {rawData.length.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Variables:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {totalCols}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column Mapping & Configuration */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Asignación de Variables Clave para el Modelo de Demanda
              </h3>
              <p className="text-xs text-slate-500">
                Identificación automática asistida con opción de reasignación manual.
              </p>
            </div>

            {hasData ? (
              <div className="space-y-4">
                {/* Core variables: Price and Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                      Variable de Precio (P) *
                    </label>
                    <select
                      value={priceCol}
                      onChange={(e) => {
                        onSetPriceCol(e.target.value);
                        onUpdateColumnRole(e.target.value, 'precio');
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    >
                      {columnProfiles.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.originalType})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Variable independiente fundamental del modelo
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      Variable de Cantidad Demandada (Q) *
                    </label>
                    <select
                      value={quantityCol}
                      onChange={(e) => {
                        onSetQuantityCol(e.target.value);
                        onUpdateColumnRole(e.target.value, 'cantidad');
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    >
                      {columnProfiles.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.originalType})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Variable dependiente (ventas en unidades o volumen)
                    </span>
                  </div>
                </div>

                {/* Other columns mapping */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Roles Asignados a Variables Adicionales:
                  </span>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
                    {columnProfiles
                      .filter((c) => c.name !== priceCol && c.name !== quantityCol)
                      .map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                              {col.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({col.classification.replace('_', ' ')})
                            </span>
                          </div>
                          <select
                            value={col.role}
                            onChange={(e) =>
                              onUpdateColumnRole(col.name, e.target.value as VariableModelRole)
                            }
                            className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                          >
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
                            <option value="ignorar">Ignorar en Modelo</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-slate-100 dark:border-slate-800 rounded-lg">
                Carga un archivo o presiona un benchmark arriba para activar la asignación de variables.
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={!hasData}
              onClick={onNext}
              className={`py-2 px-5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                hasData
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continuar a Tipificación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Rows Preview Table */}
      {hasData && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Vista Previa de la Base de Datos (Primeros 5 Registros)
              </h4>
              <p className="text-[11px] text-slate-500">
                Verifica la consistencia inicial de columnas, separadores y formato de números.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Mostrando 5 de {rawData.length} filas
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  {Object.keys(previewRows[0] || {}).map((col) => (
                    <th key={col} className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    {Object.keys(previewRows[0] || {}).map((col) => (
                      <td key={col} className="px-3.5 py-2 whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
