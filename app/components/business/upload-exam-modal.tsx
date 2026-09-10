'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { CheckCircle2, FileUp, FlaskConical, Scan, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';

import { Autocomplete } from '../forms/autocomplete';
import { DateInput } from '../forms/date-input';
import { FileDropzone } from '../forms/file-dropzone';
import { InputWithLabel } from '../forms/input-with-label';

import { Button } from '@/components/ui/button';
import { STUDY_ACCEPTED_MIME_TYPES, STUDY_TYPE_MAP } from '@/constants';
import { useAutoComplete } from '@/hooks/use-auto-complete';
import { uploadExamSchema, type UploadExamFormData } from '@/schemas/vaccine';
import { patientsService } from '@/services/patients.service';
import { studiesService } from '@/services/studies.service';
import type { Patient } from '@/types/patient';
import type { Study, StudyType } from '@/types/study';

const TYPE_OPTIONS: {
  value: StudyType;
  icon: typeof FlaskConical;
}[] = [
  { value: 'LABORATORY', icon: FlaskConical },
  { value: 'IMAGING', icon: Scan },
];

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
      type: 'LABORATORY',
      examDate: new Date().toISOString().slice(0, 10),
    },
  });

  const title = watch('title');
  const examDate = watch('examDate');
  const file = watch('file');
  const files = watch('files');
  const type = watch('type');
  const isImaging = type === 'IMAGING';
  const readyToUpload = Boolean(
    selectedPatient &&
      title?.trim() &&
      (isImaging ? files?.length : Boolean(file)),
  );

  useEffect(() => {
    if (preselectedPatient) {
      setValue('patientId', preselectedPatient.id);
    }
  }, [preselectedPatient, setValue]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setValue('file', selectedFile, { shouldValidate: true });
    setValue('files', [selectedFile]);
  };

  const handleFilesChange = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setValue('files', selectedFiles);
    // `file` continua sendo a primeira imagem para aproveitar a validacao de
    // formato ja existente no schema.
    setValue('file', selectedFiles[0]!, { shouldValidate: true });
  };

  const handleTypeChange = (nextType: StudyType) => {
    setValue('type', nextType, { shouldValidate: true });
    // A file picked for the previous type may no longer be an accepted format.
    if (file && !STUDY_ACCEPTED_MIME_TYPES[nextType].includes(file.type)) {
      setValue('file', undefined as unknown as File, { shouldValidate: true });
      setValue('files', []);
    }
    // Sair de imagem para laboratorio descarta as incidencias extras.
    if (nextType !== 'IMAGING' && (files?.length ?? 0) > 1) {
      setValue('files', file ? [file] : []);
    }
  };

  const onSubmit = async (data: UploadExamFormData) => {
    setUploading(true);
    try {
      const study = await studiesService.upload(
        data.patientId,
        isImaging && data.files?.length ? data.files : data.file,
        data.title.trim(),
        data.type,
        data.examDate || undefined,
      );
      onSuccess(study);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),32rem)] flex-col overflow-hidden rounded-xl bg-white dark:bg-stone-900 shadow-[var(--shadow-card)]">
      <div className="flex shrink-0 items-center justify-between border-b border-stone-200 dark:border-stone-800 p-5">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Enviar Exame
          </h2>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Faça o upload do exame para análise automática por IA
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-stone-500 dark:text-stone-400"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <div className="flex items-center gap-2 rounded-lg bg-stone-100/70 px-3 py-2 text-xs font-medium text-stone-500 transition-colors dark:bg-stone-800/70 dark:text-stone-400">
          <span
            className={`grid size-5 place-items-center rounded-full transition-colors duration-200 ${readyToUpload ? 'bg-teal-800 text-white dark:bg-teal-500 dark:text-stone-950' : 'bg-white text-stone-500 dark:bg-stone-900 dark:text-stone-400'}`}
          >
            {readyToUpload ? <CheckCircle2 size={13} /> : <FileUp size={13} />}
          </span>
          {readyToUpload
            ? 'Exame pronto para análise.'
            : `Selecione o paciente, informe o título e anexe o ${isImaging ? 'arquivo' : 'PDF'}.`}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-900 dark:text-stone-100">
            Tipo de exame <span className="text-red-600 dark:text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map(({ value, icon: Icon }) => {
              const isSelected = type === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-teal-800 dark:border-teal-500 bg-teal-800/10 dark:bg-teal-500/10'
                      : 'border-stone-200 dark:border-stone-800 hover:border-teal-800/40 dark:hover:border-teal-500/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      size={15}
                      className={
                        isSelected
                          ? 'text-teal-800 dark:text-teal-500'
                          : 'text-stone-500 dark:text-stone-400'
                      }
                    />
                    <span
                      className={`text-sm font-medium ${isSelected ? 'text-teal-800 dark:text-teal-500' : 'text-stone-900 dark:text-stone-100'}`}
                    >
                      {STUDY_TYPE_MAP[value].shortLabel}
                    </span>
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {STUDY_TYPE_MAP[value].description}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.type?.message && (
            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-500">
              {errors.type.message}
            </p>
          )}
        </div>

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
            <label className="mb-2 block text-sm font-medium text-stone-900 dark:text-stone-100">
              Paciente
            </label>
            <div className="rounded-lg border border-teal-800/40 dark:border-teal-500/40 bg-teal-800/10 dark:bg-teal-500/10 p-3">
              <span className="text-sm font-medium text-teal-800 dark:text-teal-500">
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
            placeholder={
              isImaging
                ? 'Ex: Radiografia Torácica'
                : 'Ex: Hemograma Completo'
            }
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
          label={isImaging ? 'Arquivo do exame de imagem' : 'Arquivo PDF do exame'}
          required
          file={file}
          accept={STUDY_ACCEPTED_MIME_TYPES[type]}
          helperText={
            isImaging
              ? 'Laudo em PDF ou a própria imagem (JPG ou PNG)'
              : 'Apenas arquivos PDF são aceitos'
          }
          error={errors.file?.message}
          onFileSelect={handleFileChange}
          multiple={isImaging}
          files={files}
          onFilesSelect={handleFilesChange}
        />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800 p-4">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          loading={uploading}
          disabled={!readyToUpload || uploading}
          className="min-w-[120px] bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
        >
          {uploading ? (
            <span className="flex items-center">Enviando...</span>
          ) : (
            <span className="flex items-center">
              <Upload size={16} className="mr-2" />
              Enviar Exame
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
