/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  OptimizationResult,
  RegressionResult,
  CleanedDataPoint,
  StrategicRecommendation,
  ElasticityAnalysis
} from '../types/pricing';

export function exportFullExcelWorkbook(params: {
  productName: string;
  sectorName: string;
  cleanedData: CleanedDataPoint[];
  model: RegressionResult;
  optimization: OptimizationResult;
  elasticity: ElasticityAnalysis;
  recommendations: StrategicRecommendation[];
}) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Resumen Ejecutivo
  const summaryData = [
    ['PLATAFORMA DE PRICING ANALYTICS & OPTIMIZACIÓN DE PRECIOS'],
    ['Reporte Generado:', new Date().toLocaleString()],
    ['Producto / Referencia:', params.productName],
    ['Sector Económico:', params.sectorName],
    [],
    ['INDICADORES CLAVE (KPIs)', 'VALOR ACTUAL', 'VALOR ÓPTIMO', 'VARIACIÓN ESPERADA'],
    [
      'Precio de Venta ($)',
      params.optimization.currentPrice.toFixed(2),
      params.optimization.optimalProfitPrice.toFixed(2),
      `${(((params.optimization.optimalProfitPrice - params.optimization.currentPrice) / params.optimization.currentPrice) * 100).toFixed(1)}%`
    ],
    [
      'Demanda Estimada (unidades)',
      Math.round(params.optimization.currentQuantity),
      Math.round(params.optimization.optimalProfitQuantity),
      `${(((params.optimization.optimalProfitQuantity - params.optimization.currentQuantity) / Math.max(1, params.optimization.currentQuantity)) * 100).toFixed(1)}%`
    ],
    [
      'Ingresos Totales ($)',
      Math.round(params.optimization.currentRevenue),
      Math.round(params.optimization.optimalProfitRevenue),
      `${(((params.optimization.optimalProfitRevenue - params.optimization.currentRevenue) / Math.max(1, params.optimization.currentRevenue)) * 100).toFixed(1)}%`
    ],
    [
      'Utilidad Neta ($)',
      Math.round(params.optimization.currentProfit),
      Math.round(params.optimization.optimalProfit),
      `+${params.optimization.profitGainPct.toFixed(1)}%`
    ],
    [
      'Margen de Utilidad (%)',
      `${params.optimization.currentMarginPct.toFixed(1)}%`,
      `${params.optimization.optimalProfitMarginPct.toFixed(1)}%`,
      `${(params.optimization.optimalProfitMarginPct - params.optimization.currentMarginPct).toFixed(1)} pp`
    ],
    [
      'Elasticidad Precio de la Demanda (ε)',
      params.elasticity.pointElasticityAtCurrentPrice.toFixed(2),
      params.elasticity.pointElasticityAtOptimalPrice.toFixed(2),
      params.elasticity.type.toUpperCase()
    ],
    [
      'Punto de Equilibrio (unidades)',
      '-',
      Math.round(params.optimization.breakEvenUnits),
      'Ventas mínimas requeridas'
    ],
    [
      'Punto de Equilibrio ($)',
      '-',
      Math.round(params.optimization.breakEvenRevenue),
      'Ingreso mínimo requerido'
    ]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen_Ejecutivo');

  // 2. Sheet: Base Depurada
  const wsData = XLSX.utils.json_to_sheet(params.cleanedData);
  XLSX.utils.book_append_sheet(wb, wsData, 'Datos_Depurados');

  // 3. Sheet: Resultados Econométricos
  const econometricData = [
    ['MODELO ECONOMÉTRICO DE DEMANDA ESTIMADO'],
    ['Tipo de Modelo:', params.model.modelName],
    ['Fórmula Especificada:', params.model.formula],
    ['Tamaño Muestral (N):', params.model.sampleSize],
    ['Grados de Libertad:', params.model.degreesOfFreedom],
    [],
    ['PARÁMETRO', 'COEFICIENTE (BETA)', 'ERROR ESTÁNDAR', 'ESTADÍSTICO T', 'P-VALOR', 'SIGNIFICANCIA'],
    [
      'Intercepto (β0)',
      params.model.intercept.toFixed(4),
      params.model.interceptStdError.toFixed(4),
      params.model.interceptTStat.toFixed(2),
      params.model.interceptPValue < 0.001 ? '< 0.001' : params.model.interceptPValue.toFixed(4),
      params.model.interceptPValue < 0.01 ? '*** p < 0.01' : 'p >= 0.01'
    ],
    [
      'Sensibilidad Precio (β1)',
      params.model.slope.toFixed(4),
      params.model.slopeStdError.toFixed(4),
      params.model.slopeTStat.toFixed(2),
      params.model.slopePValue < 0.001 ? '< 0.001' : params.model.slopePValue.toFixed(4),
      params.model.slopePValue < 0.01 ? '*** p < 0.01' : 'p >= 0.01'
    ],
    ...(params.model.additionalCoefficients || []).map((ac) => [
      ac.variableName,
      ac.coef.toFixed(4),
      ac.stdError.toFixed(4),
      ac.tStat.toFixed(2),
      ac.pValue < 0.001 ? '< 0.001' : ac.pValue.toFixed(4),
      ac.pValue < 0.01 ? '*** p < 0.01' : 'p >= 0.01'
    ]),
    [],
    ['BONDAD DE AJUSTE & DIAGNÓSTICOS'],
    ['R² (Coeficiente de Determinación):', (params.model.rSquared * 100).toFixed(2) + '%'],
    ['R² Ajustado:', (params.model.adjRSquared * 100).toFixed(2) + '%'],
    ['F-Statistic:', params.model.fStatistic.toFixed(2)],
    ['Error Estándar de la Estimación (RMSE):', params.model.rmse.toFixed(2)],
    ['Estadístico Durbin-Watson (Autocorrelación):', params.model.durbinWatson.toFixed(3)],
    ['Advertencias Diagnósticas:', params.model.diagnostics.endogeneityWarning]
  ];
  const wsEcon = XLSX.utils.aoa_to_sheet(econometricData);
  XLSX.utils.book_append_sheet(wb, wsEcon, 'Modelo_Econometrico');

  // 4. Sheet: Escenarios de Simulación
  const simHeaders = [
    'Precio ($)',
    'Demanda Estimada (Q)',
    'Ingresos Totales ($)',
    'Costo Variable ($)',
    'Costo Fijo ($)',
    'Costo Total ($)',
    'Utilidad ($)',
    'Margen Bruto (%)',
    'Margen Contribución Unitario ($)',
    'Elasticidad (ε)',
    'Factible según Reglas'
  ];
  const simRows = params.optimization.simulationGrid.map((pt) => [
    Number(pt.price.toFixed(2)),
    Math.round(pt.quantity),
    Math.round(pt.revenue),
    Math.round(pt.variableCost),
    Math.round(pt.fixedCost),
    Math.round(pt.totalCost),
    Math.round(pt.profit),
    Number(pt.grossMarginPct.toFixed(1)),
    Number(pt.contributionMarginUnit.toFixed(2)),
    Number(pt.elasticity.toFixed(2)),
    pt.isFeasible ? 'SÍ' : 'NO: ' + pt.constraintViolations.join('; ')
  ]);
  const wsSim = XLSX.utils.aoa_to_sheet([simHeaders, ...simRows]);
  XLSX.utils.book_append_sheet(wb, wsSim, 'Simulacion_Precios');

  // 5. Sheet: Recomendaciones Estratégicas
  const recHeaders = [
    'Eje Estratégico',
    'Estrategia',
    'Precio Recomendado ($)',
    'Impacto Económico Esperado',
    'Riesgos & Mitigación',
    'Alineación'
  ];
  const recRows = params.recommendations.map((r) => [
    r.category.toUpperCase(),
    r.title,
    Number(r.recommendedPrice.toFixed(2)),
    r.expectedImpact,
    r.risksAndMitigation,
    r.suitabilityScore.toUpperCase()
  ]);
  const wsRec = XLSX.utils.aoa_to_sheet([recHeaders, ...recRows]);
  XLSX.utils.book_append_sheet(wb, wsRec, 'Estrategias_Recomendadas');

  // Trigger download
  const filename = `Pricing_Analytics_${params.productName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportSimulationCSV(grid: {
  price: number;
  quantity: number;
  revenue: number;
  totalCost: number;
  profit: number;
  grossMarginPct: number;
  elasticity: number;
}[]) {
  const headers = 'Precio,Demanda,Ingresos,Costos,Utilidad,MargenPct,Elasticidad\n';
  const rows = grid
    .map(
      (r) =>
        `${r.price.toFixed(2)},${Math.round(r.quantity)},${Math.round(r.revenue)},${Math.round(r.totalCost)},${Math.round(r.profit)},${r.grossMarginPct.toFixed(1)},${r.elasticity.toFixed(2)}`
    )
    .join('\n');

  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'simulacion_precios_escenarios.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
