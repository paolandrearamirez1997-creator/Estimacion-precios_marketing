/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorPreset, CleanedDataPoint } from '../types/pricing';

export const SECTOR_PRESETS: SectorPreset[] = [
  {
    id: 'retail',
    name: 'Retail y Comercio Minorista',
    iconName: 'ShoppingCart',
    description: 'Comercio multicanal, supermercados, tiendas departamentales y marketplaces con alta rotación.',
    defaultMinMarginPct: 22,
    typicalElasticityRange: [-2.5, -1.2],
    typicalFixedCostRatio: 0.25,
    keyDrivers: ['Promociones', 'Precio competidor', 'Ubicación / Canal', 'Canasta de compra'],
    recommendedModel: 'multivariable',
    regulatoryConstraints: 'Regulación de precios transparentes y normativas de promociones y descuentos engañosos.'
  },
  {
    id: 'cpg',
    name: 'Consumo Masivo (CPG / Alimentos)',
    iconName: 'Package',
    description: 'Bienes de alta rotación, alimentos, bebidas, cuidado personal y del hogar.',
    defaultMinMarginPct: 28,
    typicalElasticityRange: [-2.2, -1.1],
    typicalFixedCostRatio: 0.35,
    keyDrivers: ['Costos de materias primas', 'Presencia en canal moderno vs tradicional', 'Estacionalidad'],
    recommendedModel: 'linear',
    regulatoryConstraints: 'Controles sanitarios, etiquetado frontal nutricional y posibles precios acordados o canastas básicas.'
  },
  {
    id: 'saas',
    name: 'Tecnología y Servicios Digitales (SaaS)',
    iconName: 'Cpu',
    description: 'Modelos de suscripción recurrente, software en la nube, plataformas B2B y apps digitales.',
    defaultMinMarginPct: 65,
    typicalElasticityRange: [-1.8, -0.6],
    typicalFixedCostRatio: 0.75,
    keyDrivers: ['Costo de adquisición de clientes (CAC)', 'Churn / Retención', 'Valor percibido', 'Costos de I+D'],
    recommendedModel: 'log_log',
    regulatoryConstraints: 'Privacidad de datos (GDPR/CCPA), impuestos sobre servicios digitales transfronterizos.'
  },
  {
    id: 'fintech',
    name: 'Financiero y Fintech',
    iconName: 'Landmark',
    description: 'Microcréditos, billeteras digitales, seguros embebidos, pasarelas de pago y comisiones bancarias.',
    defaultMinMarginPct: 35,
    typicalElasticityRange: [-1.5, -0.7],
    typicalFixedCostRatio: 0.45,
    keyDrivers: ['Tasa de interés de referencia', 'Costo de riesgo / mora esperada', 'Costo de fondeo'],
    recommendedModel: 'semilog',
    regulatoryConstraints: 'Tasas máximas de usura legal, regulaciones bancarias de solvencia y protección al consumidor financiero.'
  },
  {
    id: 'manufacturing',
    name: 'Manufactura e Industria',
    iconName: 'Factory',
    description: 'Transformación de insumos, bienes intermedios, maquinaria, empaques y repuestos industriales.',
    defaultMinMarginPct: 20,
    typicalElasticityRange: [-1.6, -0.8],
    typicalFixedCostRatio: 0.40,
    keyDrivers: ['Economías de escala', 'Capacidad instalada', 'Precios de commodities', 'Contratos marco B2B'],
    recommendedModel: 'linear',
    regulatoryConstraints: 'Normas técnicas ISO, aranceles de importación/exportación y regulaciones ambientales.'
  },
  {
    id: 'healthcare',
    name: 'Salud y Farmacéutica',
    iconName: 'Activity',
    description: 'Medicamentos éticos y OTC, dispositivos médicos, clínicas y servicios asistenciales.',
    defaultMinMarginPct: 40,
    typicalElasticityRange: [-0.9, -0.3],
    typicalFixedCostRatio: 0.50,
    keyDrivers: ['Baja sustituibilidad clínica', 'Patentes', 'Regulación de precios máximos', 'Cobertura aseguradoras'],
    recommendedModel: 'linear',
    regulatoryConstraints: 'Control estricto de precios de medicamentos esenciales, registros sanitarios obligatorios.'
  },
  {
    id: 'telecom',
    name: 'Telecomunicaciones',
    iconName: 'Radio',
    description: 'Planes móviles, fibra óptica, conectividad corporativa y servicios de streaming paquetizados.',
    defaultMinMarginPct: 45,
    typicalElasticityRange: [-2.0, -1.3],
    typicalFixedCostRatio: 0.65,
    keyDrivers: ['Estructura de costos hundidos de infraestructura', 'Guerra de portabilidad', 'Paquetes convergentes'],
    recommendedModel: 'log_log',
    regulatoryConstraints: 'Regulación de portabilidad numérica, espectro radioeléctrico y neutralidad de red.'
  },
  {
    id: 'education',
    name: 'Educación y EdTech',
    iconName: 'GraduationCap',
    description: 'Matrículas académicas, programas ejecutivos, bootcamps y plataformas de formación continua.',
    defaultMinMarginPct: 30,
    typicalElasticityRange: [-1.2, -0.5],
    typicalFixedCostRatio: 0.55,
    keyDrivers: ['Prestigio institucional', 'Retorno de inversión (ROI salarial)', 'Becas y financiamiento'],
    recommendedModel: 'semilog',
    regulatoryConstraints: 'Límites o supervisiones ministeriales en incrementos de aranceles anuales.'
  },
  {
    id: 'hospitality',
    name: 'Turismo y Hotelería',
    iconName: 'Plane',
    description: 'Tarifas hoteleras, aerolíneas, paquetes turísticos y gestión de ingresos (Yield Management).',
    defaultMinMarginPct: 30,
    typicalElasticityRange: [-2.8, -1.4],
    typicalFixedCostRatio: 0.60,
    keyDrivers: ['Estacionalidad alta/baja', 'Ventana de reserva anticipada', 'Capacidad perecedera'],
    recommendedModel: 'log_log',
    regulatoryConstraints: 'Impuestos turísticos, regulaciones aeronáuticas y derechos de cancelación de pasajeros.'
  },
  {
    id: 'logistics',
    name: 'Transporte y Logística',
    iconName: 'Truck',
    description: 'Transporte de carga, última milla, paquetería express y servicios de bodegaje.',
    defaultMinMarginPct: 15,
    typicalElasticityRange: [-1.4, -0.9],
    typicalFixedCostRatio: 0.30,
    keyDrivers: ['Precio del combustible (diésel)', 'Densidad de rutas', 'Factor de ocupación de vehículos'],
    recommendedModel: 'linear',
    regulatoryConstraints: 'Peajes, tarifas reguladas mínimas de fletes e inspecciones viales.'
  },
  {
    id: 'other',
    name: 'Otros Sectores / Servicios Generales',
    iconName: 'Layers',
    description: 'Servicios profesionales, consultoría, consultorios y negocios especializados.',
    defaultMinMarginPct: 25,
    typicalElasticityRange: [-1.5, -1.0],
    typicalFixedCostRatio: 0.35,
    keyDrivers: ['Diferenciación', 'Relación con el cliente', 'Nivel de servicio'],
    recommendedModel: 'linear',
    regulatoryConstraints: 'Regulaciones comerciales generales y normativas tributarias.'
  }
];

