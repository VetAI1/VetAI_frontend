'use client';

import { useState } from 'react';

import { fmtDateTime } from '../utils';

import { Modal } from '@/app/components/common/modal';
import { Button } from '@/components/ui/button';
import {
  EVALUATION_LABELS,
  EVALUATION_TEXT_COLORS,
  VITAL_DEFINITIONS,
  evaluateVital,
} from '@/constants';
import type { VitalRecord } from '@/types/monitoring';
import type { Specie } from '@/types/patient';

interface VitalHistoryTableProps {
  specie: Specie;
  records: VitalRecord[];
}

export function VitalHistoryTable({
  specie,
  records,
}: VitalHistoryTableProps) {
  const [selected, setSelected] = useState<VitalRecord | null>(null);
  const ordered = [...records].reverse();

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/70 text-center py-8">
        Nenhuma medição registrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-medium text-muted-foreground whitespace-nowrap">
              Data/Hora
            </th>
            {VITAL_DEFINITIONS.map((def) => (
              <th
                key={def.key}
                className="p-3 font-medium text-muted-foreground whitespace-nowrap text-center"
              >
                {def.short}
                <span className="block text-[10px] font-normal">{def.unit}</span>
              </th>
            ))}
            <th className="p-3 font-medium text-muted-foreground whitespace-nowrap">
              Registrado por
            </th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((record) => (
            <tr
              key={record.id}
              onClick={() => setSelected(record)}
              title="Clique para ver os detalhes da aferição"
              className="border-b border-border/70 hover:bg-secondary/60 cursor-pointer"
            >
              <td className="p-3 whitespace-nowrap text-muted-foreground">
                {fmtDateTime(record.measured_at)}
                {record.notes && (
                  <span className="block text-[11px] text-muted-foreground/70 max-w-[180px] truncate">
                    {record.notes}
                  </span>
                )}
              </td>
              {VITAL_DEFINITIONS.map((def) => {
                const value = record[def.key];
                const evaluation = evaluateVital(specie, def.key, value);
                return (
                  <td
                    key={def.key}
                    className={`p-3 text-center font-medium ${value !== undefined && value !== null ? EVALUATION_TEXT_COLORS[evaluation] : 'text-muted-foreground/50'}`}
                  >
                    {value !== undefined && value !== null ? value : '—'}
                  </td>
                );
              })}
              <td className="p-3 whitespace-nowrap text-muted-foreground">
                {record.recorded_by ? (
                  <>
                    {record.recorded_by.name}
                    {record.recorded_by.crmv && (
                      <span className="block text-[11px] text-muted-foreground/70">
                        CRMV {record.recorded_by.crmv}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <Modal
          title="Detalhes da Aferição"
          description={`${fmtDateTime(selected.measured_at)}${selected.recorded_by ? ` · ${selected.recorded_by.name}` : ''}`}
          onClose={() => setSelected(null)}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VITAL_DEFINITIONS.map((def) => {
                const value = selected[def.key];
                const hasValue = value !== undefined && value !== null;
                const evaluation = evaluateVital(specie, def.key, value);
                return (
                  <div
                    key={def.key}
                    className="rounded-lg bg-secondary border border-border/70 px-3 py-2"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                      {def.label}
                    </p>
                    <p
                      className={`text-sm font-semibold ${hasValue ? EVALUATION_TEXT_COLORS[evaluation] : 'text-muted-foreground/50'}`}
                    >
                      {hasValue ? `${value} ${def.unit}` : '—'}
                    </p>
                    {hasValue &&
                      evaluation !== 'normal' &&
                      evaluation !== 'unknown' && (
                      <p className="text-[10px] text-muted-foreground/70">
                        {EVALUATION_LABELS[evaluation]} da faixa
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {(selected.clinical_values?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold text-secondary-foreground mb-2">
                  Parâmetros Clínicos
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selected.clinical_values?.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-lg bg-secondary border border-border/70 px-3 py-2"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {item.value}
                        {item.unit ? ` ${item.unit}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div>
                <p className="text-sm font-semibold text-secondary-foreground mb-1">
                  Observações
                </p>
                <p className="text-sm text-muted-foreground">
                  {selected.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
