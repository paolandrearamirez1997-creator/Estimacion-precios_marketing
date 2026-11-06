/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RegressionResult, SubjectiveDemandPoint } from '../../types/pricing';

interface Props {
  points: { precio: number; cantidad: number }[];
  model: RegressionResult;
  currentPrice: number;
  optimalPrice: number;
  subjectivePoints?: SubjectiveDemandPoint[];
  subjectiveCurve?: { price: number; quantity: number }[];
  showSubjective?: boolean;
}

export const DemandCurveChart: React.FC<Props> = ({
  points,
  model,
  currentPrice,
  optimalPrice,
  subjectivePoints = [],
  subjectiveCurve = [],
  showSubjective = false
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    price: number;
    quantity: number;
    x: number;
    y: number;
    source: string;
  } | null>(null);

  // Compute bounding box
  const allPrices = points.map((p) => p.precio);
  if (showSubjective && subjectivePoints.length > 0) {
    subjectivePoints.forEach((sp) => allPrices.push(sp.price));
  }
  allPrices.push(currentPrice, optimalPrice);

  const minP = Math.max(0.1, Math.min(...allPrices) * 0.8);
  const maxP = Math.max(...allPrices) * 1.25;

  const allQuantities = points.map((p) => p.cantidad);
  if (showSubjective && subjectivePoints.length > 0) {
    subjectivePoints.forEach((sp) => allQuantities.push(sp.expectedQuantity));
  }
  const maxQ = Math.max(
    ...allQuantities,
    model.predict(minP),
    model.predict(currentPrice)
  ) * 1.15;

  // SVG coordinate dimensions
  const width = 740;
  const height = 400;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const scaleX = (p: number) => padLeft + ((p - minP) / (maxP - minP)) * chartW;
  const scaleY = (q: number) => padTop + chartH - (Math.max(0, q) / maxQ) * chartH;

  // Generate fitted regression line path
  const numSteps = 80;
  const lineCoords: [number, number][] = [];
  const ciUpperCoords: [number, number][] = [];
  const ciLowerCoords: [number, number][] = [];

  for (let i = 0; i <= numSteps; i++) {
    const p = minP + (i / numSteps) * (maxP - minP);
    const q = model.predict(p);
    const x = scaleX(p);
    const y = scaleY(q);
    lineCoords.push([x, y]);

    // Approximate confidence ribbon based on RMSE
    const ciDelta = model.rmse * 1.2;
    ciUpperCoords.push([x, scaleY(q + ciDelta)]);
    ciLowerCoords.push([x, scaleY(Math.max(0, q - ciDelta))]);
  }

  const fittedPath = lineCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');

  // CI Ribbon polygon
  const ciPolygon =
    ciUpperCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ') +
    ' ' +
    [...ciLowerCoords].reverse().map((c) => `L ${c[0]} ${c[1]}`).join(' ') +
    ' Z';

  // Subjective curve path if enabled
  let subjectivePath = '';
  if (showSubjective && subjectiveCurve.length > 0) {
    subjectivePath = subjectiveCurve
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.price)} ${scaleY(pt.quantity)}`)
      .join(' ');
  }

  // Grid ticks
  const xTicks = 6;
  const yTicks = 5;
  const xTickValues = Array.from({ length: xTicks }).map(
    (_, i) => minP + (i / (xTicks - 1)) * (maxP - minP)
  );
  const yTickValues = Array.from({ length: yTicks }).map(
    (_, i) => (i / (yTicks - 1)) * maxQ
  );

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      {/* Header / Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Curva de Demanda Estimada vs Observaciones Reales
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {model.formula} · R² = {(model.rSquared * 100).toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Datos Históricos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-indigo-600 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Curva Econométrica</span>
          </div>
          {showSubjective && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-amber-500 border-t border-dashed border-amber-600 inline-block" />
              <span className="text-slate-600 dark:text-slate-400">Curva Subjetiva</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">P* Óptimo</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] select-none"
        >
          <defs>
            <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTickValues.map((val, i) => {
            const y = scaleY(val);
            return (
              <g key={`y-${i}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
                >
                  {Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {xTickValues.map((val, i) => {
            const x = scaleX(val);
            return (
              <g key={`x-${i}`}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={height - padBottom}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
                >
                  ${val.toFixed(val > 10 ? 1 : 2)}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-xs font-medium fill-slate-600 dark:fill-slate-400"
          >
            Precio de Venta ($ / unidad)
          </text>
          <text
            transform={`rotate(-90)`}
            x={-(height / 2)}
            y={18}
            textAnchor="middle"
            className="text-xs font-medium fill-slate-600 dark:fill-slate-400"
          >
            Cantidad Demandada (Q)
          </text>

          {/* 95% Confidence Interval Band */}
          <path d={ciPolygon} fill="url(#ciGradient)" />

          {/* Econometric Fitted Curve */}
          <path
            d={fittedPath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Subjective Demand Curve if active */}
          {showSubjective && subjectivePath && (
            <path
              d={subjectivePath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="5,4"
            />
          )}

          {/* Historical Data Points */}
          {points.map((pt, i) => {
            const cx = scaleX(pt.precio);
            const cy = scaleY(pt.cantidad);
            return (
              <circle
                key={`pt-${i}`}
                cx={cx}
                cy={cy}
                r="4.5"
                className="fill-blue-500/80 hover:fill-blue-700 cursor-pointer transition-all hover:scale-125"
                stroke="#ffffff"
                strokeWidth="1"
                onMouseEnter={() =>
                  setHoveredPoint({
                    price: pt.precio,
                    quantity: pt.cantidad,
                    x: cx,
                    y: cy,
                    source: 'Observación Histórica'
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Subjective Anchor Points */}
          {showSubjective &&
            subjectivePoints.map((sp, i) => {
              const cx = scaleX(sp.price);
              const cy = scaleY(sp.expectedQuantity);
              return (
                <rect
                  key={`sp-${i}`}
                  x={cx - 5}
                  y={cy - 5}
                  width="10"
                  height="10"
                  className="fill-amber-500 hover:fill-amber-600 cursor-pointer"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      price: sp.price,
                      quantity: sp.expectedQuantity,
                      x: cx,
                      y: cy,
                      source: `Ancla Subjetiva: ${sp.label}`
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

          {/* Current Price Marker */}
          {currentPrice >= minP && currentPrice <= maxP && (
            <g>
              <line
                x1={scaleX(currentPrice)}
                y1={padTop}
                x2={scaleX(currentPrice)}
                y2={height - padBottom}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <circle
                cx={scaleX(currentPrice)}
                cy={scaleY(model.predict(currentPrice))}
                r="6"
                fill="#64748b"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={scaleX(currentPrice)}
                y={padTop - 8}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-600 dark:fill-slate-400 font-mono"
              >
                P. Actual: ${currentPrice.toFixed(2)}
              </text>
            </g>
          )}

          {/* Optimal Price Marker */}
          {optimalPrice >= minP && optimalPrice <= maxP && (
            <g>
              <line
                x1={scaleX(optimalPrice)}
                y1={padTop}
                x2={scaleX(optimalPrice)}
                y2={height - padBottom}
                stroke="#10b981"
                strokeWidth="2"
              />
              <circle
                cx={scaleX(optimalPrice)}
                cy={scaleY(model.predict(optimalPrice))}
                r="7"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={scaleX(optimalPrice)}
                y={padTop - 8}
                textAnchor="middle"
                className="text-[11px] font-bold fill-emerald-600 dark:fill-emerald-400 font-mono"
              >
                P* Óptimo: ${optimalPrice.toFixed(2)}
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs rounded-lg shadow-xl px-3 py-2 -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${hoveredPoint.y}px` }}
          >
            <div className="font-semibold text-slate-200">{hoveredPoint.source}</div>
            <div className="font-mono text-slate-300">
              Precio: <span className="text-white">${hoveredPoint.price.toFixed(2)}</span>
            </div>
            <div className="font-mono text-slate-300">
              Demanda: <span className="text-white">{Math.round(hoveredPoint.quantity).toLocaleString()} un.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