export interface BenchmarkDatasetMeta {
  id: string;
  sectorId: string;
  productName: string;
  category: string;
  description: string;
  defaultVariableCost: number;
  defaultFixedCosts: number;
  targetMarginPct: number;
  capacityLimit: number;
  currentPrice: number;
  data: CleanedDataPoint[];
}

/**
 * 5 Benchmark datasets calibrated with realistic econometric relationships
 */
export const BENCHMARK_DATASETS: BenchmarkDatasetMeta[] = [
  // 1. RETAIL & CPG: Café Molido Gourmet 500g (Weekly supermarket scan data)
  {
    id: 'retail_cafe_gourmet',
    sectorId: 'retail',
    productName: 'Café Molido Premium 500g',
    category: 'Alimentos y Abarrotes',
    description: 'Serie semanal de 52 semanas en cadena de supermercados. Incluye variación de precios por promociones, demanda en unidades y precio del principal competidor.',
    defaultVariableCost: 8.50,
    defaultFixedCosts: 14000,
    targetMarginPct: 35,
    capacityLimit: 8500,
    currentPrice: 16.50,
    data: generateRetailCoffeeData()
  },

  // 2. SAAS: Plan Pro Cloud Workspace (Monthly subscription seat)
  {
    id: 'saas_cloud_pro',
    sectorId: 'saas',
    productName: 'CloudWorkspace Pro (Asiento / Mes)',
    category: 'Software B2B / Cloud',
    description: 'Registro mensual de 36 meses con precios de suscripción probados mediante test A/B y ajustes de catálogo, volumen de licencias y CAC.',
    defaultVariableCost: 6.20,
    defaultFixedCosts: 48000,
    targetMarginPct: 65,
    capacityLimit: 15000,
    currentPrice: 49.00,
    data: generateSaaSData()
  },

  // 3. FARMA: Analgésico Forte 20 Tabletas
  {
    id: 'pharma_analgesico',
    sectorId: 'healthcare',
    productName: 'Analgésico Forte 200mg (Caja x 20)',
    category: 'Medicamento OTC / Farmacia',
    description: 'Ventas en cadena nacional de farmacias. Demanda con baja elasticidad precio por ser producto de alivio inmediato.',
    defaultVariableCost: 2.30,
    defaultFixedCosts: 22000,
    targetMarginPct: 45,
    capacityLimit: 12000,
    currentPrice: 7.90,
    data: generatePharmaData()
  },

  // 4. BEBIDAS / CONSUMO: Bebida Isotónica 500ml
  {
    id: 'cpg_isotonica',
    sectorId: 'cpg',
    productName: 'Bebida Hidratante Isotónica 500ml',
    category: 'Bebidas Deportivas',
    description: 'Rotación mensual en distribuidores mayoristas y canal moderno con alta competencia y promociones agresivas.',
    defaultVariableCost: 0.85,
    defaultFixedCosts: 18500,
    targetMarginPct: 28,
    capacityLimit: 50000,
    currentPrice: 2.10,
    data: generateBeverageData()
  },

  // 5. FINTECH: Microcrédito Express (Comisión / Tasa de Desembolso)
  {
    id: 'fintech_microcredito',
    sectorId: 'fintech',
    productName: 'Microcrédito Express $1,000 (Costo Total Efectivo %)',
    category: 'Crédito Digital Inmediato',
    description: 'Volumen mensual de colocaciones crediticias según tasa efectiva cobrada y costo de riesgo de mora.',
    defaultVariableCost: 11.50, // Costo de fondeo + provisión de riesgo crediticio esperado
    defaultFixedCosts: 32000,
    targetMarginPct: 30,
    capacityLimit: 6000,
    currentPrice: 28.00, // Tasa efectiva 28%
    data: generateFintechData()
  }
];

