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
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
        Nenhuma medição registrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th className="p-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Data/Hora
            </th>
            {VITAL_DEFINITIONS.map((def) => (
              <th
                key={def.key}
                className="p-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap text-center"
              >
                {def.short}
                <span className="block text-[10px] font-normal">{def.unit}</span>
              </th>
            ))}
            <th className="p-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
              className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            >
              <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                {fmtDateTime(record.measured_at)}
                {record.notes && (
                  <span className="block text-[11px] text-slate-400 dark:text-slate-500 max-w-[180px] truncate">
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
                    className={`p-3 text-center font-medium ${value !== undefined && value !== null ? EVALUATION_TEXT_COLORS[evaluation] : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {value !== undefined && value !== null ? value : '—'}
                  </td>
                );
              })}
              <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                {record.recorded_by ? (
                  <>
                    {record.recorded_by.name}
                    {record.recorded_by.crmv && (
                      <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                        CRMV {record.recorded_by.crmv}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-300 dark:text-slate-600">—</span>
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
                    className="rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 px-3 py-2"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {def.label}
                    </p>
                    <p
                      className={`text-sm font-semibold ${hasValue ? EVALUATION_TEXT_COLORS[evaluation] : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      {hasValue ? `${value} ${def.unit}` : '—'}
                    </p>
                    {hasValue &&
                      evaluation !== 'normal' &&
                      evaluation !== 'unknown' && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {EVALUATION_LABELS[evaluation]} da faixa
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {(selected.clinical_values?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Parâmetros Clínicos
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selected.clinical_values?.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 px-3 py-2"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
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
