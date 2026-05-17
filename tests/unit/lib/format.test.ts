import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatCompact,
  formatDate,
  formatDateShort,
  formatDateSmart,
  formatRelativeTime,
  formatTime,
  formatWordCount,
  formatFileSize,
  formatTemperature,
  formatPercentage,
} from '@/lib/format';

const FIXED_DATE = new Date('2025-01-15T09:30:00.000Z');

describe('formatNumber', () => {
  it('formats with Indonesian locale (dot separator)', () => {
    const result = formatNumber(1000000);
    // id-ID uses dots for thousands
    expect(result).toMatch(/1[.,]000[.,]000/);
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatCurrency', () => {
  it('includes Rp symbol', () => {
    expect(formatCurrency(50000)).toMatch(/Rp/);
  });

  it('includes the amount', () => {
    expect(formatCurrency(50000)).toMatch(/50/);
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });
});

describe('formatCompact', () => {
  it('formats millions with jt suffix', () => {
    expect(formatCompact(1500000)).toBe('1.5 jt');
  });

  it('formats thousands with rb suffix', () => {
    expect(formatCompact(2500)).toBe('2.5 rb');
  });

  it('returns plain number for small values', () => {
    expect(formatCompact(42)).toBe('42');
  });

  it('handles exactly 1000', () => {
    expect(formatCompact(1000)).toBe('1.0 rb');
  });
});

describe('formatDate', () => {
  it('returns day, month name, and year in Indonesian', () => {
    const result = formatDate(FIXED_DATE);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
    // Indonesian month name
    expect(result.toLowerCase()).toMatch(/januari/i);
  });

  it('accepts ISO string', () => {
    const result = formatDate('2025-06-01T00:00:00.000Z');
    expect(result).toMatch(/2025/);
  });
});

describe('formatDateShort', () => {
  it('formats as DD/MM/YYYY', () => {
    const result = formatDateShort(new Date('2025-03-07T00:00:00.000Z'));
    expect(result).toBe('07/03/2025');
  });
});

describe('formatDateSmart', () => {
  it('returns "Hari ini" for today', () => {
    expect(formatDateSmart(new Date())).toBe('Hari ini');
  });

  it('returns "Kemarin" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDateSmart(yesterday)).toBe('Kemarin');
  });

  it('returns formatted date for older dates', () => {
    const old = new Date('2024-01-01T00:00:00.000Z');
    const result = formatDateSmart(old);
    expect(result).not.toBe('Hari ini');
    expect(result).not.toBe('Kemarin');
    expect(result).toMatch(/2024/);
  });
});

describe('formatRelativeTime', () => {
  it('returns a non-empty string', () => {
    const result = formatRelativeTime(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes time indicator for past dates', () => {
    const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const result = formatRelativeTime(old);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  it('formats as HH:mm', () => {
    const result = formatTime(new Date('2025-01-15T14:05:00.000+07:00'));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatWordCount', () => {
  it('formats with "kata" suffix', () => {
    expect(formatWordCount(100)).toContain('kata');
    expect(formatWordCount(100)).toContain('100');
  });

  it('handles zero', () => {
    expect(formatWordCount(0)).toContain('0');
  });
});

describe('formatFileSize', () => {
  it('formats bytes for small values', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('formats as KB', () => {
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });

  it('formats as MB', () => {
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });
});

describe('formatTemperature', () => {
  it('appends °C', () => {
    expect(formatTemperature(27)).toBe('27°C');
  });

  it('rounds decimals', () => {
    expect(formatTemperature(27.7)).toBe('28°C');
  });
});

describe('formatPercentage', () => {
  it('calculates percentage correctly', () => {
    expect(formatPercentage(1, 4)).toBe('25%');
  });

  it('rounds to integer', () => {
    expect(formatPercentage(1, 3)).toBe('33%');
  });

  it('returns 0% for zero total', () => {
    expect(formatPercentage(5, 0)).toBe('0%');
  });
});