function generateRetailCoffeeData(): CleanedDataPoint[] {
  // Underlying model: Q = 5800 - 240 * P + 85 * P_comp + epsilon
  const rows: CleanedDataPoint[] = [];
  const basePrices = [
    14.20, 14.50, 14.80, 15.00, 15.20, 15.50, 15.80, 16.00, 16.20, 16.50,
    16.80, 17.00, 17.20, 17.50, 17.80, 18.00, 18.20, 18.50, 18.90, 19.20,
    19.50, 19.80, 20.20, 20.50, 20.90, 21.20
  ];

  let week = 1;
  for (let i = 0; i < 52; i++) {
    const p = basePrices[i % basePrices.length] + (Math.sin(i / 4) * 0.4);
    const compP = 16.00 + (Math.cos(i / 5) * 1.5) + ((i % 5 === 0) ? -1.0 : 0.5);
    // Demand function with realistic noise
    const noise = (Math.sin(i * 3.7) * 90) + (Math.cos(i * 1.9) * 60);
    const q = Math.round(5900 - 235 * p + 88 * compP + noise);
    const rev = Number((p * q).toFixed(2));
    const costUnit = 8.50;

    rows.push({
      id: `SEM-${week.toString().padStart(2, '0')}`,
      precio: Number(p.toFixed(2)),
      cantidad: Math.max(500, q),
      ingresos: rev,
      costoUnitario: costUnit,
      costoFijo: 14000 / 52,
      competenciaPrecio: Number(compP.toFixed(2)),
      descuento: p < 16.0 ? Number(((18.0 - p) / 18.0 * 100).toFixed(1)) : 0,
      fecha: `2025-W${week.toString().padStart(2, '0')}`,
      canal: i % 2 === 0 ? 'Supermercados' : 'Tiendas de Conveniencia',
      segmento: 'Consumidor Hogar',
      producto: 'Café Molido Premium 500g'
    });
    week++;
  }
  return rows;
}

