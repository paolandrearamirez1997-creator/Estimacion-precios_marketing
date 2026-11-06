/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SectorType =
  | 'retail'
  | 'cpg'
  | 'saas'
  | 'fintech'
  | 'manufacturing'
  | 'telecom'
  | 'healthcare'
  | 'education'
  | 'hospitality'
  | 'logistics'
  | 'other';

export interface SectorPreset {
  id: SectorType;
  name: string;
  iconName: string;
  description: string;
  defaultMinMarginPct: number;
  typicalElasticityRange: [number, number];
  typicalFixedCostRatio: number; // percentage of total cost
  keyDrivers: string[];
  recommendedModel: 'linear' | 'log_log' | 'semilog' | 'multivariable';
  regulatoryConstraints: string;
}

export type VariableClassificationType =
  | 'cuantitativa_continua'
  | 'cuantitativa_discreta'
  | 'cualitativa_nominal'
  | 'cualitativa_ordinal';

export type VariableModelRole =
  | 'precio'
  | 'cantidad'
  | 'ingresos'
  | 'costo_unitario'
  | 'costo_fijo'
  | 'producto'
  | 'fecha'
  | 'segmento'
  | 'canal'
  | 'competencia_precio'
  | 'descuento'
  | 'gasto_marketing'
  | 'otra_explicativa'
  | 'ignorar';

export interface ColumnProfile {
  name: string;
  originalType: 'number' | 'string' | 'date' | 'boolean';
  classification: VariableClassificationType;
  role: VariableModelRole;
  uniqueValuesCount: number;
  missingCount: number;
  missingPct: number;
  sampleValues: (string | number)[];
  isNumeric: boolean;
}

export interface DataRow {
  [key: string]: any;
}

export interface CleanedDataPoint {
  id: string | number;
  precio: number;
  cantidad: number;
  ingresos?: number;
  costoUnitario?: number;
  costoFijo?: number;
  competenciaPrecio?: number;
  descuento?: number;
  fecha?: string;
  segmento?: string;
  canal?: string;
  producto?: string;
  [key: string]: any;
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  missingTotal: number;
  duplicatesCount: number;
  nonPositivePricesCount: number;
  nonPositiveQuantitiesCount: number;
  outliersCount: number;
  iqrBounds: {
    price: { lower: number; upper: number };
    quantity: { lower: number; upper: number };
  };
  healthScore: number; // 0 to 100
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  p25: number;
  p75: number;
  p90: number;
  cv: number; // Coeficiente de variación (std / mean)
}

export interface RegressionResult {
  modelType: 'linear' | 'log_log' | 'semilog_log_lin' | 'semilog_lin_log' | 'multivariable';
  modelName: string;
  formula: string;
  intercept: number;
  interceptStdError: number;
  interceptTStat: number;
  interceptPValue: number;
  slope: number; // beta1 for price
  slopeStdError: number;
  slopeTStat: number;
  slopePValue: number;
  additionalCoefficients?: {
    variableName: string;
    coef: number;
    stdError: number;
    tStat: number;
    pValue: number;
  }[];
  rSquared: number;
  adjRSquared: number;
  fStatistic: number;
  fPValue: number;
  rmse: number;
  durbinWatson: number;
  sampleSize: number;
  degreesOfFreedom: number;
  confidenceIntervalSlope: [number, number];
  predict: (price: number, otherVars?: Record<string, number>) => number;
  diagnostics: {
    isPriceSignificant: boolean;
    expectedNegativeSlope: boolean;
    multicollinearityWarning?: boolean;
    endogeneityWarning: string;
    extrapolationMinPrice: number;
    extrapolationMaxPrice: number;
  };
}

export interface SubjectiveDemandPoint {
  id: string;
  label: string;
  price: number;
  expectedQuantity: number;
  confidenceWeight: number; // 1 to 5
  notes?: string;
}

export interface SubjectiveDemandCurve {
  anchorPoints: SubjectiveDemandPoint[];
  interpolatedCurve: { price: number; quantity: number }[];
  expertElasticity: number;
  referencePrice: number;
  notes: string;
}

export interface ElasticityAnalysis {
  pointElasticityAtCurrentPrice: number;
  pointElasticityAtOptimalPrice: number;
  averageArcElasticity: number;
  type: 'elastica' | 'inelastica' | 'unitaria';
  explanation: string;
  pricingAdvice: string;
  sensitivityTable: {
    priceVariationPct: number;
    simulatedPrice: number;
    simulatedQuantity: number;
    quantityVariationPct: number;
    simulatedRevenue: number;
    revenueVariationPct: number;
  }[];
}

export interface CostStructure {
  variableCostPerUnit: number;
  fixedCosts: number;
  capacityLimit?: number;
  targetMarginPct: number;
  minPriceFloor?: number;
  maxPriceCeiling?: number;
  maxPriceChangePct?: number; // max allowed +/- % variation from current
}

export interface ScenarioPoint {
  price: number;
  quantity: number;
  revenue: number;
  variableCost: number;
  fixedCost: number;
  totalCost: number;
  profit: number;
  grossMarginPct: number;
  contributionMarginUnit: number;
  elasticity: number;
  isFeasible: boolean;
  constraintViolations: string[];
}

export interface OptimizationResult {
  currentPrice: number;
  currentQuantity: number;
  currentRevenue: number;
  currentProfit: number;
  currentMarginPct: number;

  optimalProfitPrice: number;
  optimalProfitQuantity: number;
  optimalProfitRevenue: number;
  optimalProfit: number;
  optimalProfitMarginPct: number;
  profitGainPct: number;

  optimalRevenuePrice: number;
  optimalRevenueQuantity: number;
  optimalRevenue: number;
  optimalRevenueProfit: number;

  targetMarginPrice: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;

  scenarios: {
    pessimistic: ScenarioSummary;
    base: ScenarioSummary;
    optimistic: ScenarioSummary;
  };

  simulationGrid: ScenarioPoint[];
}

export interface ScenarioSummary {
  name: string;
  price: number;
  quantity: number;
  revenue: number;
  profit: number;
  marginPct: number;
  demandShiftPct: number;
  costShiftPct: number;
}

export interface StrategicRecommendation {
  category: 'lanzamiento' | 'competencia' | 'complementarios' | 'tacticas';
  title: string;
  strategyName: string;
  description: string;
  recommendedPrice: number;
  expectedImpact: string;
  risksAndMitigation: string;
  suitabilityScore: 'alta' | 'media' | 'baja';
}
