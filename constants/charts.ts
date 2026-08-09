// Paleta dos gráficos: variações do teal, a cor do sistema. A ordem alterna
// entre tons escuros e claros para que fatias vizinhas continuem distinguíveis
// num gráfico monocromático.
export const CHART_COLORS = [
  '#0d9488', // teal-600 — cor base do sistema
  '#5eead4', // teal-300
  '#0f766e', // teal-700
  '#2dd4bf', // teal-400
  '#115e59', // teal-800
  '#14b8a6', // teal-500
  '#99f6e4', // teal-200
  '#134e4a', // teal-900
] as const;

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!;
}

// Mesmo tom com ~10% de opacidade, para o preenchimento sob a linha.
export function chartFill(index: number): string {
  return `${chartColor(index)}1a`;
}
