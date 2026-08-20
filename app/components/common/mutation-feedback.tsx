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
      className="flex items-center gap-3 rounded-lg border border-emerald-700/20 dark:border-emerald-500/20 bg-white dark:bg-stone-900 px-4 py-3 shadow-[var(--shadow-card)]"
      role="status"
    >
      <span className="grid size-7 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500">
        <Check size={15} strokeWidth={3} />
      </span>
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{message}</p>
    </motion.div>
  );
}

export function notifyMutationSuccess(message: string) {
  toast.custom(() => <MutationFeedback message={message} />, {
    duration: 2400,
  });
}
