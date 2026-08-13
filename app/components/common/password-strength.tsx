'use client';

import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

const RULES = [
  { label: 'Pelo menos 6 caracteres', test: (p: string) => p.length >= 6 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /\d/.test(p) },
  {
    label: 'Um caractere especial',
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(p),
  },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const results = useMemo(
    () => RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );

  const passedCount = results.filter((r) => r.passed).length;
  const strength = passedCount / RULES.length;

  const barColor =
    strength <= 0.25
      ? 'bg-red-500'
      : strength <= 0.5
        ? 'bg-orange-500'
        : strength <= 0.75
          ? 'bg-yellow-500'
          : 'bg-green-500';

  const strengthLabel =
    strength <= 0.25
      ? 'Muito fraca'
      : strength <= 0.5
        ? 'Fraca'
        : strength <= 0.75
          ? 'Média'
          : 'Forte';

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            strength <= 0.5
              ? 'text-red-500'
              : strength <= 0.75
                ? 'text-yellow-600'
                : 'text-green-600'
          }`}
        >
          {strengthLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {results.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5">
            {rule.passed ? (
              <Check size={12} className="text-green-500 shrink-0" />
            ) : (
              <X
                size={12}
                className="shrink-0 text-muted-foreground"
              />
            )}
            <span
              className={`text-xs transition-colors ${
                rule.passed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              }`}
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isPasswordStrong(password: string): boolean {
  return RULES.every((rule) => rule.test(password));
}
