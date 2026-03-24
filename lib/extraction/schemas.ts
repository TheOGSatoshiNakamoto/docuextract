import type { DocumentType } from '../types.js';

/**
 * Validates and normalizes Claude's raw extraction output per document type.
 * Ensures required array fields are always arrays and nested objects are present.
 * Returns a cleaned copy — does not mutate the input.
 */
export function validateAndNormalizeOutput(
  type: DocumentType,
  data: Record<string, unknown>,
): Record<string, unknown> {
  switch (type) {
    case 'invoice':        return normalizeInvoice(data);
    case 'receipt':        return normalizeReceipt(data);
    case 'bank_statement': return normalizeBankStatement(data);
    case 'resume':         return normalizeResume(data);
    case 'contract':       return normalizeContract(data);
    case 'form':           return normalizeForm(data);
    default:               return data;
  }
}

// ─── Type-specific normalizers ────────────────────────────────────────────────

function normalizeInvoice(d: Record<string, unknown>): Record<string, unknown> {
  return {
    ...d,
    vendor:     d['vendor'] ?? null,
    bill_to:    d['bill_to'] ?? null,
    line_items: ensureArray(d['line_items']),
  };
}

function normalizeReceipt(d: Record<string, unknown>): Record<string, unknown> {
  return {
    ...d,
    merchant: d['merchant'] ?? null,
    items:    ensureArray(d['items']),
  };
}

function normalizeBankStatement(d: Record<string, unknown>): Record<string, unknown> {
  return {
    ...d,
    statement_period: d['statement_period'] ?? null,
    transactions:     ensureArray(d['transactions']),
  };
}

function normalizeResume(d: Record<string, unknown>): Record<string, unknown> {
  return {
    ...d,
    work_experience: ensureArray(d['work_experience']),
    education:       ensureArray(d['education']),
    skills:          ensureArray(d['skills']),
    certifications:  ensureArray(d['certifications']),
    languages:       ensureArray(d['languages']),
  };
}

function normalizeContract(d: Record<string, unknown>): Record<string, unknown> {
  return {
    ...d,
    parties:    ensureArray(d['parties']),
    key_terms:  ensureArray(d['key_terms']),
    signatures: ensureArray(d['signatures']),
  };
}

function normalizeForm(d: Record<string, unknown>): Record<string, unknown> {
  return {
    ...d,
    fields:    ensureArray(d['fields']),
    sections:  ensureArray(d['sections']),
    submitter: d['submitter'] ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureArray(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined) return [];
  return [val];
}
