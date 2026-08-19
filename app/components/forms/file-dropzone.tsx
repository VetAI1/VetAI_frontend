'use client';

import { FileText, Upload } from 'lucide-react';
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
}

export function FileDropzone({
  label,
  required,
  file,
  accept,
  helperText,
  error,
  onFileSelect,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <FieldShell label={label} required={required} error={error}>
      <div
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 ${
          isDragging
            ? 'border-teal-800 dark:border-teal-500 bg-stone-100 dark:bg-stone-800'
            : file
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
          onFileSelect(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText
              size={24}
              className="shrink-0 text-teal-800 dark:text-teal-500"
            />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                {file.name}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload
              size={24}
              className="mx-auto mb-2 text-stone-500 dark:text-stone-400"
            />
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            {helperText && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {helperText}
              </p>
            )}
          </>
        )}
      </div>
    </FieldShell>
  );
}
