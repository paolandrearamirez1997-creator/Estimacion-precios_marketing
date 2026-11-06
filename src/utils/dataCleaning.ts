/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ColumnProfile,
  VariableClassificationType,
  VariableModelRole,
  DataQualityReport,
  CleanedDataPoint
} from '../types/pricing';

/**
 * Infer column statistical classification and likely model role
 */
export function profileColumns(
  data: Record<string, any>[]
): ColumnProfile[] {
  if (!data || data.length === 0) return [];

  const columnNames = Object.keys(data[0]);
  const totalRows = data.length;

  return columnNames.map((name) => {
    let numericCount = 0;
    let missingCount = 0;
    const valuesSet = new Set<any>();
    const samples: (string | number)[] = [];

    data.forEach((row) => {
      const val = row[name];
      if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
        missingCount++;
      } else {
        valuesSet.add(val);
        if (typeof val === 'number' || (!isNaN(Number(val)) && typeof val !== 'boolean')) {
          numericCount++;
        }
        if (samples.length < 5) {
          samples.push(val);
        }
      }
    });

    const isNumeric = numericCount > (totalRows - missingCount) * 0.7;
    const uniqueCount = valuesSet.size;
    const missingPct = Number(((missingCount / totalRows) * 100).toFixed(1));

    // Determine statistical classification
    let classification: VariableClassificationType = 'cualitativa_nominal';
    if (isNumeric) {
      if (uniqueCount > 15 || !Number.isInteger(samples[0] as number)) {
        classification = 'cuantitativa_continua';
      } else {
        classification = 'cuantitativa_discreta';
      }
    } else {
      const lower = name.toLowerCase();
      if (
        lower.includes('nivel') ||
        lower.includes('rango') ||
        lower.includes('estrato') ||
        lower.includes('tier') ||
        lower.includes('prioridad')
      ) {
        classification = 'cualitativa_ordinal';
      } else {
        classification = 'cualitativa_nominal';
      }
    }

    // Determine default model role using naming heuristics
    const lower = name.toLowerCase();
    let role: VariableModelRole = 'otra_explicativa';

    if (
      lower.includes('precio') ||
      lower.includes('price') ||
      lower.includes('tarifa') ||
      lower.includes('tasa') ||
      lower === 'p'
    ) {
      if (lower.includes('compet')) {
        role = 'competencia_precio';
      } else {
        role = 'precio';
      }
    } else if (
      lower.includes('cantidad') ||
      lower.includes('unidades') ||
      lower.includes('qty') ||
      lower.includes('quantity') ||
      lower.includes('volumen') ||
      lower.includes('demanda') ||
      lower === 'q'
    ) {
      role = 'cantidad';
    } else if (
      lower.includes('ingreso') ||
      lower.includes('revenue') ||
      lower.includes('venta_total') ||
      lower.includes('ventas')
    ) {
      role = 'ingresos';
    } else if (
      lower.includes('costo_unit') ||
      lower.includes('costo_var') ||
      lower.includes('cost_unit') ||
      lower.includes('unit_cost')
    ) {
      role = 'costo_unitario';
    } else if (lower.includes('costo_fijo') || lower.includes('fixed_cost')) {
      role = 'costo_fijo';
    } else if (lower.includes('fecha') || lower.includes('date') || lower.includes('mes') || lower.includes('semana')) {
      role = 'fecha';
    } else if (lower.includes('segmento') || lower.includes('segment') || lower.includes('cliente')) {
      role = 'segmento';
    } else if (lower.includes('canal') || lower.includes('channel') || lower.includes('tienda')) {
      role = 'canal';
    } else if (lower.includes('descuento') || lower.includes('discount') || lower.includes('promo')) {
      role = 'descuento';
    } else if (lower.includes('producto') || lower.includes('item') || lower.includes('sku') || lower.includes('ref')) {
      role = 'producto';
    }

    return {
      name,
      originalType: isNumeric ? 'number' : 'string',
      classification,
      role,
      uniqueValuesCount: uniqueCount,
      missingCount,
      missingPct,
      sampleValues: samples,
      isNumeric
    };
  });
}

/**
 * Generate comprehensive Data Quality Report
 */
