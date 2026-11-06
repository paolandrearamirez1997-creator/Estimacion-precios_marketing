/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OptimizationResult,
  RegressionResult,
  ElasticityAnalysis,
  CostStructure,
  StrategicRecommendation,
  SectorType
} from '../types/pricing';

export function generatePricingRecommendations(params: {
  optimization: OptimizationResult;
  model: RegressionResult;
  elasticity: ElasticityAnalysis;
  cost: CostStructure;
  sector: SectorType;
}): StrategicRecommendation[] {
  const { optimization, model, elasticity, cost } = params;
  const currentP = optimization.currentPrice;
  const optP = optimization.optimalProfitPrice;
  const cv = cost.variableCostPerUnit;
  const recommendations: StrategicRecommendation[] = [];

  // A. Estrategia de Lanzamiento / Posicionamiento
  const isElastic = elasticity.type === 'elastica';
  const penetrationPrice = Math.max(cv * 1.15, optP * 0.85);
  const skimmingPrice = optP * 1.25;

  if (isElastic) {
    recommendations.push({
      category: 'lanzamiento',
      strategyName: 'Precio de Penetración Rápida',
      title: 'Penetración de Mercado para Captura de Cuota',
      description: `Dada la alta sensibilidad al precio (|ε| = ${Math.abs(elasticity.pointElasticityAtCurrentPrice).toFixed(2)}), una estrategia de penetración a $${penetrationPrice.toFixed(2)} acelerará la adopción y creará barreras de entrada antes de que los rivales reaccionen.`,
      recommendedPrice: penetrationPrice,
      expectedImpact: `Aumento estimado de volumen de +${Math.round(((model.predict(penetrationPrice) - optimization.currentQuantity) / Math.max(1, optimization.currentQuantity)) * 100)}% en unidades vendidas.`,
      risksAndMitigation: 'Riesgo de anclar una percepción de baja calidad. Mitigar comunicando un "precio especial de lanzamiento por tiempo limitado".',
      suitabilityScore: 'alta'
    });
  } else {
    recommendations.push({
      category: 'lanzamiento',
      strategyName: 'Descremación de Precios (Price Skimming)',
      title: 'Descremación Gradual Basada en Valor Percibido',
      description: `La inelasticidad de la demanda (|ε| = ${Math.abs(elasticity.pointElasticityAtCurrentPrice).toFixed(2)}) permite capturar el excedente del consumidor pionero mediante un precio inicial de $${skimmingPrice.toFixed(2)}, descendiendo posteriormente hacia $${optP.toFixed(2)}.`,
      recommendedPrice: skimmingPrice,
      expectedImpact: `Margen unitario ampliado a ${(((skimmingPrice - cv) / skimmingPrice) * 100).toFixed(1)}% con alta rentabilidad inicial.`,
      risksAndMitigation: 'Atrae rápidamente a imitadores de bajo costo. Mitigar patentando o acelerando el roadmap de producto.',
      suitabilityScore: 'alta'
    });
  }

  // B. Entrada de Competencia & Respuesta Competitiva
  const compCoef = model.additionalCoefficients?.find((c) =>
    c.variableName.toLowerCase().includes('compet')
  );
  const hasCompData = compCoef && compCoef.coef > 0;
  const defensivePrice = Math.max(cv * 1.1, optP * 0.92);

  recommendations.push({
    category: 'competencia',
    strategyName: 'Defensa de Cuota y Precios Blindados',
    title: 'Estrategia de Respuesta ante Ataques Competitivos',
    description: hasCompData
      ? `Se detectó una elasticidad cruzada positiva (+${compCoef?.coef.toFixed(3)}). Si un competidor reduce su precio un 10%, nuestra demanda caería aproximadamente ${(compCoef!.coef * 10).toFixed(1)}%. Se recomienda blindar el precio base en $${optP.toFixed(2)} reforzando beneficios no monetarios.`
      : `Evitar una guerra de precios destructiva. Establecer un precio piso en $${defensivePrice.toFixed(2)} protegiendo el margen unitario mínimo de ${cost.targetMarginPct}%.`,
    recommendedPrice: defensivePrice,
    expectedImpact: 'Mantiene la rentabilidad total por encima del umbral crítico sin sacrificar la cuota ante guerra de precios.',
    risksAndMitigation: 'Erosión de márgenes si la guerra se prolonga. Enfocarse en diferenciación de servicio o garantías extendidas.',
    suitabilityScore: 'media'
  });

  // C. Productos Complementarios & Bundling
  const bundleDiscountPct = 12; // 12% bundle discount
  const bundlePrice = (optP * 1.6) * (1 - bundleDiscountPct / 100);

  recommendations.push({
    category: 'complementarios',
    strategyName: 'Estrategia de Paquetes Mixtos (Bundling)',
    title: 'Venta Cruzada y Paquetes de Alto Valor',
    description: `Ofrecer el producto principal a $${optP.toFixed(2)} o empaquetado con un complemento de bajo costo marginal con un descuento del ${bundleDiscountPct}%, fijando el bundle en $${bundlePrice.toFixed(2)}.`,
    recommendedPrice: bundlePrice,
    expectedImpact: 'Incremento del Ticket Promedio (AOV) de entre 18% y 25% y reducción del costo logístico unitario.',
    risksAndMitigation: 'Canibalización del producto individual. Asegurar que el complemento tenga un margen bruto > 60%.',
    suitabilityScore: 'alta'
  });

  // D. Tácticas Psicológicas & Precios Segmentados
  // Charm pricing ending in .99 or .90
  const floorP = Math.floor(optP);
  const charmPrice = optP - floorP > 0.5 ? floorP + 0.99 : floorP - 1 + 0.99;

  recommendations.push({
    category: 'tacticas',
    strategyName: 'Fijación de Precios Psicológicos (Charm Pricing)',
    title: 'Optimización de Umbral Psicológico (.99 / .95)',
    description: `Ajustar el precio óptimo económico ($${optP.toFixed(2)}) al umbral cognitivo inferior más cercano: $${charmPrice.toFixed(2)}. Según la literatura (Simon & Nagle), reduce la fricción de decisión al activar el sesgo del dígito izquierdo.`,
    recommendedPrice: charmPrice,
    expectedImpact: 'Incremento del ratio de conversión de entre 3% y 7% sin alterar significativamente la rentabilidad proyectada.',
    risksAndMitigation: 'En segmentos de ultra-lujo puede percibirse como descuento masivo. En ese caso, redondear a números cerrados (e.g., $${Math.round(optP)}).',
    suitabilityScore: 'alta'
  });

  // E. Precios Segmentados por Canal o Volumen
  const wholesaleDiscountPct = 18;
  const b2bTierPrice = optP * (1 - wholesaleDiscountPct / 100);

  recommendations.push({
    category: 'tacticas',
    strategyName: 'Segmentación de Precios por Volumen / Canal',
    title: 'Estructura Escalonada por Volumen (Tiered Pricing)',
    description: `Fijar $${optP.toFixed(2)} para compras unitarias y una tarifa de $${b2bTierPrice.toFixed(2)} para pedidos por volumen mayorista (> 20 unidades o clientes corporativos), capturando ambos segmentos de elasticidad.`,
    recommendedPrice: b2bTierPrice,
    expectedImpact: 'Captura de compradores con mayor elasticidad sin erosionar el margen con consumidores minoristas inelásticos.',
    risksAndMitigation: 'Arbitraje entre canales. Exigir verificación de cliente corporativo o compra mínima por contrato.',
    suitabilityScore: 'media'
  });

  return recommendations;
}
