/**
 * language-detector.ts
 * Auto-detect language from plain text using a lightweight approach.
 * Uses common word patterns for Indonesian/English, falls back to "unknown".
 *
 * We implement a lightweight detection without franc dependency
 * since franc requires Node.js imports. Uses script detection + word heuristics.
 */

export interface DetectionResult {
  /** ISO 639-1 code, e.g. 'id', 'en', 'ar', or null if undetectable */
  language: string | null;
  /** Human-readable label */
  label: string | null;
  /** Confidence 0.0–1.0 */
  confidence: number;
}

// ─── Language metadata ────────────────────────────────────────────────────────

const LANGUAGE_LABELS: Record<string, string> = {
  id: 'Indonesia',
  en: 'English',
  ms: 'Melayu',
  jv: 'Jawa',
  su: 'Sunda',
  ar: 'Arab',
  zh: 'Mandarin',
  ja: 'Jepang',
  ko: 'Korea',
  fr: 'Prancis',
  de: 'Jerman',
  es: 'Spanyol',
  pt: 'Portugis',
  ru: 'Rusia',
  hi: 'Hindi',
};

// ─── Heuristic word lists ─────────────────────────────────────────────────────

const ID_WORDS = new Set([
  'yang', 'dan', 'di', 'ini', 'itu', 'dengan', 'untuk', 'tidak', 'dari', 'ke',
  'adalah', 'ada', 'pada', 'akan', 'sudah', 'juga', 'saya', 'kamu', 'mereka',
  'kami', 'kita', 'bisa', 'harus', 'mau', 'dapat', 'tetapi', 'karena', 'jika',
  'atau', 'bahwa', 'lebih', 'sudah', 'masih', 'belum', 'kalau', 'nya',
]);

const EN_WORDS = new Set([
  'the', 'and', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to',
  'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'that', 'this',
  'it', 'its', 'not', 'but', 'or', 'an', 'a', 'my', 'your', 'our',
]);

// ─── Script detection ─────────────────────────────────────────────────────────

function detectScript(text: string): string | null {
  // Arabic script
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  // CJK Unified Ideographs (Chinese/Japanese/Korean shared)
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  // Hiragana/Katakana (Japanese)
  if (/[\u3040-\u30FF]/.test(text)) return 'ja';
  // Hangul (Korean)
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  return null; // Latin-based, need word analysis
}

// ─── Latin heuristic ─────────────────────────────────────────────────────────

function detectLatinLanguage(text: string): DetectionResult {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (words.length < 3) {
    return { language: null, label: null, confidence: 0 };
  }

  let idScore = 0;
  let enScore = 0;

  words.forEach((word) => {
    if (ID_WORDS.has(word)) idScore++;
    if (EN_WORDS.has(word)) enScore++;
  });

  const total = words.length;
  const idRatio = idScore / total;
  const enRatio = enScore / total;

  if (idRatio === 0 && enRatio === 0) {
    return { language: null, label: null, confidence: 0 };
  }

  if (idRatio > enRatio) {
    return { language: 'id', label: LANGUAGE_LABELS['id'] ?? null, confidence: Math.min(idRatio * 3, 1) };
  }
  if (enRatio > idRatio) {
    return { language: 'en', label: LANGUAGE_LABELS['en'] ?? null, confidence: Math.min(enRatio * 3, 1) };
  }

  // Tie — default to Indonesian (primary user base)
  return { language: 'id', label: LANGUAGE_LABELS['id'] ?? null, confidence: 0.5 };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Detect the language of a text snippet.
 * Returns null language if text is too short or ambiguous.
 */
export function detectLanguage(text: string): DetectionResult {
  const clean = text.replace(/\s+/g, ' ').trim();

  if (clean.length < 10) {
    return { language: null, label: null, confidence: 0 };
  }

  const scriptLang = detectScript(clean);
  if (scriptLang) {
    return {
      language: scriptLang,
      label: LANGUAGE_LABELS[scriptLang] ?? null,
      confidence: 0.95,
    };
  }

  return detectLatinLanguage(clean);
}

/**
 * Get the display label for a language code.
 */
export function getLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

/**
 * All supported language codes for filter dropdowns.
 */
export const SUPPORTED_LANGUAGES = Object.entries(LANGUAGE_LABELS).map(
  ([code, label]) => ({ code, label })
);
