import 'server-only';
import type { DocumentType } from '../types';

export interface PostProcessResult {
  data: Record<string, unknown>;
  confidence: number;
}

/**
 * Post-processes raw extraction data:
 * - Normalizes date strings to ISO 8601 where recognizable
 * - Computes a confidence score based on key-field completeness
 */
export function postProcess(
  type: DocumentType,
  data: Record<string, unknown>,
): PostProcessResult {
  const normalized = deepNormalizeDates(data) as Record<string, unknown>;
  const confidence = computeConfidence(type, normalized);
  return { data: normalized, confidence };
}

// ─── Date normalization ───────────────────────────────────────────────────────

// Field-name patterns that indicate a date value
const DATE_KEY_RE = /date|_at$|_on$|period/i;

type DateFormatter = (m: RegExpMatchArray) => string;

const DATE_PATTERNS: Array<[RegExp, DateFormatter]> = [
  // Already ISO: YYYY-MM-DD — pass through
  [/^(\d{4})-(\d{2})-(\d{2})$/, (m) => m[0]!],
  // MM/DD/YYYY or MM-DD-YYYY
  [/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/, (m) => `${m[3]}-${pad(m[1]!)}-${pad(m[2]!)}`],
  // YYYY/MM/DD
  [/^(\d{4})\/(\d{2})\/(\d{2})$/, (m) => `${m[1]}-${m[2]}-${m[3]}`],
  // "January 15, 2024" or "Jan 15 2024"
  [/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/, (m) => monthNameToIso(m[1]!, m[2]!, m[3]!)],
  // "15 January 2024" or "15 Jan 2024"
  [/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/, (m) => monthNameToIso(m[2]!, m[1]!, m[3]!)],
];

function tryNormalizeDate(value: string): string {
  const trimmed = value.trim();
  for (const [re, fmt] of DATE_PATTERNS) {
    const m = trimmed.match(re);
    if (m) return fmt(m);
  }
  return value;
}

function deepNormalizeDates(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepNormalizeDates);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === 'string' && DATE_KEY_RE.test(key)) {
      result[key] = tryNormalizeDate(value);
    } else {
      result[key] = deepNormalizeDates(value);
    }
  }
  return result;
}

function pad(n: string): string {
  return n.padStart(2, '0');
}

const MONTH_NAMES: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function monthNameToIso(monthName: string, day: string, year: string): string {
  const month = MONTH_NAMES[monthName.toLowerCase()];
  if (!month) return `${year}-01-${pad(day)}`; // fallback: assume January
  return `${year}-${month}-${pad(day)}`;
}

// ─── Confidence scoring ───────────────────────────────────────────────────────

// Key fields per type — having these populated drives confidence up
const KEY_FIELDS: Partial<Record<DocumentType, string[]>> = {
  invoice:        ['vendor', 'invoice_number', 'date', 'total', 'line_items'],
  receipt:        ['merchant', 'date', 'total', 'items'],
  bank_statement: ['bank_name', 'account_number_last_four', 'opening_balance', 'closing_balance'],
  resume:         ['name', 'email', 'work_experience', 'skills'],
  contract:       ['parties', 'date', 'contract_type'],
  form:           ['form_title', 'fields'],
  id_document:    ['full_name', 'document_number', 'expiry_date'],
};

function computeConfidence(type: DocumentType, data: Record<string, unknown>): number {
  const keys = KEY_FIELDS[type];
  if (!keys || keys.length === 0) return 0.7; // unknown / generic

  let filled = 0;
  for (const key of keys) {
    const val = data[key];
    if (val === null || val === undefined) continue;
    if (Array.isArray(val) ? val.length > 0 : true) filled++;
  }

  // Scale from 0.5 (any JSON returned) to 1.0 (all key fields populated)
  const ratio = filled / keys.length;
  return Math.round((0.5 + ratio * 0.5) * 100) / 100;
}
