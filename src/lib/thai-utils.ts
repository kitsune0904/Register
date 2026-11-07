/**
 * Thai Utilities for Tha Luang Technical College Online Admission System
 */

/**
 * Validate 13-digit Thai National ID using standard modulus 11 checksum
 */
export function validateThaiNationalId(id: string): boolean {
  if (!id || id.length !== 13) return false;
  if (!/^\d{13}$/.test(id)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12), 10);
}

/**
 * Convert Arabic numerals (0-9) to Thai numerals (๐-๙)
 */
export function toThaiNumerals(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.replace(/[0-9]/g, (match) => thaiDigits[parseInt(match, 10)]);
}

/**
 * Mask National ID for PDPA privacy (e.g. 1-1004-xxxxx-51-1)
 */
export function maskNationalId(id: string): string {
  if (!id || id.length !== 13) return id || '-';
  return `${id[0]}-${id.slice(1, 5)}-xxxxx-${id.slice(10, 12)}-${id[12]}`;
}

/**
 * Format Phone Number (e.g. 0812345678 -> 081-234-5678)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
  }
  return phone;
}

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export interface ThaiDateParts {
  day: string;
  month: string;
  year: string;
  dayThai?: string;
  yearThai?: string;
}

/**
 * Format Date to Thai Buddhist Calendar
 */
export function formatThaiDate(
  dateInput: string | Date | null | undefined,
  format: 'parts'
): ThaiDateParts;
export function formatThaiDate(
  dateInput: string | Date | null | undefined,
  format?: 'full' | 'short' | 'thai-numerals'
): string;
export function formatThaiDate(
  dateInput: string | Date | null | undefined,
  format: 'full' | 'short' | 'thai-numerals' | 'parts' = 'full'
): string | ThaiDateParts {
  if (!dateInput) return format === 'parts' ? { day: '', month: '', year: '' } : '-';
  
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return format === 'parts' ? { day: '', month: '', year: '' } : '-';

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const beYear = d.getFullYear() + 543;

  if (format === 'parts') {
    return {
      day: String(day),
      month: THAI_MONTHS_FULL[monthIdx],
      year: String(beYear),
      dayThai: toThaiNumerals(day),
      yearThai: toThaiNumerals(beYear),
    };
  }

  if (format === 'thai-numerals') {
    return `${toThaiNumerals(day)} ${THAI_MONTHS_FULL[monthIdx]} ๒๕${toThaiNumerals(String(beYear).slice(-2))}`;
  }

  if (format === 'short') {
    return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${beYear}`;
  }

  return `${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${beYear}`;
}
