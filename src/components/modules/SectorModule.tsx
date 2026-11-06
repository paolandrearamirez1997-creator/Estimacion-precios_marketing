/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Building2,
  ShoppingCart,
  Package,
  Cpu,
  Landmark,
  Factory,
  Radio,
  Activity,
  GraduationCap,
  Plane,
  Truck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  Sliders
} from 'lucide-react';
import { SectorType, SectorPreset, CostStructure } from '../../types/pricing';
import { SECTOR_PRESETS } from '../../data/sampleDatasets';

interface Props {
  selectedSector: SectorType;
  onSelectSector: (sector: SectorType) => void;
  productName: string;
  onChangeProductName: (val: string) => void;
  productDescription: string;
  onChangeProductDescription: (val: string) => void;
  targetMarket: string;
  onChangeTargetMarket: (val: string) => void;
  costStructure: CostStructure;
  onChangeCostStructure: (val: CostStructure) => void;
  onNext: () => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Landmark: <Landmark className="w-5 h-5" />,
  Factory: <Factory className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Radio: <Radio className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Plane: <Plane className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />
};

export const SectorModule: React.FC<Props> = ({
  selectedSector,
  onSelectSector,
  productName,
  onChangeProductName,
  productDescription,
  onChangeProductDescription,
  targetMarket,
  onChangeTargetMarket,
  costStructure,
  onChangeCostStructure,
  onNext
}) => {
  const currentPreset = SECTOR_PRESETS.find((s) => s.id === selectedSector) || SECTOR_PRESETS[0];

  const handleSectorChange = (s: SectorPreset) => {
    onSelectSector(s.id);
    onChangeCostStructure({
      ...costStructure,
      targetMarginPct: s.defaultMinMarginPct
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Módulo 01 · Fundamento Sectorial &amp; Reglas de Negocio
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Identificación del Sector Económico y Contexto del Producto
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              La microeconomía y la teoría de pricing (Simon, Nagle, Varian) demuestran que la sensibilidad al precio, la estructura de costos fijos y las regulaciones varían radicalmente según la industria. Selecciona el sector para adaptar automáticamente los modelos y restricciones.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>11 Sectores Calibrados</span>
          </div>
        </div>

        {/* Sector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
          {SECTOR_PRESETS.map((sector) => {
            const isSelected = sector.id === selectedSector;
            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => handleSectorChange(sector)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ICONS_MAP[sector.iconName] || <Building2 className="w-5 h-5" />}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                      Activo
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {sector.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {sector.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sector Profile & Business Constraints Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product & Market Description */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Caracterización del Producto o Servicio a Optimizar
            </h3>
            <p className="text-xs text-slate-500">
              Define la referencia comercial, propuesta de valor y segmento meta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Producto / Referencia (SKU)
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => onChangeProductName(e.target.value)}
                placeholder="Ej. Café Molido Gourmet 500g, Plan SaaS Pro"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mercado Objetivo / Segmento Prioritario
              </label>
              <input
                type="text"
                value={targetMarket}
                onChange={(e) => onChangeTargetMarket(e.target.value)}
                placeholder="Ej. Consumidores Premium, Pymes en Crecimiento, B2B"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción Comercial y Factores Diferenciadores
            </label>
            <textarea
              rows={3}
              value={productDescription}
              onChange={(e) => onChangeProductDescription(e.target.value)}
              placeholder="Detalla los atributos que justifican el precio, alternativas sustitutas en el mercado y canales de distribución..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
            />
          </div>

          {/* Preset Drivers & Regulatory context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Drivers Clave del Sector {currentPreset.name}:
              </span>
              <ul className="text-[11px] text-slate-500 space-y-0.5">
                {currentPreset.keyDrivers.map((driver, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Consideraciones Regulatorias:
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {currentPreset.regulatoryConstraints}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Sector Defaults & Business Constraints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Parámetros &amp; Reglas de Negocio
              </h3>
              <p className="text-xs text-slate-500">
                Límites operativos que respetará el algoritmo de optimización.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Margen Mínimo Requerido (%)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {costStructure.targetMarginPct}%
                  </span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={costStructure.targetMarginPct}
                  onChange={(e) =>
                    onChangeCostStructure({
                      ...costStructure,
                      targetMarginPct: Number(e.target.value)
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span>Límite de Variación Máxima de Precio (±%)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {costStructure.maxPriceChangePct || 35}%
                  </span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={costStructure.maxPriceChangePct || 35}
                  onChange={(e) =>
                    onChangeCostStructure({
                      ...costStructure,
                      maxPriceChangePct: Number(e.target.value)
                    })
                  }
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Evita saltos abruptos de precio que generen rechazo o quejas de clientes.
                </span>
              </div>

              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-1">
                <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                  Rango Típico de Elasticidad:
                </div>
                <div className="font-mono text-indigo-700 dark:text-indigo-400">
                  ε entre {currentPreset.typicalElasticityRange[0]} y {currentPreset.typicalElasticityRange[1]}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[10px] pt-1">
                  Modelo econométrico inicial recomendado: <strong className="text-slate-700 dark:text-slate-300">{currentPreset.recommendedModel.toUpperCase()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNext}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar a Carga de Datos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