function generateSaaSData(): CleanedDataPoint[] {
  // Underlying Log-Log model: ln(Q) = 11.2 - 1.35 * ln(P)
  const rows: CleanedDataPoint[] = [];
  const prices = [
    29.0, 32.0, 35.0, 39.0, 42.0, 45.0, 49.0, 52.0, 55.0, 59.0, 65.0, 69.0, 75.0, 79.0
  ];

  for (let m = 1; m <= 36; m++) {
    const p = prices[(m - 1) % prices.length];
    const compP = 49.0 + (Math.sin(m) * 6.0);
    const noiseFactor = 1 + (Math.sin(m * 2.3) * 0.08);
    // Constant elasticity demand: Q = exp(11.1) * P^(-1.32)
    const expectedQ = Math.round(Math.exp(11.1) * Math.pow(p, -1.32) * noiseFactor);
    const q = Math.max(120, expectedQ);

    rows.push({
      id: `MES-${m.toString().padStart(2, '0')}`,
      precio: p,
      cantidad: q,
      ingresos: p * q,
      costoUnitario: 6.20,
      costoFijo: 48000 / 12,
      competenciaPrecio: Number(compP.toFixed(2)),
      fecha: `2024-${((m % 12) + 1).toString().padStart(2, '0')}`,
      canal: m % 3 === 0 ? 'Inbound / Web' : 'Ventas B2B Directas',
      segmento: 'Pymes y Startups',
      producto: 'CloudWorkspace Pro'
    });
  }
  return rows;
}

function generatePharmaData(): CleanedDataPoint[] {
  // Inelastic demand: Q = 8200 - 280 * P (low sensitivity)
  const rows: CleanedDataPoint[] = [];
  const prices = [6.20, 6.50, 6.80, 7.10, 7.50, 7.90, 8.20, 8.50, 8.90, 9.20, 9.60, 10.00];

  for (let i = 0; i < 40; i++) {
    const p = prices[i % prices.length];
    const compP = 8.00 + (Math.sin(i / 3) * 0.8);
    const noise = Math.cos(i * 1.5) * 110;
    const q = Math.round(8400 - 290 * p + 70 * compP + noise);

    rows.push({
      id: `REG-${(i + 1).toString().padStart(3, '0')}`,
      precio: p,
      cantidad: q,
      ingresos: Number((p * q).toFixed(2)),
      costoUnitario: 2.30,
      costoFijo: 22000 / 12,
      competenciaPrecio: Number(compP.toFixed(2)),
      fecha: `2025-M${(i % 12) + 1}`,
      canal: i % 2 === 0 ? 'Cadenas de Farmacia' : 'Farmacias Independientes',
      segmento: 'Adultos / Consumo Familiar',
      producto: 'Analgésico Forte 200mg'
    });
  }
  return rows;
}

function generateBeverageData(): CleanedDataPoint[] {
  // High volume CPG: Q = 48000 - 11500 * P
  const rows: CleanedDataPoint[] = [];
  const prices = [1.60, 1.75, 1.85, 1.95, 2.05, 2.15, 2.25, 2.35, 2.45, 2.55, 2.70];

  for (let i = 0; i < 48; i++) {
    const p = prices[i % prices.length];
    const compP = 2.10 + (Math.sin(i / 2) * 0.25);
    const noise = Math.sin(i * 2.8) * 950;
    const q = Math.round(49000 - 11800 * p + 3200 * compP + noise);

    rows.push({
      id: `LOTE-${(i + 1).toString().padStart(2, '0')}`,
      precio: p,
      cantidad: Math.max(2000, q),
      ingresos: Number((p * q).toFixed(2)),
      costoUnitario: 0.85,
      costoFijo: 18500 / 12,
      competenciaPrecio: Number(compP.toFixed(2)),
      fecha: `2025-W${(i % 52) + 1}`,
      canal: i % 3 === 0 ? 'Canal Tradicional (Bodegas)' : 'Supermercados / Autoservicio',
      segmento: 'Deportistas y Jóvenes',
      producto: 'Bebida Hidratante Isotónica 500ml'
    });
  }
  return rows;
}

function generateFintechData(): CleanedDataPoint[] {
  // Demand for microcredit loans: Q = 5200 - 110 * Rate
  const rows: CleanedDataPoint[] = [];
  const rates = [19.0, 21.0, 23.0, 25.0, 27.0, 28.0, 30.0, 32.0, 34.0, 36.0, 38.0];

  for (let i = 0; i < 36; i++) {
    const r = rates[i % rates.length];
    const compRate = 29.0 + (Math.sin(i) * 3.5);
    const noise = Math.cos(i * 1.8) * 85;
    const q = Math.round(5400 - 115 * r + 45 * compRate + noise);

    rows.push({
      id: `COH-${(i + 1).toString().padStart(2, '0')}`,
      precio: r,
      cantidad: Math.max(300, q),
      ingresos: Number((r * q * 10).toFixed(2)), // Fee revenue
      costoUnitario: 11.50,
      costoFijo: 32000 / 12,
      competenciaPrecio: Number(compRate.toFixed(1)),
      fecha: `2025-M${(i % 12) + 1}`,
      canal: 'App Móvil / Web Directa',
      segmento: 'Microemprendedores',
      producto: 'Microcrédito Express $1,000'
    });
  }
  return rows;
}
