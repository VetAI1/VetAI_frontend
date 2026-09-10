'use client';

import { FileText, Upload } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

import { FieldShell } from '../forms/field-shell';

interface FileDropzoneProps {
  label: string;
  required?: boolean;
  file?: File | undefined;
  accept?: string;
  helperText?: string;
  error?: string | undefined;
  onFileSelect: (file: File | null) => void;
  // Exames de imagem tem varias incidencias que so se interpretam em conjunto.
  multiple?: boolean;
  files?: File[] | undefined;
  onFilesSelect?: (files: File[]) => void;
}

export function FileDropzone({
  label,
  required,
  file,
  accept,
  helperText,
  error,
  onFileSelect,
  multiple,
  files,
  onFilesSelect,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const reducedMotion = useReducedMotion();

  const selected = multiple ? (files ?? []) : file ? [file] : [];
  const hasSelection = selected.length > 0;

  const handleSelection = (fileList: FileList | null) => {
    if (multiple) {
      onFilesSelect?.(Array.from(fileList ?? []));
      return;
    }
    onFileSelect(fileList?.[0] ?? null);
  };

  return (
    <FieldShell label={label} required={required} error={error}>
      <div
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 ${
          isDragging
            ? 'border-teal-800 dark:border-teal-500 bg-stone-100 dark:bg-stone-800'
            : hasSelection
              ? 'border-teal-800/50 dark:border-teal-500/50 bg-stone-100/60 dark:bg-stone-800/60'
              : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-teal-800/50 dark:hover:border-teal-500/50 hover:bg-stone-100/60 dark:hover:bg-stone-800/60'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleSelection(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => handleSelection(event.target.files)}
        />

        <AnimatePresence mode="wait" initial={false}>
          {hasSelection ? (
            <motion.div
              key="selected-file"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="flex items-center justify-center gap-3"
            >
              <FileText
                size={24}
                className="shrink-0 text-teal-800 dark:text-teal-500"
              />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {selected.length > 1
                    ? `${selected.length} arquivos selecionados`
                    : selected[0]!.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {(
                    selected.reduce((total, item) => total + item.size, 0) /
                    1024 /
                    1024
                  ).toFixed(2)}{' '}
                  MB · Clique para trocar
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-file"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <Upload
                size={24}
                className="mx-auto mb-2 text-stone-500 dark:text-stone-400"
              />
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {multiple
                  ? 'Arraste os arquivos aqui ou clique para selecionar'
                  : 'Arraste o arquivo aqui ou clique para selecionar'}
              </p>
              {helperText && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {helperText}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FieldShell>
  );
}