export function generateQualityReport(
  data: Record<string, any>[],
  priceCol: string,
  quantityCol: string
): DataQualityReport {
  const totalRows = data.length;
  const totalColumns = data.length > 0 ? Object.keys(data[0]).length : 0;

  if (totalRows === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      missingTotal: 0,
      duplicatesCount: 0,
      nonPositivePricesCount: 0,
      nonPositiveQuantitiesCount: 0,
      outliersCount: 0,
      iqrBounds: {
        price: { lower: 0, upper: 0 },
        quantity: { lower: 0, upper: 0 }
      },
      healthScore: 100
    };
  }

  let missingTotal = 0;
  let nonPositivePrices = 0;
  let nonPositiveQuantities = 0;

  const priceValues: number[] = [];
  const quantityValues: number[] = [];

  // Check duplicate rows using string serialization
  const rowSignatures = new Set<string>();
  let duplicatesCount = 0;

  data.forEach((row) => {
    const sig = JSON.stringify(row);
    if (rowSignatures.has(sig)) {
      duplicatesCount++;
    } else {
      rowSignatures.add(sig);
    }

    Object.values(row).forEach((v) => {
      if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
        missingTotal++;
      }
    });

    const p = Number(row[priceCol]);
    const q = Number(row[quantityCol]);

    if (!isNaN(p)) {
      if (p <= 0) nonPositivePrices++;
      else priceValues.push(p);
    }
    if (!isNaN(q)) {
      if (q <= 0) nonPositiveQuantities++;
      else quantityValues.push(q);
    }
  });

  // Calculate IQR bounds for price and quantity
  const getIqrBounds = (arr: number[]) => {
    if (arr.length < 4) return { lower: 0, upper: Infinity };
    const sorted = [...arr].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    return {
      lower: Math.max(0, q1 - 1.5 * iqr),
      upper: q3 + 1.5 * iqr
    };
  };

  const priceBounds = getIqrBounds(priceValues);
  const quantityBounds = getIqrBounds(quantityValues);

  let outliersCount = 0;
  data.forEach((row) => {
    const p = Number(row[priceCol]);
    const q = Number(row[quantityCol]);
    if (
      (!isNaN(p) && (p < priceBounds.lower || p > priceBounds.upper)) ||
      (!isNaN(q) && (q < quantityBounds.lower || q > quantityBounds.upper))
    ) {
      outliersCount++;
    }
  });

  // Health Score (0 - 100)
  const penalty =
    (missingTotal / (totalRows * Math.max(1, totalColumns))) * 30 +
    (duplicatesCount / totalRows) * 20 +
    (nonPositivePrices / totalRows) * 30 +
    (nonPositiveQuantities / totalRows) * 20;

  const healthScore = Math.max(10, Math.round(100 - penalty));

  return {
    totalRows,
    totalColumns,
    missingTotal,
    duplicatesCount,
    nonPositivePricesCount: nonPositivePrices,
    nonPositiveQuantitiesCount: nonPositiveQuantities,
    outliersCount,
    iqrBounds: {
      price: priceBounds,
      quantity: quantityBounds
    },
    healthScore
  };
}

export type ImputationStrategy = 'drop' | 'mean' | 'median' | 'mode' | 'winsorize';

/**
 * Apply Clean & Transform Treatments to Dataset
 */
