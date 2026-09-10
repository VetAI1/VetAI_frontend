'use client';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { documentsService } from '@/services/documents.service';
import { galleryService } from '@/services/gallery.service';
import type { GalleryItem } from '@/types/health-record';

interface PatientGalleryCardProps {
  patientId: string;
  onRequestDelete: (action: () => Promise<void>) => void;
}

export function PatientGalleryCard({
  patientId,
  onRequestDelete,
}: PatientGalleryCardProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Os arquivos vem de endpoint autenticado, entao nao dao para usar direto no
  // src: cada um vira um object URL, reaproveitado entre miniatura e lightbox.
  const [urls, setUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef<Record<string, string>>({});
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

  useEffect(() => {
    let active = true;

    for (const item of items) {
      if (urlsRef.current[item.id]) continue;
      void galleryService
        .download(patientId, item.id)
        .then(({ url }) => {
          if (!active) {
            URL.revokeObjectURL(url);
            return;
          }
          urlsRef.current[item.id] = url;
          setUrls((current) => ({ ...current, [item.id]: url }));
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
    };
  }, [items, patientId]);

  // Revoga tudo so ao desmontar: revogar por item quebraria o lightbox aberto.
  useEffect(() => {
    const cache = urlsRef;
    return () => {
      Object.values(cache.current).forEach(URL.revokeObjectURL);
      cache.current = {};
    };
  }, []);

  const openItem = items[openIndex ?? -1];

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null || items.length === 0) return current;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, step]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await documentsService.upload(patientId, file);
      await load();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    await documentsService.delete(patientId, item.id);
    delete urlsRef.current[item.id];
    await load();
  };

  const renderPreview = (item: GalleryItem, enlarged = false) => {
    const url = urls[item.id];

    if (!url) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2
            size={enlarged ? 32 : 18}
            className="animate-spin text-stone-500 dark:text-stone-400"
          />
        </div>
      );
    }

    if (item.mimeType.startsWith('image/')) {
      return (
        <img
          src={url}
          alt={item.fileName}
          className={
            enlarged
              ? 'max-h-full max-w-full object-contain'
              : 'h-full w-full object-cover'
          }
        />
      );
    }

    if (item.mimeType.includes('pdf')) {
      return enlarged ? (
        <iframe src={url} className="h-full w-full border-0" title={item.fileName} />
      ) : (
        // pointer-events-none deixa o clique chegar no tile, e nao no visor
        // interno do PDF.
        <iframe
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          className="pointer-events-none h-full w-full border-0"
          title={item.fileName}
          tabIndex={-1}
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center">
        <FileText
          size={enlarged ? 48 : 22}
          className="text-stone-500 dark:text-stone-400"
        />
      </div>
    );
  };

  return (
    <>
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
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="block aspect-square w-full overflow-hidden bg-stone-100 dark:bg-stone-800"
                  title={item.fileName}
                >
                  {renderPreview(item)}
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

      {openItem && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {openItem.fileName}
              </p>
              <p className="truncate text-xs text-white/60">
                {openItem.source === 'study'
                  ? (openItem.studyTitle ?? 'Anexo de exame')
                  : 'Documento'}{' '}
                · {(openIndex ?? 0) + 1} de {items.length}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {urls[openItem.id] && (
                <a
                  href={urls[openItem.id]}
                  download={openItem.fileName}
                  title="Baixar"
                  className="rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <Download size={18} />
                </a>
              )}
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                title="Fechar"
                className="rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => step(-1)}
                title="Anterior"
                className="absolute left-3 z-10 rounded-full bg-black/50 p-2 text-white/90 hover:bg-black/70 hover:text-white"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div className="flex h-full w-full items-center justify-center">
              {renderPreview(openItem, true)}
            </div>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                title="Próximo"
                className="absolute right-3 z-10 rounded-full bg-black/50 p-2 text-white/90 hover:bg-black/70 hover:text-white"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
