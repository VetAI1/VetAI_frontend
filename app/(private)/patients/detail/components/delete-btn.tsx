'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DeleteBtnProps {
  onDelete: () => void;
}

export function DeleteBtn({ onDelete }: DeleteBtnProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onDelete}
      className="text-stone-500/70 dark:text-stone-400/70 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 shrink-0"
    >
      <Trash2 size={14} />
    </Button>
  );
}