export function cleanAndTransformDataset(
  rawRows: Record<string, any>[],
  columnProfiles: ColumnProfile[],
  options: {
    handleNulls: ImputationStrategy;
    removeDuplicates: boolean;
    filterNonPositive: boolean;
    handleOutliers: 'keep' | 'winsorize' | 'drop';
    priceCol: string;
    quantityCol: string;
  }
): {
  cleanedRows: CleanedDataPoint[];
  auditLog: string[];
} {
  const auditLog: string[] = [];
  let rows = [...rawRows];
  const initialCount = rows.length;

  // 1. Remove duplicate records
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const uniqueRows: Record<string, any>[] = [];
    rows.forEach((r) => {
      const sig = JSON.stringify(r);
      if (!seen.has(sig)) {
        seen.add(sig);
        uniqueRows.push(r);
      }
    });
    const dupCount = rows.length - uniqueRows.length;
    if (dupCount > 0) {
      auditLog.push(`Eliminados ${dupCount} registros duplicados exactos.`);
    }
    rows = uniqueRows;
  }

  // 2. Filter non-positive prices and quantities
  if (options.filterNonPositive) {
    const beforeCount = rows.length;
    rows = rows.filter((r) => {
      const p = Number(r[options.priceCol]);
      const q = Number(r[options.quantityCol]);
      return !isNaN(p) && p > 0 && !isNaN(q) && q >= 0;
    });
    const dropped = beforeCount - rows.length;
    if (dropped > 0) {
      auditLog.push(`Descartados ${dropped} registros con precios <= 0 o cantidades negativas.`);
    }
  }

  // 3. Imputation or Drop for missing values
  if (options.handleNulls === 'drop') {
    const beforeCount = rows.length;
    rows = rows.filter((r) => {
      return Object.values(r).every(
        (v) => v !== null && v !== undefined && v !== '' && (typeof v !== 'number' || !isNaN(v))
      );
    });
    const dropped = beforeCount - rows.length;
    if (dropped > 0) {
      auditLog.push(`Eliminados ${dropped} registros con campos vacíos o nulos.`);
    }
  } else {
    // Impute numeric columns
    columnProfiles.forEach((col) => {
      if (col.isNumeric) {
        const nums = rows
          .map((r) => Number(r[col.name]))
          .filter((v) => !isNaN(v) && isFinite(v));
        if (nums.length > 0) {
          let fillValue = 0;
          if (options.handleNulls === 'mean') {
            fillValue = nums.reduce((a, b) => a + b, 0) / nums.length;
          } else if (options.handleNulls === 'median') {
            const sorted = [...nums].sort((a, b) => a - b);
            fillValue = sorted[Math.floor(sorted.length / 2)];
          }
          let imputed = 0;
          rows.forEach((r) => {
            const val = r[col.name];
            if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
              r[col.name] = Number(fillValue.toFixed(2));
              imputed++;
            }
          });
          if (imputed > 0) {
            auditLog.push(`Imputados ${imputed} valores faltantes en '${col.name}' usando la ${options.handleNulls} (${fillValue.toFixed(2)}).`);
          }
        }
      }
    });
  }

  // 4. Outlier treatment (Winsorize or Drop)
  if (options.handleOutliers !== 'keep' && rows.length > 10) {
    const prices = rows.map((r) => Number(r[options.priceCol])).filter((v) => !isNaN(v));
    const sorted = [...prices].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = Math.max(0.01, q1 - 1.5 * iqr);
    const upper = q3 + 1.5 * iqr;

    if (options.handleOutliers === 'drop') {
      const beforeCount = rows.length;
      rows = rows.filter((r) => {
        const p = Number(r[options.priceCol]);
        return p >= lower && p <= upper;
      });
      const dropped = beforeCount - rows.length;
      if (dropped > 0) {
        auditLog.push(`Eliminados ${dropped} registros con precios atípicos (fuera del rango IQR [${lower.toFixed(2)}, ${upper.toFixed(2)}]).`);
      }
    } else if (options.handleOutliers === 'winsorize') {
      let capped = 0;
      rows.forEach((r) => {
        const p = Number(r[options.priceCol]);
        if (p < lower) {
          r[options.priceCol] = Number(lower.toFixed(2));
          capped++;
        } else if (p > upper) {
          r[options.priceCol] = Number(upper.toFixed(2));
          capped++;
        }
      });
      if (capped > 0) {
        auditLog.push(`Winsorizados ${capped} registros de precio atípicos a los percentiles límite de Tukey.`);
      }
    }
  }

  // Map to CleanedDataPoint structure
  const roleMap: Record<VariableModelRole, string> = {
    precio: options.priceCol,
    cantidad: options.quantityCol,
    ingresos: '',
    costo_unitario: '',
    costo_fijo: '',
    producto: '',
    fecha: '',
    segmento: '',
    canal: '',
    competencia_precio: '',
    descuento: '',
    gasto_marketing: '',
    otra_explicativa: '',
    ignorar: ''
  };

  columnProfiles.forEach((cp) => {
    if (cp.role !== 'ignorar' && cp.role !== 'otra_explicativa') {
      roleMap[cp.role] = cp.name;
    }
  });

  const cleanedRows: CleanedDataPoint[] = rows.map((r, idx) => {
    const p = Number(r[roleMap.precio] ?? r[options.priceCol]);
    const q = Number(r[roleMap.cantidad] ?? r[options.quantityCol]);
    const rev = roleMap.ingresos && r[roleMap.ingresos] ? Number(r[roleMap.ingresos]) : Number((p * q).toFixed(2));
    const costUnit = roleMap.costo_unitario && r[roleMap.costo_unitario] ? Number(r[roleMap.costo_unitario]) : undefined;
    const compP = roleMap.competencia_precio && r[roleMap.competencia_precio] ? Number(r[roleMap.competencia_precio]) : undefined;

    return {
      id: r.id || `REG-${idx + 1}`,
      precio: p,
      cantidad: q,
      ingresos: rev,
      costoUnitario: costUnit,
      costoFijo: roleMap.costo_fijo && r[roleMap.costo_fijo] ? Number(r[roleMap.costo_fijo]) : undefined,
      competenciaPrecio: compP,
      descuento: roleMap.descuento && r[roleMap.descuento] ? Number(r[roleMap.descuento]) : undefined,
      fecha: roleMap.fecha ? String(r[roleMap.fecha]) : undefined,
      segmento: roleMap.segmento ? String(r[roleMap.segmento]) : undefined,
      canal: roleMap.canal ? String(r[roleMap.canal]) : undefined,
      producto: roleMap.producto ? String(r[roleMap.producto]) : undefined,
      ...r
    };
  });

  auditLog.unshift(`Depuración completada: de ${initialCount} registros iniciales a ${cleanedRows.length} registros listos para modelamiento.`);

  return { cleanedRows, auditLog };
}
