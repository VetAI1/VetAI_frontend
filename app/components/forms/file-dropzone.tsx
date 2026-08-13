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
            ? 'border-primary bg-secondary'
            : file
              ? 'border-primary/50 bg-secondary/60'
              : 'border-input bg-card hover:border-primary/50 hover:bg-muted/60'
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
              className="shrink-0 text-primary"
            />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-secondary-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload
              size={24}
              className="mx-auto mb-2 text-muted-foreground"
            />
            <p className="text-sm font-semibold text-foreground">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            {helperText && (
              <p className="mt-1 text-xs text-muted-foreground">
                {helperText}
              </p>
            )}
          </>
        )}
      </div>
    </FieldShell>
  );
}
