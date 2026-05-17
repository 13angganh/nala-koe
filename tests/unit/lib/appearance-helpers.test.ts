import { describe, it, expect } from 'vitest';
import { fontWeightClass } from '@/components/notes/note-font-picker';
import { textureClass } from '@/components/notes/note-texture-picker';

// ─── fontWeightClass ──────────────────────────────────────────────────────────

describe('fontWeightClass', () => {
  it('returns "font-normal" for regular', () => {
    expect(fontWeightClass('regular')).toBe('font-normal');
  });

  it('returns "font-medium" for medium', () => {
    expect(fontWeightClass('medium')).toBe('font-medium');
  });

  it('returns "font-semibold" for semibold', () => {
    expect(fontWeightClass('semibold')).toBe('font-semibold');
  });

  it('returns "italic" for italic', () => {
    expect(fontWeightClass('italic')).toBe('italic');
  });

  it('defaults to "font-normal" for unknown value', () => {
    // @ts-expect-error — testing runtime fallback
    expect(fontWeightClass('unknown')).toBe('font-normal');
  });
});

// ─── textureClass ─────────────────────────────────────────────────────────────

describe('textureClass', () => {
  it('returns empty string for plain', () => {
    expect(textureClass('plain')).toBe('');
  });

  it('returns "texture-lined" for lined', () => {
    expect(textureClass('lined')).toBe('texture-lined');
  });

  it('returns "texture-dotgrid" for dotgrid', () => {
    expect(textureClass('dotgrid')).toBe('texture-dotgrid');
  });

  it('returns "texture-grid" for grid', () => {
    expect(textureClass('grid')).toBe('texture-grid');
  });

  it('defaults to empty string for unknown value', () => {
    // @ts-expect-error — testing runtime fallback
    expect(textureClass('unknown')).toBe('');
  });
});
