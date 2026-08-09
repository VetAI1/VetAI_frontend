import type { jsPDF } from 'jspdf';

import {
  DISCHARGE_REASON_LABELS,
  daysSince,
  doseLabel,
  EVENT_TYPE_LABELS,
  EXECUTION_STATUS_MAP,
  executionVisualStatus,
  fmtDate,
  fmtDateTime,
  FREQUENCY_LABELS,
  PRESCRIPTION_TYPE_MAP,
  RISK_MAP,
  STATUS_MAP,
} from './utils';

import { SPECIE_LABELS, VITAL_DEFINITIONS } from '@/constants';
import type {
  Execution,
  Hospitalization,
  HospitalizationEvent,
  HospPrescription,
  VitalRecord,
} from '@/types/monitoring';
import type { Specie } from '@/types/patient';
import type { Hospital } from '@/types/settings';
import { calcAge } from '@/utils/date-format';
import { capitalize } from '@/utils/format';

const TEAL: [number, number, number] = [26, 128, 112];
const TEXT: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [85, 85, 85];
const RULE: [number, number, number] = [204, 204, 204];
const RULE_LIGHT: [number, number, number] = [230, 230, 230];
const AMBER: [number, number, number] = [146, 64, 14];

const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN;
const SECTION_TITLE_SIZE = 11;

const SEX_LABELS: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};

export interface HospitalizationReportData {
  hospitalization: Hospitalization;
  hospital: Hospital | null;
  vitals: VitalRecord[];
  prescriptions: HospPrescription[];
  executions: Execution[];
  events: HospitalizationEvent[];
}

function clinicAddressLine(hospital: Hospital | null): string {
  const address = hospital?.address;
  if (!address) return '';
  const parts: string[] = [];
  if (address.street) {
    parts.push(
      address.number ? `${address.street}, ${address.number}` : address.street,
    );
  }
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.city && address.state) {
    parts.push(`${address.city} - ${address.state}`);
  } else if (address.city) parts.push(address.city);
  if (address.zip_code) parts.push(`CEP ${address.zip_code}`);
  return parts.join(', ');
}

// O gráfico continua vindo de um canvas: como entra no PDF já como imagem,
// não sofre o desalinhamento que a rasterização de HTML causava.
function buildVitalsChart(vitals: VitalRecord[]): string {
  const measured = [...vitals].sort(
    (a, b) =>
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime(),
  );
  if (measured.length < 2) return '';

  const series = VITAL_DEFINITIONS.map((definition) => ({
    label: `${definition.short} (${definition.unit})`,
    color: definition.color,
    points: measured.map((record) => record[definition.key] ?? null),
  })).filter((serie) => serie.points.some((point) => point !== null));

  if (!series.length) return '';

  const width = 1600;
  const height = 620;
  const padding = { top: 30, right: 30, bottom: 90, left: 70 };
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return '';

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const values = series.flatMap((serie) =>
    serie.points.filter((point): point is number => point !== null),
  );
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin || 1;
  const min = rawMin - span * 0.1;
  const max = rawMax + span * 0.1;

  const xFor = (index: number) =>
    padding.left + (index / (measured.length - 1)) * plotWidth;
  const yFor = (value: number) =>
    padding.top + plotHeight - ((value - min) / (max - min)) * plotHeight;

  context.strokeStyle = '#e2e8f0';
  context.lineWidth = 1;
  context.fillStyle = '#94a3b8';
  context.font = '18px Arial';
  context.textAlign = 'right';
  for (let step = 0; step <= 4; step++) {
    const gridY = padding.top + (plotHeight / 4) * step;
    context.beginPath();
    context.moveTo(padding.left, gridY);
    context.lineTo(width - padding.right, gridY);
    context.stroke();
    context.fillText(
      (max - ((max - min) / 4) * step).toFixed(0),
      padding.left - 10,
      gridY + 6,
    );
  }

  context.textAlign = 'center';
  const labelStep = Math.ceil(measured.length / 8);
  measured.forEach((record, index) => {
    if (index % labelStep !== 0 && index !== measured.length - 1) return;
    const date = new Date(record.measured_at);
    const label = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    context.fillText(label, xFor(index), height - padding.bottom + 28);
  });

  series.forEach((serie) => {
    context.strokeStyle = serie.color;
    context.fillStyle = serie.color;
    context.lineWidth = 3;
    context.beginPath();
    let started = false;
    serie.points.forEach((point, index) => {
      if (point === null) return;
      const x = xFor(index);
      const pointY = yFor(point);
      if (started) context.lineTo(x, pointY);
      else {
        context.moveTo(x, pointY);
        started = true;
      }
    });
    context.stroke();
    serie.points.forEach((point, index) => {
      if (point === null) return;
      context.beginPath();
      context.arc(xFor(index), yFor(point), 5, 0, Math.PI * 2);
      context.fill();
    });
  });

  let legendX = padding.left;
  const legendY = height - 26;
  context.font = '20px Arial';
  context.textAlign = 'left';
  series.forEach((serie) => {
    context.fillStyle = serie.color;
    context.fillRect(legendX, legendY - 12, 16, 16);
    context.fillStyle = '#475569';
    context.fillText(serie.label, legendX + 24, legendY + 2);
    legendX += context.measureText(serie.label).width + 70;
  });

  return canvas.toDataURL('image/png');
}

