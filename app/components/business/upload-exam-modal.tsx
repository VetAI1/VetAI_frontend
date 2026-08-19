'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';

import { Autocomplete } from '../forms/autocomplete';
import { DateInput } from '../forms/date-input';
import { FileDropzone } from '../forms/file-dropzone';
import { InputWithLabel } from '../forms/input-with-label';

import { Button } from '@/components/ui/button';
import { useAutoComplete } from '@/hooks/use-auto-complete';
import { uploadExamSchema, type UploadExamFormData } from '@/schemas/vaccine';
import { patientsService } from '@/services/patients.service';
import { studiesService } from '@/services/studies.service';
import type { Patient } from '@/types/patient';
import type { Study } from '@/types/study';

interface UploadExamModalProps {
  onClose: () => void;
  onSuccess: (study: Study) => void;
  preselectedPatient?: Patient;
}

export function UploadExamModal({
  onClose,
  onSuccess,
  preselectedPatient,
}: UploadExamModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    preselectedPatient ?? null,
  );
  const [uploading, setUploading] = useState(false);

  const {
    items: patients,
    loading: loadingPatients,
    loadingMore: loadingMorePatients,
    hasMorePage: hasMorePatients,
    loadNextPage: loadNextPatientPage,
    search: patientSearch,
    setSearch: setPatientSearch,
    open: showDropdown,
    setOpen: setShowDropdown,
  } = useAutoComplete<Patient>({
    fetcher: patientsService.list,
    pageSize: 8,
    debounceMs: 300,
    enabled: !preselectedPatient,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UploadExamFormData>({
    resolver: yupResolver(uploadExamSchema) as Resolver<UploadExamFormData>,
    defaultValues: {
      patientId: preselectedPatient?.id ?? '',
      title: '',
      examDate: new Date().toISOString().slice(0, 10),
    },
  });

  const title = watch('title');
  const examDate = watch('examDate');
  const file = watch('file');

  useEffect(() => {
    if (preselectedPatient) {
      setValue('patientId', preselectedPatient.id);
    }
  }, [preselectedPatient, setValue]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setValue('file', selectedFile, { shouldValidate: true });
  };

  const onSubmit = async (data: UploadExamFormData) => {
    setUploading(true);
    try {
      const study = await studiesService.upload(
        data.patientId,
        data.file,
        data.title.trim(),
        data.examDate || undefined,
      );
      onSuccess(study);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),32rem)] flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
      <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">
              Enviar Exame
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
              Faça o upload do PDF do exame para análise automática
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {!preselectedPatient && (
          <Autocomplete
            label="Paciente"
            required
            placeholder="Buscar paciente por nome..."
            search={patientSearch}
            onSearchChange={setPatientSearch}
            items={patients}
            getOptionLabel={(patient) => patient.name}
            getOptionDescription={(patient) => patient.breed}
            loading={loadingPatients}
            loadingMore={loadingMorePatients}
            hasMorePage={hasMorePatients}
            onLoadNextPage={loadNextPatientPage}
            open={showDropdown}
            onOpenChange={setShowDropdown}
            selectedOption={
              selectedPatient
                ? {
                  id: selectedPatient.id,
                  label: selectedPatient.name,
                  description: selectedPatient.breed,
                }
                : null
            }
            onSelect={(patient) => {
              setSelectedPatient(patient);
              setValue('patientId', patient.id, { shouldValidate: true });
              setPatientSearch('');
            }}
            onClear={() => {
              setSelectedPatient(null);
              setValue('patientId', '', { shouldValidate: true });
            }}
            error={errors.patientId?.message}
            emptyMessage="Nenhum paciente encontrado"
          />
        )}

        {preselectedPatient && (
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
                Paciente
            </label>
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
              <span className="text-sm font-medium text-primary">
                {preselectedPatient.name}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InputWithLabel
            label="Título do exame"
            required
            value={title}
            onChange={(e) =>
              setValue('title', e.target.value, { shouldValidate: true })
            }
            placeholder="Ex: Hemograma Completo"
            error={errors.title?.message}
          />
          <DateInput
            label="Data do exame"
            value={examDate}
            onChange={(value) =>
              setValue('examDate', value, { shouldValidate: true })
            }
            required
            error={errors.examDate?.message}
          />
        </div>

        <FileDropzone
          label="Arquivo PDF do exame"
          required
          file={file}
          accept="application/pdf"
          helperText="Apenas arquivos PDF são aceitos"
          error={errors.file?.message}
          onFileSelect={handleFileChange}
        />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border p-4">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          loading={uploading}
          className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {uploading ? (
            <>Enviando...</>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
                Enviar Exame
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
