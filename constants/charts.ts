const DEFAULT_PALETTE = [
  '#0d9488',
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#f97316',
] as const;

// As cores reais vivem nos tokens --chart-1..5 (globals.css) para funcionarem
// em light e dark. Fallback hex cobre SSR/pré-hidratação.
function readChartVar(index: number): string | null {
  if (typeof window === 'undefined') return null;
  const root = getComputedStyle(document.documentElement);
  return (
    root.getPropertyValue(`--chart-${(index % 5) + 1}`).trim() || null
  );
}

export function chartColor(index: number): string {
  return (
    readChartVar(index) ??
    DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]!
  );
}

// Mesmo tom com ~16% de opacidade, para o preenchimento sob a linha.
export function chartFill(index: number): string {
  const base = readChartVar(index);
  if (base?.startsWith('oklch')) {
    return base.replace(')', ' / 0.16)');
  }
  return `${DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]!}29`;
}
