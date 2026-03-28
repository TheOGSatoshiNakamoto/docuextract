import 'server-only';
import type { ProcessedDocument } from '../types';
import {
  stripDataUri,
  detectMimeFromBase64,
  mimeFromContentType,
  isValidBase64,
  checkBodySizeLimit,
  validateDocument,
  ValidationError,
} from './validate';
import type { AllowedMimeType } from './validate';

const URL_FETCH_TIMEOUT_MS = 10_000;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Returns true if the input looks like an HTTP/HTTPS URL.
 */
function isUrl(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

// ─── URL input ────────────────────────────────────────────────────────────────

async function processUrl(url: string): Promise<ProcessedDocument> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ValidationError('invalid_request', `Failed to fetch document from URL: ${msg}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ValidationError('invalid_request', `URL returned HTTP ${response.status}`);
  }

  // Validate MIME type from content-type header before downloading body
  const rawContentType = response.headers.get('content-type') ?? '';
  const mimeType = mimeFromContentType(rawContentType);
  if (!mimeType) {
    throw new ValidationError(
      'unsupported_format',
      `URL content-type '${rawContentType}' is not supported. Allowed: PNG, JPG, WEBP, PDF`,
    );
  }

  const buffer = await drainWithSizeLimit(response, MAX_SIZE_BYTES);
  const base64Content = buffer.toString('base64');

  const doc: ProcessedDocument = {
    source: 'url',
    mimeType,
    base64Content,
    sizeBytes: buffer.length,
  };
  validateDocument(doc);
  return doc;
}

/** Streams the response body into a Buffer, throwing if it exceeds maxBytes. */
async function drainWithSizeLimit(response: Response, maxBytes: number): Promise<Buffer> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ValidationError('invalid_request', 'Could not read response body from URL');
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.length;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new ValidationError('file_too_large', 'Document from URL exceeds the 10 MB size limit');
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

// ─── Base64 input ─────────────────────────────────────────────────────────────

function processBase64(input: string): ProcessedDocument {
  const { base64, declaredMime } = stripDataUri(input);

  checkBodySizeLimit(base64);

  if (!isValidBase64(base64)) {
    throw new ValidationError('invalid_request', 'Invalid base64 encoding');
  }

  // Prefer magic-byte detection; fall back to declared MIME from data URI
  let mimeType: AllowedMimeType | null = detectMimeFromBase64(base64);
  if (!mimeType && declaredMime) {
    mimeType = mimeFromContentType(declaredMime);
  }

  if (!mimeType) {
    throw new ValidationError(
      'unsupported_format',
      'Could not determine file format from base64 content. Supported: PNG, JPG, WEBP, PDF',
    );
  }

  // Approximate decoded byte count (avoid allocating a full Buffer just for size)
  const sizeBytes = Math.floor((base64.length * 3) / 4);

  const doc: ProcessedDocument = {
    source: 'base64',
    mimeType,
    base64Content: base64,
    sizeBytes,
  };
  validateDocument(doc);
  return doc;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Accepts any supported document input — a base64 string (with or without data
 * URI prefix) or an HTTP/HTTPS URL — and returns a normalized ProcessedDocument.
 *
 * Throws ValidationError on any validation failure.
 */
export async function processDocumentInput(input: string): Promise<ProcessedDocument> {
  if (!input || typeof input !== 'string') {
    throw new ValidationError('invalid_request', 'document field is required and must be a string');
  }

  const trimmed = input.trim();
  if (isUrl(trimmed)) {
    return processUrl(trimmed);
  }
  return processBase64(trimmed);
}

export { ValidationError };
