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
      className="text-muted-foreground/70 hover:text-danger hover:bg-danger-soft shrink-0"
    >
      <Trash2 size={14} />
    </Button>
  );
}
