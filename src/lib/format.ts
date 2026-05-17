import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CONFIG } from '@/constants/config';

/**
 * Format numbers. ALL number/currency/date formatting must go through here.
 * Never use Intl.NumberFormat or date-fns directly in components.
 */

const numberFormatter = new Intl.NumberFormat('id-ID');
const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} rb`;
  return String(value);
}

/** Format a date as "15 Januari 2025" */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd MMMM yyyy', { locale: localeId });
}

/** Format a date as "15/01/2025" */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy');
}

/** Format a date as "Hari ini", "Kemarin", or "15 Jan" */
export function formatDateSmart(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return 'Hari ini';
  if (isYesterday(d)) return 'Kemarin';
  return format(d, 'd MMM yyyy', { locale: localeId });
}

/** Format as "3 hari yang lalu", "baru saja", etc. */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: localeId });
}

/** Format as "09:30" */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm');
}

/** Format as "Senin, 15 Januari 2025" */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE, d MMMM yyyy', { locale: localeId });
}

/** Format word count as "1.234 kata" */
export function formatWordCount(count: number): string {
  return `${formatNumber(count)} kata`;
}

/** Estimate reading time in minutes */
export function formatReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / CONFIG.WORDS_PER_MINUTE);
  if (minutes < 1) return '< 1 mnt baca';
  return `${minutes} mnt baca`;
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format temperature */
export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

/** Format percentage */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}