interface Cursor {
  y: number;
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
  ensureSpace(pdf, cursor, 16);
  cursor.y += 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(SECTION_TITLE_SIZE);
  pdf.setTextColor(...TEAL);
  pdf.text(title, MARGIN, cursor.y);
  drawRule(pdf, cursor.y + 2.2, RULE);
  cursor.y += 7.5;
}

interface InlinePart {
  text: string;
  bold?: boolean;
}

// A quebra é por palavra, não por parte: um valor longo preenche o resto da
// linha e continua abaixo, em vez de pular inteiro para a linha seguinte.
function drawInlineParts(
  pdf: jsPDF,
  cursor: Cursor,
  parts: InlinePart[],
  lineHeight = 5,
): void {
  const right = MARGIN + CONTENT_WIDTH;
  let x = MARGIN;
  ensureSpace(pdf, cursor, lineHeight);
  pdf.setFontSize(9);
  pdf.setTextColor(...TEXT);

  for (const part of parts) {
    pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
    const tokens = part.text.split(/(\s+)/).filter(Boolean);

    for (const token of tokens) {
      const width = pdf.getTextWidth(token);
      if (x + width > right && x > MARGIN) {
        x = MARGIN;
        cursor.y += lineHeight;
        ensureSpace(pdf, cursor, lineHeight);
        // Espaço que sobrou da quebra não deve indentar a linha nova.
        if (/^\s+$/.test(token)) continue;
      }
      pdf.text(token, x, cursor.y);
      x += width;
    }
  }
  cursor.y += lineHeight;
}

function factParts(items: Array<{ label: string; value: string }>): InlinePart[] {
  return items.flatMap((item) => [
    { text: `${item.label}: `, bold: true },
    { text: `${item.value}    ` },
  ]);
}

interface Column {
  header: string;
  // Segunda linha do cabeçalho — usada para a unidade, sem alargar a coluna.
  subHeader?: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

const BADGE_BG: [number, number, number] = [255, 251, 235];
const BADGE_BORDER: [number, number, number] = [245, 158, 11];

function drawBadges(pdf: jsPDF, cursor: Cursor, labels: string[]): void {
  const height = 5;
  const paddingX = 2.4;
  const gap = 2;
  let x = MARGIN;

  ensureSpace(pdf, cursor, height + 2);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);

  for (const label of labels) {
    const width = pdf.getTextWidth(label) + paddingX * 2;
    if (x + width > MARGIN + CONTENT_WIDTH && x > MARGIN) {
      x = MARGIN;
      cursor.y += height + gap;
      ensureSpace(pdf, cursor, height + 2);
    }
    pdf.setFillColor(...BADGE_BG);
    pdf.setDrawColor(...BADGE_BORDER);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, cursor.y, width, height, 2.4, 2.4, 'FD');
    pdf.setTextColor(...AMBER);
    pdf.text(label, x + paddingX, cursor.y + 3.4);
    x += width + gap;
  }

  cursor.y += height + 2;
}

function columnX(columns: Column[], index: number): number {
  let x = MARGIN;
  for (let i = 0; i < index; i++) x += columns[i]!.width;
  return x;
}

