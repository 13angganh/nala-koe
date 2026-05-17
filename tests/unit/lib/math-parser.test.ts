import { describe, it, expect } from 'vitest';
import { parseMath, isMathExpression } from '@/lib/math-parser';

// ─── isMathExpression ─────────────────────────────────────────────────────────

describe('isMathExpression', () => {
  it('detects expression ending with =', () => {
    expect(isMathExpression('100 + 200=')).toBe(true);
    expect(isMathExpression('(5 * 4) / 2=')).toBe(true);
    expect(isMathExpression('sqrt(16)=')).toBe(true);
  });

  it('detects Indonesian percentage shorthand', () => {
    expect(isMathExpression('15% dari 200000=')).toBe(true);
  });

  it('rejects plain text', () => {
    expect(isMathExpression('hello world')).toBe(false);
    expect(isMathExpression('tidak ada angka')).toBe(false);
  });

  it('rejects expression without = at end', () => {
    expect(isMathExpression('100 + 200')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isMathExpression('')).toBe(false);
    expect(isMathExpression('  ')).toBe(false);
  });
});

// ─── parseMath — basic arithmetic ─────────────────────────────────────────────

describe('parseMath — basic arithmetic', () => {
  it('adds two numbers', () => {
    const r = parseMath('100 + 200=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(300);
  });

  it('subtracts numbers', () => {
    const r = parseMath('500 - 125=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(375);
  });

  it('multiplies numbers', () => {
    const r = parseMath('12 * 12=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(144);
  });

  it('divides numbers', () => {
    const r = parseMath('100 / 4=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(25);
  });

  it('handles modulo', () => {
    const r = parseMath('17 % 5=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(2);
  });

  it('handles exponentiation with ^', () => {
    const r = parseMath('2^10=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(1024);
  });

  it('handles parentheses', () => {
    const r = parseMath('(10 + 5) * 4=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(60);
  });
});

// ─── parseMath — math functions ───────────────────────────────────────────────

describe('parseMath — math functions', () => {
  it('computes sqrt', () => {
    const r = parseMath('sqrt(144)=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(12);
  });

  it('computes round', () => {
    const r = parseMath('round(3.7)=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(4);
  });

  it('computes floor', () => {
    const r = parseMath('floor(3.9)=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(3);
  });

  it('computes ceil', () => {
    const r = parseMath('ceil(3.1)=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(4);
  });

  it('computes abs of negative', () => {
    const r = parseMath('abs(-42)=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(42);
  });

  it('handles √ symbol as alias for sqrt', () => {
    const r = parseMath('√(81)=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(9);
  });
});

// ─── parseMath — Indonesian percentage shorthand ──────────────────────────────

describe('parseMath — Indonesian percentage shorthand', () => {
  it('calculates "X% dari Y"', () => {
    const r = parseMath('15% dari 200000=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBeCloseTo(30000);
  });

  it('calculates 10% dari 500', () => {
    const r = parseMath('10% dari 500=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBeCloseTo(50);
  });

  it('calculates 100% dari 1000', () => {
    const r = parseMath('100% dari 1000=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBeCloseTo(1000);
  });

  it('is case-insensitive for "dari"', () => {
    const r = parseMath('20% DARI 300=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBeCloseTo(60);
  });
});

// ─── parseMath — edge cases ───────────────────────────────────────────────────

describe('parseMath — edge cases', () => {
  it('strips trailing = before evaluating', () => {
    const r1 = parseMath('5 + 5=');
    const r2 = parseMath('5 + 5');
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    if (r1.ok && r2.ok) {
      expect(r1.value.result).toBe(r2.value.result);
    }
  });

  it('strips thousand-separator commas', () => {
    const r = parseMath('1,000,000 / 1000=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(1000);
  });

  it('returns integer without decimal for whole result', () => {
    const r = parseMath('10 / 2=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBe(5);
    expect(r.value.formatted).not.toContain('.');
  });

  it('returns decimal for non-integer result', () => {
    const r = parseMath('10 / 3=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.result).toBeCloseTo(3.333, 2);
  });

  it('returns error for empty expression', () => {
    const r = parseMath('=');
    expect(r.ok).toBe(false);
  });

  it('returns error for unsafe characters', () => {
    const r = parseMath('process.exit(0)=');
    expect(r.ok).toBe(false);
  });

  it('returns error for non-finite result (division by zero)', () => {
    const r = parseMath('1 / 0=');
    expect(r.ok).toBe(false);
  });

  it('returns error for invalid expression', () => {
    const r = parseMath('+++=');
    expect(r.ok).toBe(false);
  });
});

// ─── parseMath — formatted output ─────────────────────────────────────────────

describe('parseMath — formatted output', () => {
  it('formats large integers with locale separator', () => {
    const r = parseMath('1000 * 1000=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Indonesian locale uses . as thousand separator or at minimum no commas
    expect(r.value.result).toBe(1_000_000);
    expect(r.value.formatted).toBeTruthy();
  });

  it('includes expression in result', () => {
    const r = parseMath('7 + 3=');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Expression should strip trailing =
    expect(r.value.expression).not.toContain('=');
    expect(r.value.expression).toContain('7');
  });
});
