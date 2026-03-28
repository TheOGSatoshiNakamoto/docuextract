import 'server-only';
import type { ProcessedDocument } from '../types';

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
// Vercel free/hobby body limit; base64 is ~4/3 the raw size so effective raw limit ~3.4 MB
const MAX_BODY_BASE64_CHARS = 4.5 * 1024 * 1024;

// Magic-byte prefixes that appear at the start of base64-encoded files
const MIME_SIGNATURES: Array<{ prefix: string; mime: AllowedMimeType }> = [
  { prefix: 'iVBORw0KGgo', mime: 'image/png' },     // PNG
  { prefix: '/9j/',         mime: 'image/jpeg' },    // JPEG
  { prefix: 'UklGR',        mime: 'image/webp' },   // WEBP (RIFF header)
  { prefix: 'JVBERi0',      mime: 'application/pdf' }, // PDF (%PDF-)
];

const CONTENT_TYPE_TO_MIME: Record<string, AllowedMimeType> = {
  'image/png':       'image/png',
  'image/jpeg':      'image/jpeg',
  'image/jpg':       'image/jpeg',
  'image/webp':      'image/webp',
  'application/pdf': 'application/pdf',
};

export class ValidationError extends Error {
  constructor(
    public readonly code: 'file_too_large' | 'unsupported_format' | 'invalid_request',
    message: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Detects MIME type from the start of a base64 string by matching magic bytes.
 */
export function detectMimeFromBase64(base64: string): AllowedMimeType | null {
  for (const { prefix, mime } of MIME_SIGNATURES) {
    if (base64.startsWith(prefix)) return mime;
  }
  return null;
}

/**
 * Maps a content-type header value to an AllowedMimeType, or null if unsupported.
 */
export function mimeFromContentType(contentType: string): AllowedMimeType | null {
  const base = (contentType.split(';')[0] ?? '').trim().toLowerCase();
  return CONTENT_TYPE_TO_MIME[base] ?? null;
}

/**
 * Strips the data URI prefix from a base64 string if present.
 * e.g. "data:image/png;base64,iVBOR…" → { base64: "iVBOR…", declaredMime: "image/png" }
 */
export function stripDataUri(input: string): { base64: string; declaredMime: string | null } {
  const match = input.match(/^data:([^;]+);base64,(.+)$/s);
  if (match && match[1] !== undefined && match[2] !== undefined) {
    return { base64: match[2], declaredMime: match[1] };
  }
  return { base64: input, declaredMime: null };
}

/**
 * Returns true if the string is valid base64 (including URL-safe variants).
 */
export function isValidBase64(str: string): boolean {
  return /^[A-Za-z0-9+/\-_]+=*$/.test(str);
}

/**
 * Throws if the raw base64 string would exceed Vercel's body size limit.
 * Suggests URL upload as the alternative.
 */
export function checkBodySizeLimit(base64: string): void {
  if (base64.length > MAX_BODY_BASE64_CHARS) {
    throw new ValidationError(
      'file_too_large',
      'Document is too large to upload as base64 (max ~3.4 MB encoded). ' +
        'Please host the file at a public URL and pass the URL in the document field instead.',
    );
  }
}

/**
 * Validates a ProcessedDocument against size and format constraints.
 * Throws ValidationError if any check fails.
 */
export function validateDocument(doc: ProcessedDocument): void {
  if (doc.sizeBytes > MAX_SIZE_BYTES) {
    const mb = (doc.sizeBytes / 1024 / 1024).toFixed(1);
    throw new ValidationError('file_too_large', `Document size ${mb} MB exceeds the 10 MB limit`);
  }
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(doc.mimeType)) {
    throw new ValidationError(
      'unsupported_format',
      `Unsupported format: ${doc.mimeType}. Allowed: PNG, JPG, WEBP, PDF`,
    );
  }
}