function drawTableHeader(pdf: jsPDF, cursor: Cursor, columns: Column[]): void {
  const hasSubHeader = columns.some((column) => column.subHeader);
  const anchorFor = (column: Column, index: number) => {
    const x = columnX(columns, index);
    const align = column.align ?? 'left';
    return {
      align,
      anchor:
        align === 'right'
          ? x + column.width - 1
          : align === 'center'
            ? x + column.width / 2
            : x,
    };
  };

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...MUTED);
  columns.forEach((column, index) => {
    const { align, anchor } = anchorFor(column, index);
    pdf.text(column.header.toUpperCase(), anchor, cursor.y, { align });
  });

  if (hasSubHeader) {
    pdf.setFontSize(6.2);
    columns.forEach((column, index) => {
      if (!column.subHeader) return;
      const { align, anchor } = anchorFor(column, index);
      pdf.text(column.subHeader, anchor, cursor.y + 2.8, { align });
    });
    cursor.y += 2.8;
  }

  drawRule(pdf, cursor.y + 1.8, RULE);
  cursor.y += 4;
}

function drawTable(
  pdf: jsPDF,
  cursor: Cursor,
  columns: Column[],
  rows: string[][],
  emptyMessage: string,
): void {
  ensureSpace(pdf, cursor, 18);
  drawTableHeader(pdf, cursor, columns);

  if (!rows.length) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...MUTED);
    cursor.y += 4;
    pdf.text(emptyMessage, MARGIN + CONTENT_WIDTH / 2, cursor.y, {
      align: 'center',
    });
    cursor.y += 5;
    return;
  }

  const lineHeight = 3.8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  for (const row of rows) {
    const wrapped = row.map((cell, index) =>
      pdf.splitTextToSize(cell || '—', columns[index]!.width - 2),
    ) as string[][];
    const maxLines = Math.max(...wrapped.map((lines) => lines.length));
    const rowHeight = maxLines * lineHeight + 3;

    if (cursor.y + rowHeight > BOTTOM_LIMIT) {
      pdf.addPage();
      cursor.y = MARGIN;
      drawTableHeader(pdf, cursor, columns);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
    }

    const textY = cursor.y + 3;
    pdf.setTextColor(...TEXT);
    wrapped.forEach((lines, index) => {
      const column = columns[index]!;
      const x = columnX(columns, index);
      const align = column.align ?? 'left';
      const anchor =
        align === 'right'
          ? x + column.width - 1
          : align === 'center'
            ? x + column.width / 2
            : x;
      lines.forEach((line, lineIndex) => {
        pdf.text(line, anchor, textY + lineIndex * lineHeight, { align });
      });
    });

    cursor.y += rowHeight;
    drawRule(pdf, cursor.y - 1.2, RULE_LIGHT);
  }
}

