/**
 * math-parser.ts
 * Inline math expression evaluator.
 * Supports: +, -, *, /, %, ^, sqrt(), round(), floor(), ceil(), abs()
 * Also handles: percentage shortcuts like "15% dari 200000"
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MathResult {
  expression: string;
  result: number;
  formatted: string;
}

export interface MathParseError {
  expression: string;
  error: string;
}

export type MathParseOutcome =
  | { ok: true; value: MathResult }
  | { ok: false; error: MathParseError };

// ─── Constants ────────────────────────────────────────────────────────────────

/** Pattern that triggers math evaluation. Must end with = */
const MATH_TRIGGER_PATTERN = /^(.+?)=\s*$/;

/** Indonesian percentage pattern: "15% dari 200000" */
const ID_PERCENTAGE_PATTERN = /^([\d.,]+)%\s+dari\s+([\d.,]+)$/i;

/** Allowed characters in a math expression (whitelist) */
const SAFE_CHARS = /^[0-9+\-*/%^().√πe ,\s]+$/i;

// ─── Safe evaluator ──────────────────────────────────────────────────────────

function normalizeExpression(raw: string): string {
  return raw
    .replace(/,/g, '') // remove thousand separators
    .replace(/√/g, 'sqrt')
    .replace(/π/g, String(Math.PI))
    .trim();
}

function safeEval(expr: string): number {
  // Allow only safe math characters
  if (!SAFE_CHARS.test(expr)) {
    throw new Error('Ekspresi mengandung karakter tidak aman');
  }

  // Replace math functions with Math.* equivalents
  const replaced = expr
    .replace(/sqrt\(/gi, 'Math.sqrt(')
    .replace(/round\(/gi, 'Math.round(')
    .replace(/floor\(/gi, 'Math.floor(')
    .replace(/ceil\(/gi, 'Math.ceil(')
    .replace(/abs\(/gi, 'Math.abs(')
    .replace(/\^/g, '**');

  // eslint-disable-next-line no-new-func
  const fn = new Function(`"use strict"; return (${replaced});`);
  const result = fn() as unknown;

  if (typeof result !== 'number' || !isFinite(result)) {
    throw new Error('Hasil tidak valid');
  }

  return result;
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatResult(n: number): string {
  // Integer — no decimals
  if (Number.isInteger(n)) {
    return n.toLocaleString('id-ID');
  }
  // Up to 6 significant decimals, strip trailing zeros
  const str = n.toPrecision(6).replace(/\.?0+$/, '');
  return parseFloat(str).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Try to parse and evaluate a math expression string.
 * Input should be raw text from a math block (may or may not end with =).
 */
export function parseMath(input: string): MathParseOutcome {
  const trimmed = input.trim();

  // Strip trailing = if present
  const withoutEquals = MATH_TRIGGER_PATTERN.test(trimmed)
    ? trimmed.replace(/=\s*$/, '').trim()
    : trimmed;

  // Indonesian percentage shorthand
  const idPct = ID_PERCENTAGE_PATTERN.exec(withoutEquals);
  if (idPct) {
    const pct = parseFloat(idPct[1]!.replace(',', '.'));
    const base = parseFloat(idPct[2]!.replace(/,/g, ''));
    const result = (pct / 100) * base;
    return {
      ok: true,
      value: {
        expression: withoutEquals,
        result,
        formatted: formatResult(result),
      },
    };
  }

  const normalized = normalizeExpression(withoutEquals);

  if (!normalized) {
    return {
      ok: false,
      error: { expression: input, error: 'Ekspresi kosong' },
    };
  }

  try {
    const result = safeEval(normalized);
    return {
      ok: true,
      value: {
        expression: withoutEquals,
        result,
        formatted: formatResult(result),
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        expression: input,
        error: err instanceof Error ? err.message : 'Ekspresi tidak valid',
      },
    };
  }
}

/**
 * Returns true if the text string looks like a math expression
 * (ends with = and contains numeric/operator chars).
 */
export function isMathExpression(text: string): boolean {
  const trimmed = text.trim();
  if (!MATH_TRIGGER_PATTERN.test(trimmed)) return false;
  const inner = trimmed.replace(/=\s*$/, '').trim();
  return /[0-9]/.test(inner) && /[+\-*/^%√]|sqrt|dari/.test(inner);
}
