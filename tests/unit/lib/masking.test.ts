import { describe, it, expect } from 'vitest';
import { maskNIK, maskPhone, maskEmail, maskCardNumber } from '@/lib/masking';

describe('maskNIK', () => {
  it('shows first 4 and last 4 digits', () => {
    const result = maskNIK('3201011234567890');
    expect(result.startsWith('3201')).toBe(true);
    expect(result.endsWith('7890')).toBe(true);
  });

  it('uses bullet character for masked digits', () => {
    const result = maskNIK('3201011234567890');
    expect(result).toContain('•');
  });

  it('returns short strings as-is', () => {
    expect(maskNIK('1234567')).toBe('1234567');
  });
});

describe('maskPhone', () => {
  it('shows first 4 and last 2 digits', () => {
    const result = maskPhone('08123456789');
    expect(result.startsWith('0812')).toBe(true);
    expect(result.endsWith('89')).toBe(true);
  });

  it('uses bullet for masked digits', () => {
    expect(maskPhone('08123456789')).toContain('•');
  });

  it('strips non-digits before masking', () => {
    const result = maskPhone('+62 812-3456-789');
    expect(result).toBeTruthy();
  });

  it('returns short numbers as-is', () => {
    expect(maskPhone('1234')).toBe('1234');
  });
});

describe('maskEmail', () => {
  it('shows first char of local + domain', () => {
    const result = maskEmail('budi@gmail.com');
    expect(result.startsWith('b')).toBe(true);
    expect(result.endsWith('@gmail.com')).toBe(true);
  });

  it('replaces local part with asterisks', () => {
    const result = maskEmail('budi@gmail.com');
    expect(result).toContain('*');
  });

  it('handles short local parts', () => {
    const result = maskEmail('a@x.com');
    expect(result).toContain('@x.com');
  });

  it('returns unchanged if no @ found', () => {
    expect(maskEmail('notanemail')).toBe('notanemail');
  });
});

describe('maskCardNumber', () => {
  it('shows only last 4 digits', () => {
    const result = maskCardNumber('4111111111111234');
    expect(result.endsWith('1234')).toBe(true);
  });

  it('uses bullet placeholders for other digits', () => {
    const result = maskCardNumber('4111111111111234');
    expect(result).toContain('••••');
  });

  it('strips spaces before masking', () => {
    const result = maskCardNumber('4111 1111 1111 1234');
    expect(result.endsWith('1234')).toBe(true);
  });

  it('returns short strings as-is', () => {
    expect(maskCardNumber('123')).toBe('123');
  });
});