export async function buildHospitalizationReportPdf(
  data: HospitalizationReportData,
): Promise<jsPDF> {
  const {
    hospitalization,
    hospital,
    vitals,
    prescriptions,
    executions,
    events,
  } = data;
  const { patient } = hospitalization;
  const tutor = patient?.tutor;

  const { default: JsPDF } = await import('jspdf');
  const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const cursor: Cursor = { y: MARGIN };

  // ---------- Cabeçalho ----------
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(...TEAL);
  pdf.text(hospital?.name ?? 'Clínica', MARGIN, cursor.y + 3);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  let headerY = cursor.y + 7.5;
  for (const line of [
    clinicAddressLine(hospital),
    hospital?.phone,
    hospital?.cnpj ? `CNPJ ${hospital.cnpj}` : '',
  ].filter(Boolean) as string[]) {
    const wrapped = pdf.splitTextToSize(line, CONTENT_WIDTH * 0.55) as string[];
    for (const piece of wrapped) {
      pdf.text(piece, MARGIN, headerY);
      headerY += 3.8;
    }
  }

  const rightEdge = MARGIN + CONTENT_WIDTH;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...TEXT);
  pdf.text('Prontuário de Internação', rightEdge, cursor.y + 3, {
    align: 'right',
  });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...MUTED);
  pdf.text(patient?.name ?? '', rightEdge, cursor.y + 8, { align: 'right' });
  pdf.text(
    `Emitido em ${fmtDateTime(new Date().toISOString())}`,
    rightEdge,
    cursor.y + 12,
    { align: 'right' },
  );

  cursor.y = Math.max(headerY, cursor.y + 15) + 2;
  drawRule(pdf, cursor.y, TEAL, 0.7);
  cursor.y += 6;

  // ---------- Paciente ----------
  sectionTitle(pdf, cursor, 'Paciente');
  drawInlineParts(
    pdf,
    cursor,
    factParts([
      {
        label: 'Espécie',
        value:
          SPECIE_LABELS[(patient?.specie ?? 'OTHER') as Specie] ??
          patient?.specie ??
          '—',
      },
      { label: 'Raça', value: patient?.breed || '—' },
      { label: 'Sexo', value: SEX_LABELS[patient?.sex ?? ''] ?? '—' },
      {
        label: 'Idade',
        value: patient?.birth_date
          ? calcAge(new Date(patient.birth_date))
          : '—',
      },
      {
        label: 'Peso',
        value: hospitalization.weight_kg
          ? `${hospitalization.weight_kg.toLocaleString('pt-BR')} kg`
          : '—',
      },
    ]),
  );

  if ((patient?.restrictions?.length ?? 0) > 0) {
    sectionTitle(pdf, cursor, 'Restrições');
    drawBadges(pdf, cursor, (patient?.restrictions ?? []).map(capitalize));
  }

  // ---------- Tutor ----------
  sectionTitle(pdf, cursor, 'Tutor');
  drawInlineParts(
    pdf,
    cursor,
    factParts([
      { label: 'Nome', value: tutor?.name ?? '—' },
      { label: 'Telefone', value: tutor?.phone ?? '—' },
      { label: 'Endereço', value: tutor?.address ?? '—' },
    ]),
  );

  // ---------- Internação ----------
  sectionTitle(pdf, cursor, 'Internação');
  drawInlineParts(
    pdf,
    cursor,
    factParts([
      { label: 'Situação', value: STATUS_MAP[hospitalization.status].label },
      { label: 'Risco', value: RISK_MAP[hospitalization.risk].label },
      { label: 'Entrada', value: fmtDateTime(hospitalization.admitted_at) },
      {
        label: 'Saída',
        value: hospitalization.discharged_at
          ? fmtDateTime(hospitalization.discharged_at)
          : '—',
      },
      {
        label: 'Permanência',
        value: `${daysSince(hospitalization.admitted_at)} dia(s)`,
      },
      {
        label: 'Encerramento',
        value: hospitalization.discharge_reason
          ? DISCHARGE_REASON_LABELS[hospitalization.discharge_reason]
          : '—',
      },
      {
        label: 'Responsável',
        value: hospitalization.veterinarian?.name ?? '—',
      },
      {
        label: 'Plantão',
        value:
          hospitalization.on_duty_veterinarian?.name ??
          hospitalization.veterinarian?.name ??
          '—',
      },
    ]),
  );

  // ---------- Quadro clínico ----------
  const clinicalNotes = [
    { label: 'Queixa', value: hospitalization.complaint },
    { label: 'Diagnóstico', value: hospitalization.diagnosis },
    { label: 'Prognóstico', value: hospitalization.prognosis },
    { label: 'Acessórios', value: hospitalization.accessories },
    { label: 'Observações', value: hospitalization.observations },
    { label: 'Notas do encerramento', value: hospitalization.discharge_notes },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );

  if (clinicalNotes.length) {
    sectionTitle(pdf, cursor, 'Quadro clínico');
    for (const note of clinicalNotes) {
      drawInlineParts(pdf, cursor, [
        { text: `${note.label}: `, bold: true },
        { text: note.value },
      ]);
    }
  }

  // ---------- Gráfico ----------
  const chart = buildVitalsChart(vitals);
  if (chart) {
    sectionTitle(pdf, cursor, 'Evolução dos sinais vitais');
    const chartHeight = (CONTENT_WIDTH * 620) / 1600;
    ensureSpace(pdf, cursor, chartHeight + 4);
    pdf.addImage(chart, 'PNG', MARGIN, cursor.y, CONTENT_WIDTH, chartHeight);
    cursor.y += chartHeight + 3;
  }

  // ---------- Aferições ----------
  sectionTitle(pdf, cursor, 'Aferições');
  const vitalColumns: Column[] = [
    { header: 'Data/hora', width: 30 },
    ...VITAL_DEFINITIONS.map((definition) => ({
      header: definition.short,
      subHeader: definition.unit,
      width: 15,
      align: 'center' as const,
    })),
    {
      header: 'Responsável',
      width: CONTENT_WIDTH - 30 - 15 * VITAL_DEFINITIONS.length,
    },
  ];
  drawTable(
    pdf,
    cursor,
    vitalColumns,
    vitals.map((record) => [
      fmtDateTime(record.measured_at),
      ...VITAL_DEFINITIONS.map((definition) => {
        const value = record[definition.key];
        return value !== undefined && value !== null ? String(value) : '—';
      }),
      record.recorded_by?.name ?? '—',
    ]),
    'Nenhuma aferição registrada.',
  );

  // ---------- Prescrições ----------
  sectionTitle(pdf, cursor, 'Prescrições');
  drawTable(
    pdf,
    cursor,
    [
      { header: 'Tipo', width: 26 },
      { header: 'Item', width: 60 },
      { header: 'Dose', width: 26 },
      { header: 'Frequência', width: 40 },
      { header: 'Início', width: CONTENT_WIDTH - 152 },
    ],
    prescriptions.map((prescription) => [
      PRESCRIPTION_TYPE_MAP[prescription.type].label,
      prescription.name,
      doseLabel(prescription) || '—',
      prescription.frequency === 'RECURRING'
        ? `a cada ${prescription.interval_hours}h por ${prescription.duration_days} dia(s)`
        : FREQUENCY_LABELS[prescription.frequency],
      fmtDateTime(prescription.start_at),
    ]),
    'Nenhuma prescrição registrada.',
  );

  // ---------- Execuções ----------
  sectionTitle(pdf, cursor, 'Procedimentos e execuções');
  const doneExecutions = executions
    .filter((execution) => execution.status !== 'CANCELLED')
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );
  drawTable(
    pdf,
    cursor,
    [
      { header: 'Programado', width: 28 },
      { header: 'Item', width: 44 },
      { header: 'Situação', width: 22 },
      { header: 'Executado', width: 28 },
      { header: 'Por', width: 26 },
      { header: 'Observação', width: CONTENT_WIDTH - 148 },
    ],
    doneExecutions.map((execution) => [
      fmtDateTime(execution.scheduled_at),
      execution.prescription?.name ?? '—',
      EXECUTION_STATUS_MAP[executionVisualStatus(execution)].label,
      execution.executed_at ? fmtDateTime(execution.executed_at) : '—',
      execution.executed_by?.name ?? '—',
      execution.notes ?? '—',
    ]),
    'Nenhum procedimento programado.',
  );

  // ---------- Eventos ----------
  sectionTitle(pdf, cursor, 'Ocorrências e eventos');
  const orderedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  drawTable(
    pdf,
    cursor,
    [
      { header: 'Data/hora', width: 30 },
      { header: 'Tipo', width: 32 },
      { header: 'Detalhe', width: CONTENT_WIDTH - 92 },
      { header: 'Registrado por', width: 30 },
    ],
    orderedEvents.map((event) => [
      fmtDateTime(event.date),
      EVENT_TYPE_LABELS[event.type] ?? event.type,
      [event.title, event.description].filter(Boolean).join(' — ') || '—',
      event.created_by?.name ?? '—',
    ]),
    'Nenhum evento registrado.',
  );

  // ---------- Rodapé em todas as páginas ----------
  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text(hospital?.name ?? '', MARGIN, PAGE_HEIGHT - 8);
    pdf.text(
      `Entrada ${fmtDate(hospitalization.admitted_at)}${hospitalization.discharged_at ? ` · Saída ${fmtDate(hospitalization.discharged_at)}` : ''}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 8,
      { align: 'center' },
    );
    pdf.text(`${page}/${total}`, MARGIN + CONTENT_WIDTH, PAGE_HEIGHT - 8, {
      align: 'right',
    });
  }

  return pdf;
}
