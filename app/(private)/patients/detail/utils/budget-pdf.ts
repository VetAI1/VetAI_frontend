import type { jsPDF } from 'jspdf';

import { SPECIE_LABELS } from '@/constants';
import type { User } from '@/types/auth';
import type { Patient, Specie } from '@/types/patient';
import type { Hospital } from '@/types/settings';
import type { Tutor } from '@/types/tutor';
import { calcAge } from '@/utils/date-format';
import { formatCPF } from '@/utils/masks';

export interface BudgetItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface BudgetData {
  patient: Patient;
  tutor: Tutor | null;
  hospital: Hospital | null;
  user: User;
  items: BudgetItem[];
  validityDays: number;
  notes?: string;
  logoUrl?: string;
}

const TEAL: [number, number, number] = [26, 128, 112];
const TEXT: [number, number, number] = [0, 0, 0];
const MUTED: [number, number, number] = [85, 85, 85];
const RULE: [number, number, number] = [204, 204, 204];
const RULE_LIGHT: [number, number, number] = [230, 230, 230];

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function money(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function fmtDateBr(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

function buildClinicAddressLine(hospital: Hospital | null): string {
  const address = hospital?.address;
  if (!address) return '';
  const parts: string[] = [];
  if (address.street) {
    parts.push(
      address.number ? `${address.street}, ${address.number}` : address.street,
    );
  }
  if (address.complement) parts.push(address.complement);
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.city && address.state) {
    parts.push(`${address.city} - ${address.state}`);
  } else if (address.city) parts.push(address.city);
  if (address.zip_code) parts.push(`CEP ${address.zip_code}`);
  return parts.join(', ');
}

export function budgetTotal(items: BudgetItem[]): number {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );
}

async function loadLogo(
  url: string,
): Promise<{ dataUrl: string; ratio: number } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('read error'));
      reader.readAsDataURL(blob);
    });
    const ratio = await new Promise<number>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image.width / image.height || 3);
      image.onerror = () => resolve(3);
      image.src = dataUrl;
    });
    return { dataUrl, ratio };
  } catch {
    return null;
  }
}

interface InlinePart {
  text: string;
  bold?: boolean;
}

// Desenha rótulos em negrito seguidos do valor. A quebra é por palavra, não
// por parte: um endereço longo preenche o resto da linha e continua abaixo,
// em vez de pular inteiro para a linha seguinte.
function drawInlineParts(
  pdf: jsPDF,
  parts: InlinePart[],
  startY: number,
  lineHeight = 5,
): number {
  const right = MARGIN + CONTENT_WIDTH;
  let x = MARGIN;
  let y = startY;

  for (const part of parts) {
    pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
    const tokens = part.text.split(/(\s+)/).filter(Boolean);

    for (const token of tokens) {
      const width = pdf.getTextWidth(token);
      if (x + width > right && x > MARGIN) {
        x = MARGIN;
        y += lineHeight;
        // Espaço que sobrou da quebra não deve indentar a linha nova.
        if (/^\s+$/.test(token)) continue;
      }
      pdf.text(token, x, y);
      x += width;
    }
  }

  return y + lineHeight;
}

function drawRule(
  pdf: jsPDF,
  y: number,
  color: [number, number, number],
  thickness = 0.2,
): void {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(thickness);
  pdf.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
}

const SECTION_TITLE_SIZE = 11;

function drawSectionTitle(pdf: jsPDF, title: string, y: number): number {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(SECTION_TITLE_SIZE);
  pdf.setTextColor(...TEXT);
  pdf.text(title, MARGIN, y);
  drawRule(pdf, y + 2.2, RULE);
  return y + 7.5;
}

