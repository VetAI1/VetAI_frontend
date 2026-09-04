'use client';

import { useId } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

const WIDTH = 240;
const PADDING = 3;

/**
 * Curva suave por Catmull-Rom convertida em bézier cúbica — mantém a linha
 * passando exatamente pelos pontos, sem o overshoot de um spline solto.
 */
function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  const [first] = points;
  if (!first) return '';
  if (points.length === 1) return `M ${first.x} ${first.y}`;

  let path = `M ${first.x} ${first.y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? points[index + 1];
    if (!p0 || !p1 || !p2 || !p3) continue;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export function Sparkline({ data, color, height = 44 }: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return <div style={{ height }} aria-hidden="true" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const innerHeight = height - PADDING * 2;

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * WIDTH,
    y: PADDING + innerHeight - ((value - min) / span) * innerHeight,
  }));

  const line = buildPath(points);
  const last = points[points.length - 1];
  const area = `${line} L ${WIDTH} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {last && (
        <circle
          cx={last.x}
          cy={last.y}
          r="2.5"
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
