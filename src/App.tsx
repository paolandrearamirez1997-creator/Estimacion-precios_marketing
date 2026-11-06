/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Upload,
  Table,
  Sparkles,
  TrendingUp,
  LineChart,
  Activity,
  DollarSign,
  Sliders,
  Rocket,
  LayoutDashboard,
  Moon,
  Sun,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  SectorType,
  ColumnProfile,
  VariableClassificationType,
  VariableModelRole,
  CleanedDataPoint,
  DataQualityReport,
  CostStructure,
  SubjectiveDemandPoint,
  SubjectiveDemandCurve
} from './types/pricing';
import { SECTOR_PRESETS, BENCHMARK_DATASETS, BenchmarkDatasetMeta } from './data/sampleDatasets';
import { profileColumns, generateQualityReport, cleanAndTransformDataset, ImputationStrategy } from './utils/dataCleaning';
import {
  fitLinearDemandModel,
  fitLogLogDemandModel,
  fitSemilogDemandModel,
  fitMultivariableDemandModel,
  buildSubjectiveDemandCurve,
  calculateElasticity,
  runPriceOptimization
} from './utils/econometrics';
import { generatePricingRecommendations } from './utils/pricingStrategy';
import { exportFullExcelWorkbook } from './utils/exportUtils';

// Modules
import { SectorModule } from './components/modules/SectorModule';
import { DataImportModule } from './components/modules/DataImportModule';
import { VariableClassificationModule } from './components/modules/VariableClassificationModule';
import { DataCleaningModule } from './components/modules/DataCleaningModule';
import { EdaModule } from './components/modules/EdaModule';
import { DemandCurveModule } from './components/modules/DemandCurveModule';
import { ElasticityModule } from './components/modules/ElasticityModule';
import { ProfitCostModule } from './components/modules/ProfitCostModule';
import { SimulationOptimizationModule } from './components/modules/SimulationOptimizationModule';
import { PricingStrategyModule } from './components/modules/PricingStrategyModule';
import { ExecutiveDashboardModule } from './components/modules/ExecutiveDashboardModule';

export type ModuleTab =
  | 'sector'
  | 'import'
  | 'classification'
  | 'cleaning'
  | 'eda'
  | 'demand'
  | 'elasticity'
  | 'profit'
  | 'simulation'
  | 'strategy'
  | 'dashboard';

