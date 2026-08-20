import { cn } from '@/infra/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  className,
  disabled = false,
}: SwitchProps) {
  return (
    <label
      className={cn(
        'relative inline-flex items-center cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer"
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-stone-300 dark:bg-stone-700 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-600/30 dark:peer-focus:ring-teal-500/30 peer-checked:bg-teal-800 dark:peer-checked:bg-teal-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:after:bg-stone-950 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
    </label>
  );
}
