/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScenarioPoint } from '../../types/pricing';

interface Props {
  simulationGrid: ScenarioPoint[];
  optimalProfitPrice: number;
  optimalRevenuePrice: number;
  currentPrice: number;
}

export const ProfitRevenueChart: React.FC<Props> = ({
  simulationGrid,
  optimalProfitPrice,
  optimalRevenuePrice,
  currentPrice
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!simulationGrid || simulationGrid.length === 0) return null;

  const width = 740;
  const height = 380;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minP = simulationGrid[0].price;
  const maxP = simulationGrid[simulationGrid.length - 1].price;

  const allProfits = simulationGrid.map((p) => p.profit);
  const allRevenues = simulationGrid.map((p) => p.revenue);
  const allCosts = simulationGrid.map((p) => p.totalCost);

  const minVal = Math.min(0, ...allProfits);
  const maxVal = Math.max(...allRevenues) * 1.1;

  const scaleX = (p: number) => padLeft + ((p - minP) / (maxP - minP)) * chartW;
  const scaleY = (v: number) => padTop + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  // Build path strings
  const revPath = simulationGrid
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.price)} ${scaleY(pt.revenue)}`)
    .join(' ');

  const costPath = simulationGrid
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.price)} ${scaleY(pt.totalCost)}`)
    .join(' ');

  const profitPath = simulationGrid
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.price)} ${scaleY(pt.profit)}`)
    .join(' ');

  // Zero-profit baseline (Break-even line)
  const zeroY = scaleY(0);

  // Profit area polygon (fill between profit curve and zero line)
  const profitArea =
    simulationGrid
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.price)} ${scaleY(Math.max(0, pt.profit))}`)
      .join(' ') +
    ` L ${scaleX(maxP)} ${zeroY} L ${scaleX(minP)} ${zeroY} Z`;

  // Optimal profit point
  const optProfitPoint = simulationGrid.reduce((prev, curr) =>
    Math.abs(curr.price - optimalProfitPrice) < Math.abs(prev.price - optimalProfitPrice) ? curr : prev
  );

  // Optimal revenue point
  const optRevPoint = simulationGrid.reduce((prev, curr) =>
    Math.abs(curr.price - optimalRevenuePrice) < Math.abs(prev.price - optimalRevenuePrice) ? curr : prev
  );

  const xTicks = 6;
  const yTicks = 5;
  const xTickValues = Array.from({ length: xTicks }).map(
    (_, i) => minP + (i / (xTicks - 1)) * (maxP - minP)
  );
  const yTickValues = Array.from({ length: yTicks }).map(
    (_, i) => minVal + (i / (yTicks - 1)) * (maxVal - minVal)
  );

  const hoveredData = hoverIndex !== null ? simulationGrid[hoverIndex] : null;

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      {/* Header / Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Frontera de Rentabilidad: Ingresos, Costos y Utilidad π(P)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maximización analítica de utilidad sujeta a estructura de costos y elasticidad
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-emerald-500 rounded inline-block" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Utilidad Neta π</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-blue-600 rounded inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Ingresos Totales (IT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-rose-500 rounded inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Costos Totales (CT)</span>
          </div>
        </div>
      </div>

      <div
        className="w-full overflow-x-auto relative"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const svgX = (mouseX / rect.width) * width;
          if (svgX >= padLeft && svgX <= width - padRight) {
            const relRatio = (svgX - padLeft) / chartW;
            const idx = Math.min(
              simulationGrid.length - 1,
              Math.max(0, Math.round(relRatio * (simulationGrid.length - 1)))
            );
            setHoverIndex(idx);
          } else {
            setHoverIndex(null);
          }
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] select-none cursor-crosshair"
        >
          <defs>
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
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
                  ${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k
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

          {/* Zero Break-even line */}
          <line
            x1={padLeft}
            y1={zeroY}
            x2={width - padRight}
            y2={zeroY}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          <text
            x={width - padRight - 5}
            y={zeroY - 5}
            textAnchor="end"
            className="text-[10px] font-mono fill-slate-400"
          >
            Punto de Equilibrio ($0)
          </text>

          {/* Profit fill */}
          <path d={profitArea} fill="url(#profitFill)" />

          {/* Curves */}
          <path d={costPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,3" />
          <path d={revPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
          <path d={profitPath} fill="none" stroke="#10b981" strokeWidth="3" />

          {/* Optimal Profit Peak Marker */}
          {optProfitPoint && (
            <g>
              <line
                x1={scaleX(optProfitPoint.price)}
                y1={padTop}
                x2={scaleX(optProfitPoint.price)}
                y2={height - padBottom}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <circle
                cx={scaleX(optProfitPoint.price)}
                cy={scaleY(optProfitPoint.profit)}
                r="7"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={scaleX(optProfitPoint.price)}
                y={scaleY(optProfitPoint.profit) - 12}
                textAnchor="middle"
                className="text-[11px] font-bold fill-emerald-600 dark:fill-emerald-400 font-mono"
              >
                Max Utilidad: ${Math.round(optProfitPoint.profit).toLocaleString()}
              </text>
            </g>
          )}

          {/* Optimal Revenue Peak Marker */}
          {optRevPoint && Math.abs(optRevPoint.price - optProfitPoint.price) > 1 && (
            <g>
              <circle
                cx={scaleX(optRevPoint.price)}
                cy={scaleY(optRevPoint.revenue)}
                r="5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={scaleX(optRevPoint.price)}
                y={scaleY(optRevPoint.revenue) - 10}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-blue-600 dark:fill-blue-400 font-mono"
              >
                Max Ingresos
              </text>
            </g>
          )}

          {/* Current Price Marker */}
          {currentPrice >= minP && currentPrice <= maxP && (
            <g>
              <line
                x1={scaleX(currentPrice)}
                y1={padTop}
                x2={scaleX(currentPrice)}
                y2={height - padBottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={scaleX(currentPrice)}
                y={height - padBottom + 32}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-500 font-mono"
              >
                P. Actual
              </text>
            </g>
          )}

          {/* Hover Crosshair */}
          {hoveredData && (
            <g>
              <line
                x1={scaleX(hoveredData.price)}
                y1={padTop}
                x2={scaleX(hoveredData.price)}
                y2={height - padBottom}
                stroke="#0f172a"
                strokeWidth="1"
                className="opacity-40"
              />
              <circle
                cx={scaleX(hoveredData.price)}
                cy={scaleY(hoveredData.profit)}
                r="4.5"
                fill="#10b981"
              />
              <circle
                cx={scaleX(hoveredData.price)}
                cy={scaleY(hoveredData.revenue)}
                r="4"
                fill="#2563eb"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredData && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white text-xs rounded-lg shadow-xl px-3 py-2 -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(scaleX(hoveredData.price) / width) * 100}%`,
              top: `${scaleY(hoveredData.profit)}px`
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">
              Precio: ${hoveredData.price.toFixed(2)} · Q: {Math.round(hoveredData.quantity).toLocaleString()}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
              <span className="text-blue-400">Ingresos:</span>
              <span className="text-right text-white">${Math.round(hoveredData.revenue).toLocaleString()}</span>
              <span className="text-rose-400">Costos:</span>
              <span className="text-right text-white">${Math.round(hoveredData.totalCost).toLocaleString()}</span>
              <span className="text-emerald-400 font-semibold">Utilidad:</span>
              <span className="text-right font-semibold text-emerald-300">
                ${Math.round(hoveredData.profit).toLocaleString()}
              </span>
              <span className="text-slate-400">Margen:</span>
              <span className="text-right text-slate-300">{hoveredData.grossMarginPct.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