const MODULES_LIST: { id: ModuleTab; index: string; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: 'sector', index: '01', label: 'Sector & Contexto', shortLabel: 'Sector', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'import', index: '02', label: 'Importación & Mapeo', shortLabel: 'Importación', icon: <Upload className="w-3.5 h-3.5" /> },
  { id: 'classification', index: '03', label: 'Tipificación Variables', shortLabel: 'Tipificación', icon: <Table className="w-3.5 h-3.5" /> },
  { id: 'cleaning', index: '04', label: 'Limpieza & Calidad', shortLabel: 'Calidad', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'eda', index: '05', label: 'Análisis EDA & Reglas', shortLabel: 'EDA', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'demand', index: '06', label: 'Curvas de Demanda', shortLabel: 'Demanda', icon: <LineChart className="w-3.5 h-3.5" /> },
  { id: 'elasticity', index: '07', label: 'Elasticidad (PED)', shortLabel: 'Elasticidad', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'profit', index: '08', label: 'Costos & Rentabilidad', shortLabel: 'Costos', icon: <DollarSign className="w-3.5 h-3.5" /> },
  { id: 'simulation', index: '09', label: 'Simulación & Optimización', shortLabel: 'Simulación', icon: <Sliders className="w-3.5 h-3.5" /> },
  { id: 'strategy', index: '10', label: 'Estrategias de Precios', shortLabel: 'Estrategias', icon: <Rocket className="w-3.5 h-3.5" /> },
  { id: 'dashboard', index: '11', label: 'Dashboard Ejecutivo', shortLabel: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('sector');
  const [darkMode, setDarkMode] = useState(false);

  // Sector & Product State
  const [selectedSector, setSelectedSector] = useState<SectorType>('retail');
  const [productName, setProductName] = useState('Café Molido Premium 500g');
  const [productDescription, setProductDescription] = useState(
    'Café de origen especial 100% arábica, canal minorista de supermercados y canal tradicional.'
  );
  const [targetMarket, setTargetMarket] = useState('Hogares y consumidores de café gourmet');

  // Benchmark / Raw data
  const initialBenchmark = BENCHMARK_DATASETS[0];
  const [rawData, setRawData] = useState<Record<string, any>[]>(initialBenchmark.data);
  const [datasetName, setDatasetName] = useState('Benchmark: Café Gourmet Retail');

  // Cost Structure State
  const [costStructure, setCostStructure] = useState<CostStructure>({
    variableCostPerUnit: initialBenchmark.defaultVariableCost,
    fixedCosts: initialBenchmark.defaultFixedCosts,
    targetMarginPct: initialBenchmark.targetMarginPct,
    capacityLimit: initialBenchmark.capacityLimit,
    maxPriceChangePct: 35
  });

  // Column Profiles & Role Assignment
  const [columnProfiles, setColumnProfiles] = useState<ColumnProfile[]>(() =>
    profileColumns(initialBenchmark.data)
  );
  const [priceCol, setPriceCol] = useState('precio');
  const [quantityCol, setQuantityCol] = useState('cantidad');

  // Cleaned Data & Audit Log
  const [cleanedData, setCleanedData] = useState<CleanedDataPoint[]>(() => {
    const { cleanedRows } = cleanAndTransformDataset(
      initialBenchmark.data,
      profileColumns(initialBenchmark.data),
      {
        handleNulls: 'median',
        removeDuplicates: true,
        filterNonPositive: true,
        handleOutliers: 'winsorize',
        priceCol: 'precio',
        quantityCol: 'cantidad'
      }
    );
    return cleanedRows;
  });

  const [auditLog, setAuditLog] = useState<string[]>([
    'Base de datos benchmark precalibrada con 52 semanas de datos de scanner comercial.'
  ]);

  // Model Selection
  const [selectedModelType, setSelectedModelType] = useState<
    'linear' | 'log_log' | 'semilog' | 'multivariable'
  >('linear');

  // Subjective Demand State
  const [subjectiveDemandPoints, setSubjectiveDemandPoints] = useState<SubjectiveDemandPoint[]>([
    { id: '1', label: 'Precio Promocional', price: 14.0, expectedQuantity: 2800, confidenceWeight: 4 },
    { id: '2', label: 'Precio Base / Regular', price: 16.5, expectedQuantity: 2050, confidenceWeight: 5 },
    { id: '3', label: 'Precio Premium / Límite', price: 20.0, expectedQuantity: 1250, confidenceWeight: 3 }
  ]);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handlers for dataset loading
  const handleLoadData = (newData: Record<string, any>[], sourceName?: string) => {
    setRawData(newData);
    setDatasetName(sourceName || 'Archivo Importado');
    const profiles = profileColumns(newData);
    setColumnProfiles(profiles);

    // Auto-detect price and quantity
    const pCol = profiles.find((p) => p.role === 'precio')?.name || profiles[0]?.name || 'precio';
    const qCol = profiles.find((p) => p.role === 'cantidad')?.name || profiles[1]?.name || 'cantidad';
    setPriceCol(pCol);
    setQuantityCol(qCol);

    // Initial clean pass
    const { cleanedRows, auditLog: logs } = cleanAndTransformDataset(newData, profiles, {
      handleNulls: 'median',
      removeDuplicates: true,
      filterNonPositive: true,
      handleOutliers: 'winsorize',
      priceCol: pCol,
      quantityCol: qCol
    });
    setCleanedData(cleanedRows);
    setAuditLog(logs);
    setActiveTab('import');
  };

  const handleLoadBenchmark = (b: BenchmarkDatasetMeta) => {
    setSelectedSector(b.sectorId as SectorType);
    setProductName(b.productName);
    setProductDescription(b.description);
    setCostStructure({
      variableCostPerUnit: b.defaultVariableCost,
      fixedCosts: b.defaultFixedCosts,
      targetMarginPct: b.targetMarginPct,
      capacityLimit: b.capacityLimit,
      maxPriceChangePct: 35
    });
    handleLoadData(b.data, `Benchmark: ${b.productName}`);
  };

  const handleUpdateClassification = (colName: string, classification: VariableClassificationType) => {
    setColumnProfiles((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, classification } : c))
    );
  };

  const handleUpdateRole = (colName: string, role: VariableModelRole) => {
    setColumnProfiles((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, role } : c))
    );
    if (role === 'precio') setPriceCol(colName);
    if (role === 'cantidad') setQuantityCol(colName);
  };

  const handleApplyCleaning = (options: {
    handleNulls: ImputationStrategy;
    removeDuplicates: boolean;
    filterNonPositive: boolean;
    handleOutliers: 'keep' | 'winsorize' | 'drop';
  }) => {
    const { cleanedRows, auditLog: logs } = cleanAndTransformDataset(rawData, columnProfiles, {
      ...options,
      priceCol,
      quantityCol
    });
    setCleanedData(cleanedRows);
    setAuditLog(logs);
  };

  // Quality Reports
  const initialReport = useMemo(
    () => generateQualityReport(rawData, priceCol, quantityCol),
    [rawData, priceCol, quantityCol]
  );

  const cleanedReport = useMemo(
    () => generateQualityReport(cleanedData, 'precio', 'cantidad'),
    [cleanedData]
  );

  // Econometric Models
  const allModels = useMemo(() => {
    const pts = cleanedData.map((d) => ({ precio: d.precio, cantidad: d.cantidad }));
    return {
      linear: fitLinearDemandModel(pts),
      logLog: fitLogLogDemandModel(pts),
      semilog: fitSemilogDemandModel(pts),
      multivariable: fitMultivariableDemandModel(cleanedData)
    };
  }, [cleanedData]);

  const activeModel = useMemo(() => {
    if (selectedModelType === 'log_log') return allModels.logLog;
    if (selectedModelType === 'semilog') return allModels.semilog;
    if (selectedModelType === 'multivariable') return allModels.multivariable;
    return allModels.linear;
  }, [allModels, selectedModelType]);

  // Subjective Demand Curve
  const subjectiveDemand = useMemo(() => {
    return buildSubjectiveDemandCurve(subjectiveDemandPoints);
  }, [subjectiveDemandPoints]);

  // Current Price
  const currentPrice = useMemo(() => {
    if (cleanedData.length === 0) return 15;
    const pVals = cleanedData.map((d) => d.precio);
    return pVals.reduce((a, b) => a + b, 0) / pVals.length;
  }, [cleanedData]);

  // Data Range Bounds
  const dataRange = useMemo(() => {
    if (cleanedData.length === 0) return { minPrice: 5, maxPrice: 50 };
    const pVals = cleanedData.map((d) => d.precio);
    return {
      minPrice: Math.min(...pVals),
      maxPrice: Math.max(...pVals)
    };
  }, [cleanedData]);

  // Profit Optimization
  const optimization = useMemo(() => {
    return runPriceOptimization(activeModel, costStructure, currentPrice, dataRange);
  }, [activeModel, costStructure, currentPrice, dataRange]);

  // Elasticity Analysis
  const elasticity = useMemo(() => {
    return calculateElasticity(
      activeModel,
      currentPrice,
      optimization.optimalProfitPrice
    );
  }, [activeModel, currentPrice, optimization.optimalProfitPrice]);

  // Pricing Recommendations
  const recommendations = useMemo(() => {
    return generatePricingRecommendations({
      optimization,
      model: activeModel,
      elasticity,
      cost: costStructure,
      sector: selectedSector
    });
  }, [optimization, activeModel, elasticity, costStructure, selectedSector]);

  // Next tab helper
  const navigateToNextTab = () => {
    const currentIndex = MODULES_LIST.findIndex((m) => m.id === activeTab);
    if (currentIndex < MODULES_LIST.length - 1) {
      setActiveTab(MODULES_LIST[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar adhering to the Top Bar Contract (§2) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 print:hidden">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            P*
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pricing Analytics Platform
          </span>
        </div>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveTab('sector')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'sector' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Sector &amp; Mapeo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demand')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'demand' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Curvas de Demanda
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'simulation' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Simulación &amp; Optimización
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Dashboard Ejecutivo
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + Theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cambiar tema claro/oscuro"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() =>
              exportFullExcelWorkbook({
                productName,
                sectorName: selectedSector,
                cleanedData,
                model: activeModel,
                optimization,
                elasticity,
                recommendations
              })
            }
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </header>

      {/* Breadcrumb & Project Metadata Strip */}
      <div className="bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {productName}
          </span>
          <span aria-hidden="true">·</span>
          <span>{datasetName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{cleanedData.length} registros</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            P* = ${optimization.optimalProfitPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span>Modelo: {activeModel.modelName.split(' ')[0]}</span>
          <span aria-hidden="true">·</span>
          <span>R² = {(activeModel.rSquared * 100).toFixed(1)}%</span>
          <span aria-hidden="true">·</span>
          <span>|ε| = {Math.abs(elasticity.pointElasticityAtOptimalPrice).toFixed(2)}</span>
        </div>
      </div>

      {/* Module Navigation Tabs Strip */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 overflow-x-auto print:hidden">
        <div className="flex items-center gap-1 py-1.5 min-w-max">
          {MODULES_LIST.map((mod) => {
            const isActive = mod.id === activeTab;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveTab(mod.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="opacity-75">{mod.icon}</span>
                <span>
                  <strong className="font-mono mr-1">{mod.index}.</strong>
                  {mod.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'sector' && (
          <SectorModule
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
            productName={productName}
            onChangeProductName={setProductName}
            productDescription={productDescription}
            onChangeProductDescription={setProductDescription}
            targetMarket={targetMarket}
            onChangeTargetMarket={setTargetMarket}
            costStructure={costStructure}
            onChangeCostStructure={setCostStructure}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'import' && (
          <DataImportModule
            rawData={rawData}
            onLoadData={handleLoadData}
            columnProfiles={columnProfiles}
            onUpdateColumnRole={handleUpdateRole}
            priceCol={priceCol}
            quantityCol={quantityCol}
            onSetPriceCol={setPriceCol}
            onSetQuantityCol={setQuantityCol}
            onNext={navigateToNextTab}
            onLoadBenchmark={handleLoadBenchmark}
          />
        )}

        {activeTab === 'classification' && (
          <VariableClassificationModule
            columnProfiles={columnProfiles}
            onUpdateClassification={handleUpdateClassification}
            onUpdateRole={handleUpdateRole}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'cleaning' && (
          <DataCleaningModule
            initialReport={initialReport}
            cleanedReport={cleanedReport}
            auditLog={auditLog}
            onApplyCleaning={handleApplyCleaning}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'eda' && (
          <EdaModule
            data={cleanedData}
            costStructure={costStructure}
            onChangeCostStructure={setCostStructure}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'demand' && (
          <DemandCurveModule
            data={cleanedData}
            activeModel={activeModel}
            allModels={allModels}
            onSelectModelType={setSelectedModelType}
            currentPrice={currentPrice}
            optimalPrice={optimization.optimalProfitPrice}
            subjectiveDemand={subjectiveDemand}
            onUpdateSubjectivePoints={setSubjectiveDemandPoints}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'elasticity' && (
          <ElasticityModule
            elasticity={elasticity}
            currentPrice={currentPrice}
            optimalPrice={optimization.optimalProfitPrice}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'profit' && (
          <ProfitCostModule
            costStructure={costStructure}
            onChangeCostStructure={setCostStructure}
            optimization={optimization}
            model={activeModel}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationOptimizationModule
            optimization={optimization}
            model={activeModel}
            costStructure={costStructure}
            currentPrice={currentPrice}
            onSetSimulatedPrice={() => {}}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'strategy' && (
          <PricingStrategyModule
            recommendations={recommendations}
            optimization={optimization}
            elasticity={elasticity}
            costStructure={costStructure}
            onNext={navigateToNextTab}
          />
        )}

        {activeTab === 'dashboard' && (
          <ExecutiveDashboardModule
            productName={productName}
            selectedSector={selectedSector}
            cleanedData={cleanedData}
            model={activeModel}
            optimization={optimization}
            elasticity={elasticity}
            costStructure={costStructure}
            recommendations={recommendations}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-xs text-slate-500 bg-white dark:bg-slate-900 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Pricing Analytics &amp; Demand Optimization Platform
            </span>
            <span aria-hidden="true">·</span>
            <span>Econometría MCO, Elasticidad y Microeconomía Industrial</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Metodología: Varian / Simon / Nagle / Wooldridge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
