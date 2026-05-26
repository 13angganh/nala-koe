'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseMath, isMathExpression } from '@/lib/math-parser';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteMathBlockProps {
  expression: string;
  onChange: (expression: string) => void;
  readOnly?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteMathBlock({
  expression,
  onChange,
  readOnly = false,
  className,
}: NoteMathBlockProps) {
  const [localExpr, setLocalExpr] = useState(expression);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Evaluate whenever expression changes
  useEffect(() => {
    const trimmed = localExpr.trim();
    if (!trimmed) {
      setResult(null);
      setErrorMsg(null);
      return;
    }

    if (isMathExpression(trimmed) || trimmed.endsWith('=')) {
      const outcome = parseMath(trimmed);
      if (outcome.ok) {
        setResult(outcome.value.formatted);
        setErrorMsg(null);
      } else {
        setResult(null);
        setErrorMsg(outcome.error.error);
      }
    } else {
      setResult(null);
      setErrorMsg(null);
    }
  }, [localExpr]);

  const handleChange = useCallback(
    (value: string) => {
      setLocalExpr(value);
      onChange(value);
    },
    [onChange]
  );

  const displayExpression = localExpr.replace(/=\s*$/, '').trim();

  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]',
        'overflow-hidden',
        className
      )}
      role="group"
      aria-label="Blok matematika"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface-base)]">
        <Calculator className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
        <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
          Kalkulasi
        </span>
      </div>

      <div className="p-3 space-y-2">
        {readOnly ? (
          <div className="font-mono text-sm text-[var(--text-primary)]">
            {displayExpression || expression}
          </div>
        ) : (
          <input
            type="text"
            value={localExpr}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Contoh: 15% dari 200000= atau (100 + 50) * 2="
            aria-label="Ekspresi matematika"
            className={cn(
              'w-full bg-transparent font-mono text-sm',
              'text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)] placeholder:text-xs',
              'outline-none focus:ring-0 border-none'
            )}
            spellCheck={false}
            autoComplete="off"
          />
        )}

        {/* Result */}
        {result !== null && (
          <div
            className="flex items-baseline gap-2"
            aria-live="polite"
            aria-label={`Hasil: ${result}`}
          >
            <span className="text-[var(--text-tertiary)] text-xs font-mono">=</span>
            <span className="text-lg font-semibold font-mono text-[var(--accent)]">
              {result}
            </span>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div
            className="flex items-center gap-1.5 text-[var(--error)] text-xs"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hint — only shown when input is empty */}
        {!readOnly && !localExpr.trim() && (
          <p className="text-xs text-[var(--text-tertiary)]">
            Ketik ekspresi dan akhiri dengan <kbd className="px-1 py-0.5 rounded bg-[var(--surface-base)] border border-[var(--border)] font-mono">=</kbd> untuk menghitung.
          </p>
        )}
      </div>
    </div>
  );
}