export async function buildBudgetPdf(data: BudgetData): Promise<jsPDF> {
  const { patient, tutor, hospital, user, items, validityDays, notes, logoUrl } =
    data;

  const { default: JsPDF } = await import('jspdf');
  const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const issuedAt = new Date();
  const validUntil = new Date(issuedAt);
  validUntil.setDate(validUntil.getDate() + validityDays);

  let y = MARGIN;

  // ---------- Cabeçalho ----------
  const logo = logoUrl ? await loadLogo(logoUrl) : null;
  if (logo) {
    const logoHeight = 9;
    pdf.addImage(
      logo.dataUrl,
      'PNG',
      MARGIN,
      y,
      logoHeight * logo.ratio,
      logoHeight,
    );
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...MUTED);
    pdf.text('gerenciamento completo e diagnósticos eficientes', MARGIN, y + 14);
    pdf.text('para clínicas veterinárias', MARGIN, y + 17);
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(...TEAL);
    pdf.text('vetai', MARGIN, y + 7);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...MUTED);
    pdf.text('gerenciamento de clínicas veterinárias', MARGIN, y + 11);
  }

  const rightEdge = MARGIN + CONTENT_WIDTH;
  let headerY = y + 3;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...TEXT);
  pdf.text('Orçamento', rightEdge, headerY, { align: 'right' });

  pdf.setFontSize(8.5);
  const clinicLines = [
    hospital?.name?.toUpperCase(),
    buildClinicAddressLine(hospital).toUpperCase(),
    hospital?.phone,
  ].filter((line): line is string => Boolean(line));

  for (const line of clinicLines) {
    const wrapped = pdf.splitTextToSize(line, CONTENT_WIDTH * 0.62) as string[];
    for (const piece of wrapped) {
      headerY += 4.2;
      pdf.text(piece, rightEdge, headerY, { align: 'right' });
    }
  }

  y = Math.max(headerY, y + 19) + 4;
  drawRule(pdf, y, TEAL, 0.7);
  y += 8;

  // ---------- Paciente ----------
  y = drawSectionTitle(pdf, 'Identificação do animal', y);
  pdf.setFontSize(9);
  pdf.setTextColor(...TEXT);

  const specieLabel = SPECIE_LABELS[patient.specie as Specie] ?? patient.specie;
  const patientParts: InlinePart[] = [
    { text: 'Animal: ', bold: true },
    { text: `${patient.name}    ` },
    { text: 'Espécie: ', bold: true },
    { text: `${specieLabel}    ` },
  ];
  if (patient.breed) {
    patientParts.push({ text: 'Raça: ', bold: true }, {
      text: `${patient.breed}    `,
    });
  }
  if (patient.birth_date) {
    patientParts.push({ text: 'Idade: ', bold: true }, {
      text: `${calcAge(new Date(patient.birth_date))}    `,
    });
  }
  if (patient.sex) {
    patientParts.push({ text: 'Sexo: ', bold: true }, {
      text: patient.sex === 'MALE' ? 'Macho' : 'Fêmea',
    });
  }
  y = drawInlineParts(pdf, patientParts, y) + 3;

  // ---------- Tutor ----------
  y = drawSectionTitle(pdf, 'Tutor', y);
  pdf.setFontSize(9);
  const tutorParts: InlinePart[] = [
    { text: 'Nome: ', bold: true },
    { text: `${tutor?.name ?? '—'}    ` },
  ];
  if (tutor?.cpf) {
    tutorParts.push({ text: 'CPF: ', bold: true }, {
      text: `${formatCPF(tutor.cpf)}    `,
    });
  }
  if (tutor?.phone) {
    tutorParts.push({ text: 'Tel.: ', bold: true }, {
      text: `${tutor.phone}    `,
    });
  }
  if (tutor?.address) {
    tutorParts.push({ text: 'Endereço: ', bold: true }, {
      text: tutor.address,
    });
  }
  y = drawInlineParts(pdf, tutorParts, y) + 6;

  // ---------- Itens ----------
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(SECTION_TITLE_SIZE);
  pdf.setTextColor(...TEXT);
  pdf.text('Serviços e produtos', MARGIN, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...MUTED);
  pdf.text(fmtDateBr(issuedAt), rightEdge, y, { align: 'right' });
  drawRule(pdf, y + 2.2, RULE);
  y += 8;

  const colQty = MARGIN + CONTENT_WIDTH - 82;
  const colPrice = MARGIN + CONTENT_WIDTH - 40;
  const colTotal = MARGIN + CONTENT_WIDTH;
  const nameWidth = colQty - MARGIN - 12;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text('DESCRIÇÃO', MARGIN, y);
  pdf.text('QTD.', colQty, y, { align: 'center' });
  pdf.text('VALOR UNIT.', colPrice, y, { align: 'right' });
  pdf.text('SUBTOTAL', colTotal, y, { align: 'right' });
  drawRule(pdf, y + 1.8, RULE);
  y += 4;

  pdf.setFontSize(9);
  for (const item of items) {
    const lines = pdf.splitTextToSize(item.name, nameWidth) as string[];
    const rowHeight = Math.max(lines.length * 4.4, 4.4) + 3.5;

    if (y + rowHeight > PAGE_HEIGHT - 45) {
      pdf.addPage();
      y = MARGIN;
    }

    const textY = y + 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...TEXT);
    lines.forEach((line, index) => {
      pdf.text(line, MARGIN, textY + index * 4.4);
    });
    pdf.text(String(item.quantity), colQty, textY, { align: 'center' });
    pdf.text(money(item.unitPrice), colPrice, textY, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.text(money(item.quantity * item.unitPrice), colTotal, textY, {
      align: 'right',
    });

    y += rowHeight;
    drawRule(pdf, y - 1.5, RULE_LIGHT);
  }

  drawRule(pdf, y + 1, TEAL, 0.7);
  y += 7;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...TEXT);
  pdf.text('Total', colPrice, y, { align: 'right' });
  pdf.text(money(budgetTotal(items)), colTotal, y, { align: 'right' });
  y += 9;

  // ---------- Observações e validade ----------
  if (notes) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('Observações', MARGIN, y);
    y += 4.5;
    pdf.setFont('helvetica', 'normal');
    const noteLines = pdf.splitTextToSize(notes, CONTENT_WIDTH) as string[];
    for (const line of noteLines) {
      pdf.text(line, MARGIN, y);
      y += 4.2;
    }
    y += 2;
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  const disclaimer = `Orçamento válido até ${fmtDateBr(validUntil)} (${validityDays} dia(s)). Os valores são uma estimativa; procedimentos adicionais identificados durante o atendimento podem alterar o total e serão comunicados previamente ao tutor.`;
  const disclaimerLines = pdf.splitTextToSize(
    disclaimer,
    CONTENT_WIDTH,
  ) as string[];
  for (const line of disclaimerLines) {
    pdf.text(line, MARGIN, y);
    y += 3.6;
  }

  // ---------- Assinatura ----------
  const stampY = Math.max(y + 25, PAGE_HEIGHT - 42);
  const center = PAGE_WIDTH / 2;
  pdf.setTextColor(...TEXT);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text(user.name.toUpperCase(), center, stampY, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(
    `Médico Veterinário${user.specialty ? ` - ${user.specialty}` : ''}`,
    center,
    stampY + 4.5,
    { align: 'center' },
  );
  if (user.crmv) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`CRMV-${user.crmv.toUpperCase()}`, center, stampY + 9, {
      align: 'center',
    });
  }

  return pdf;
}
