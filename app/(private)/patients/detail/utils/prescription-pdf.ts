import type { jsPDF } from 'jspdf';

import { SPECIE_LABELS } from '@/constants';
import type { User } from '@/types/auth';
import type {
  HealthRecord,
  PrescriptionMedication,
  PrescriptionMetadata,
} from '@/types/health-record';
import type { Patient, Specie } from '@/types/patient';
import type { Hospital } from '@/types/settings';

const TEAL: [number, number, number] = [26, 128, 112];
const TEXT: [number, number, number] = [0, 0, 0];
const MUTED: [number, number, number] = [85, 85, 85];
const RULE: [number, number, number] = [204, 204, 204];
const LEADER: [number, number, number] = [130, 130, 130];

const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - 55;

function calcAgeStr(birthDate?: string): string {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  return parts.join(' e ') || 'menos de 1 mês';
}

function fmtDateTimeBr(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function groupByUsage(
  medications: PrescriptionMedication[],
): Map<string, PrescriptionMedication[]> {
  const map = new Map<string, PrescriptionMedication[]>();
  for (const medication of medications) {
    const key = medication.usage ?? 'Uso Veterinário';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(medication);
  }
  return map;
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

interface Cursor {
  y: number;
}

interface InlinePart {
  text: string;
  bold?: boolean;
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

function ensureSpace(pdf: jsPDF, cursor: Cursor, needed: number): void {
  if (cursor.y + needed <= BOTTOM_LIMIT) return;
  pdf.addPage();
  cursor.y = MARGIN;
}

function sectionTitle(pdf: jsPDF, cursor: Cursor, title: string): void {
  ensureSpace(pdf, cursor, 14);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...TEXT);
  pdf.text(title, MARGIN, cursor.y);
  drawRule(pdf, cursor.y + 2, RULE);
  cursor.y += 7;
}

// Quebra por palavra, para o valor preencher o resto da linha antes de descer.
function drawInlineParts(pdf: jsPDF, cursor: Cursor, parts: InlinePart[]): void {
  const right = MARGIN + CONTENT_WIDTH;
  const lineHeight = 5;
  let x = MARGIN;
  ensureSpace(pdf, cursor, lineHeight);
  pdf.setFontSize(9);
  pdf.setTextColor(...TEXT);

  for (const part of parts) {
    pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
    for (const token of part.text.split(/(\s+)/).filter(Boolean)) {
      const width = pdf.getTextWidth(token);
      if (x + width > right && x > MARGIN) {
        x = MARGIN;
        cursor.y += lineHeight;
        ensureSpace(pdf, cursor, lineHeight);
        if (/^\s+$/.test(token)) continue;
      }
      pdf.text(token, x, cursor.y);
      x += width;
    }
  }
  cursor.y += lineHeight;
}

export async function buildPrescriptionPdf(
  record: HealthRecord,
  patient: Patient,
  user: User,
  hospital: Hospital | null,
  latestWeight?: number,
  logoUrl?: string,
): Promise<jsPDF> {
  const meta = record.metadata as unknown as PrescriptionMetadata;

  const { default: JsPDF } = await import('jspdf');
  const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const cursor: Cursor = { y: MARGIN };
  const rightEdge = MARGIN + CONTENT_WIDTH;

  // ---------- Cabeçalho ----------
  const logo = logoUrl ? await loadLogo(logoUrl) : null;
  if (logo) {
    const logoHeight = 9;
    pdf.addImage(
      logo.dataUrl,
      'PNG',
      MARGIN,
      cursor.y,
      logoHeight * logo.ratio,
      logoHeight,
    );
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...MUTED);
    pdf.text(
      'gerenciamento completo e diagnósticos eficientes',
      MARGIN,
      cursor.y + 14,
    );
    pdf.text('para clínicas veterinárias', MARGIN, cursor.y + 17);
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(...TEAL);
    pdf.text('vetai', MARGIN, cursor.y + 7);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...MUTED);
    pdf.text('gerenciamento de clínicas veterinárias', MARGIN, cursor.y + 11);
  }

  let headerY = cursor.y + 3;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...TEXT);
  pdf.text('Receituário', rightEdge, headerY, { align: 'right' });

  pdf.setFontSize(8.5);
  const clinicLines = [
    hospital?.name?.toUpperCase(),
    buildClinicAddressLine(hospital).toUpperCase(),
    hospital?.phone,
  ].filter((line): line is string => Boolean(line));

  for (const line of clinicLines) {
    for (const piece of pdf.splitTextToSize(
      line,
      CONTENT_WIDTH * 0.62,
    ) as string[]) {
      headerY += 4.2;
      pdf.text(piece, rightEdge, headerY, { align: 'right' });
    }
  }

  cursor.y = Math.max(headerY, cursor.y + 19) + 4;
  drawRule(pdf, cursor.y, TEAL, 0.7);
  cursor.y += 8;

  // ---------- Identificação do animal ----------
  sectionTitle(pdf, cursor, 'Identificação do animal');

  const specieLabel = SPECIE_LABELS[patient.specie as Specie] ?? patient.specie;
  const ageStr = calcAgeStr(patient.birth_date);
  const patientParts: InlinePart[] = [
    { text: 'Animal: ', bold: true },
    { text: `${patient.name}    ` },
    { text: 'Espécie: ', bold: true },
    { text: `${specieLabel}    ` },
  ];
  if (patient.breed) {
    patientParts.push(
      { text: 'Raça: ', bold: true },
      { text: `${patient.breed}    ` },
    );
  }
  if (ageStr) {
    patientParts.push({ text: 'Idade: ', bold: true }, { text: `${ageStr}    ` });
  }
  if (latestWeight != null) {
    patientParts.push(
      { text: 'Peso: ', bold: true },
      { text: `${latestWeight} kg    ` },
    );
  }
  if (patient.sex) {
    patientParts.push(
      { text: 'Sexo: ', bold: true },
      { text: patient.sex === 'MALE' ? 'Macho' : 'Fêmea' },
    );
  }
  drawInlineParts(pdf, cursor, patientParts);

  // ---------- Prescrição ----------
  cursor.y += 8;
  ensureSpace(pdf, cursor, 14);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...TEXT);
  pdf.text('Prescrição', MARGIN, cursor.y);
  if (meta.include_date) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...MUTED);
    pdf.text(fmtDateTimeBr(record.date), rightEdge, cursor.y, {
      align: 'right',
    });
  }
  drawRule(pdf, cursor.y + 2, RULE);
  cursor.y += 8;

  for (const [usage, medications] of groupByUsage(meta.medications ?? [])) {
    ensureSpace(pdf, cursor, 14);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...TEXT);
    const usageLabel = usage.toUpperCase();
    pdf.text(usageLabel, MARGIN, cursor.y);
    // Sublinhado desenhado à mão: o jsPDF não tem text-decoration.
    pdf.setDrawColor(...TEXT);
    pdf.setLineWidth(0.2);
    pdf.line(
      MARGIN,
      cursor.y + 0.8,
      MARGIN + pdf.getTextWidth(usageLabel),
      cursor.y + 0.8,
    );
    cursor.y += 6;

    for (const medication of medications) {
      ensureSpace(pdf, cursor, 12);

      const left = `${medication.drug}${medication.quantity ? ` ${medication.quantity}` : ''}`;
      const right = medication.form ?? '';

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...TEXT);
      pdf.text(left, MARGIN, cursor.y);

      pdf.setFontSize(8.5);
      const rightWidth = right ? pdf.getTextWidth(right) : 0;
      if (right) {
        pdf.text(right, rightEdge, cursor.y, { align: 'right' });
      }

      // Linha pontilhada ligando o medicamento à forma farmacêutica.
      pdf.setFontSize(9.5);
      const leaderStart = MARGIN + pdf.getTextWidth(left) + 2;
      const leaderEnd = rightEdge - rightWidth - 2;
      if (leaderEnd > leaderStart) {
        pdf.setDrawColor(...LEADER);
        pdf.setLineWidth(0.2);
        pdf.setLineDashPattern([0.5, 0.7], 0);
        pdf.line(leaderStart, cursor.y - 0.8, leaderEnd, cursor.y - 0.8);
        pdf.setLineDashPattern([], 0);
      }

      cursor.y += 4.6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...MUTED);
      for (const line of pdf.splitTextToSize(
        medication.posology,
        CONTENT_WIDTH - 6,
      ) as string[]) {
        pdf.text(line, MARGIN + 5, cursor.y);
        cursor.y += 4;
      }
      cursor.y += 2.5;
    }

    cursor.y += 3;
  }

  // ---------- Recomendações ----------
  if ((meta.recommendations?.length ?? 0) > 0) {
    cursor.y += 4;
    sectionTitle(pdf, cursor, 'Recomendações');

    // Mesma fonte e cor da linha do medicamento.
    pdf.setFontSize(9.5);
    for (const recommendation of meta.recommendations ?? []) {
      const lines = pdf.splitTextToSize(
        recommendation,
        CONTENT_WIDTH - 6,
      ) as string[];
      ensureSpace(pdf, cursor, lines.length * 4.6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...TEAL);
      pdf.text('•', MARGIN + 1, cursor.y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...TEXT);
      lines.forEach((line, index) => {
        pdf.text(line, MARGIN + 6, cursor.y + index * 4.6);
      });
      cursor.y += lines.length * 4.6 + 1.5;
    }
  }

  // ---------- Carimbo ----------
  const stampY = Math.max(cursor.y + 25, PAGE_HEIGHT - 42);
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
