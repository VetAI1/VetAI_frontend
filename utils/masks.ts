export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const formatCNPJ = (value: string): string => {
  const characters = value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 14);
  if (characters.length <= 2) return characters;
  if (characters.length <= 5)
    return `${characters.slice(0, 2)}.${characters.slice(2)}`;
  if (characters.length <= 8)
    return `${characters.slice(0, 2)}.${characters.slice(2, 5)}.${characters.slice(5)}`;
  if (characters.length <= 12)
    return `${characters.slice(0, 2)}.${characters.slice(2, 5)}.${characters.slice(5, 8)}/${characters.slice(8)}`;
  return `${characters.slice(0, 2)}.${characters.slice(2, 5)}.${characters.slice(5, 8)}/${characters.slice(8, 12)}-${characters.slice(12)}`;
};

export const formatCEP = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length <= 5
    ? digits
    : `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const unmaskCNPJ = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);

export const unmaskCEP = (value: string): string =>
  value.replace(/\D/g, '').slice(0, 8);

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// Máscara de digitação: os dígitos entram pela direita, como centavos.
// "15" -> R$ 0,15 -> "150" -> R$ 1,50
export const formatCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const unmaskCurrency = (value: string): number => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits ? parseInt(digits, 10) / 100 : 0;
};

export const currencyToMasked = (value: number): string =>
  value > 0
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '';
