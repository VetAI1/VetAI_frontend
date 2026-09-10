'use client';

import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { documentsService } from '@/services/documents.service';
import { galleryService } from '@/services/gallery.service';
import type { GalleryItem } from '@/types/health-record';

interface PatientGalleryCardProps {
  patientId: string;
  onView: (doc: { url: string; mimeType: string; fileName: string }) => void;
  onRequestDelete: (action: () => Promise<void>) => void;
}

// As miniaturas passam pelo endpoint autenticado, entao nao dao para colocar
// direto no src: cada uma vira um object URL revogado ao desmontar.
function Thumbnail({
  patientId,
  item,
}: {
  patientId: string;
  item: GalleryItem;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = item.mimeType.startsWith('image/');

  useEffect(() => {
    if (!isImage) return;
    let objectUrl: string | null = null;
    let active = true;

    void galleryService
      .download(patientId, item.id)
      .then((result) => {
        if (!active) {
          URL.revokeObjectURL(result.url);
          return;
        }
        objectUrl = result.url;
        setUrl(result.url);
      })
      .catch(() => undefined);

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [patientId, item.id, isImage]);

  if (isImage && url) {
    return (
      <img
        src={url}
        alt={item.fileName}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      {isImage ? (
        <Loader2
          size={18}
          className="animate-spin text-stone-500 dark:text-stone-400"
        />
      ) : (
        <FileText size={22} className="text-stone-500 dark:text-stone-400" />
      )}
    </div>
  );
}

export function PatientGalleryCard({
  patientId,
  onView,
  onRequestDelete,
}: PatientGalleryCardProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await galleryService.list(patientId));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await documentsService.upload(patientId, file);
      await load();
    } finally {
      setUploading(false);
    }
  };

  const handleOpen = async (item: GalleryItem) => {
    setOpeningId(item.id);
    try {
      const { url, mimeType } = await galleryService.download(
        patientId,
        item.id,
      );
      onView({ url, mimeType, fileName: item.fileName });
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    await documentsService.delete(patientId, item.id);
    await load();
  };

  return (
    <SectionCard
      title="Galeria"
      subtitle="Imagens e documentos do paciente, incluindo anexos de exames"
      headerAction={
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = '';
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-9 bg-teal-800 text-white hover:bg-teal-800/90 dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-500/90"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            Enviar Documento
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed border-stone-200 py-10 text-center transition-colors hover:border-teal-800/40 dark:border-stone-800 dark:hover:border-teal-500/40"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload
            size={32}
            className="mx-auto mb-2 text-stone-500/50 dark:text-stone-400/50"
          />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Nenhum arquivo ainda — clique para enviar
          </p>
          <p className="mt-1 text-xs text-stone-500/70 dark:text-stone-400/70">
            Anexos de exames aparecem aqui automaticamente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800"
            >
              <button
                type="button"
                onClick={() => void handleOpen(item)}
                disabled={openingId === item.id}
                className="block aspect-square w-full bg-stone-100 dark:bg-stone-800"
                title={item.fileName}
              >
                <Thumbnail patientId={patientId} item={item} />
              </button>

              <div className="p-2">
                <p className="truncate text-xs font-medium text-stone-900 dark:text-stone-100">
                  {item.fileName}
                </p>
                <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                  {item.source === 'study'
                    ? (item.studyTitle ?? 'Exame')
                    : 'Documento'}
                </p>
              </div>

              {item.source === 'study' && (
                <span className="absolute left-2 top-2 rounded bg-teal-800/90 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-teal-500/90 dark:text-stone-950">
                  Exame
                </span>
              )}

              {/* Anexo de exame nao se apaga daqui: removeria a evidencia da
                  analise ja gerada. */}
              {item.source === 'patient' && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRequestDelete(() => handleDelete(item))}
                  className="absolute right-1 top-1 bg-white/80 text-stone-500/70 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:bg-stone-900/80 dark:text-stone-400/70 dark:hover:bg-red-900 dark:hover:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
