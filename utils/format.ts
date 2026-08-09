export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function formatPrice(cents: number): string {
  return formatCurrency(cents);
}

// Só a primeira letra: o resto do texto é preservado como foi digitado, para
// não descaracterizar siglas e nomes de medicamentos.
export function capitalize(value: string): string {
  const text = value.trim();
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
