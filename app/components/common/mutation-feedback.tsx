'use client';

import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';

function MutationFeedback({ message }: { message: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center gap-3 rounded-lg border border-success/20 bg-card px-4 py-3 shadow-[var(--shadow-card)]"
      role="status"
    >
      <span className="grid size-7 place-items-center rounded-full bg-success-soft text-success">
        <Check size={15} strokeWidth={3} />
      </span>
      <p className="text-sm font-semibold text-foreground">{message}</p>
    </motion.div>
  );
}

export function notifyMutationSuccess(message: string) {
  toast.custom(() => <MutationFeedback message={message} />, {
    duration: 2400,
  });
}
