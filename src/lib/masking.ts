/**
 * Data masking utilities for sensitive information.
 * Use when displaying partial data to users.
 */

/** Mask a NIK (Indonesian National ID): show first 4 and last 4 digits */
export function maskNIK(nik: string): string {
  if (nik.length < 8) return nik;
  return `${nik.slice(0, 4)}${'•'.repeat(nik.length - 8)}${nik.slice(-4)}`;
}

/** Mask a phone number: show first 4 and last 2 digits */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 6) return phone;
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  return `${start}${'•'.repeat(clean.length - 6)}${end}`;
}

/** Mask an email: show first char of local + domain */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = `${local[0]}${'*'.repeat(Math.max(local.length - 1, 2))}`;
  return `${masked}@${domain}`;
}

/** Mask a credit card number: show only last 4 digits */
export function maskCardNumber(cardNumber: string): string {
  const clean = cardNumber.replace(/\s/g, '');
  if (clean.length < 4) return cardNumber;
  return `•••• •••• •••• ${clean.slice(-4)}`;
}
