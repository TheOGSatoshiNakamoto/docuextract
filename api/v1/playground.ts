import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processDocumentInput, ValidationError } from '../../lib/documents/input.js';
import { detectDocumentType } from '../../lib/documents/detect.js';
import { extractDocument, ExtractionError } from '../../lib/extraction/engine.js';
import type { DocumentType, ModelMode } from '../../lib/types.js';

// Playground: no auth required, lighter rate limit enforced client-side via localStorage.
// Server-side protection: tight body size limit + Vercel's built-in DDoS protection.

const VALID_TYPES = new Set<DocumentType>([
  'invoice', 'receipt', 'bank_statement', 'resume',
  'contract', 'form', 'id_document', 'unknown',
]);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS — playground page is on the same origin but allow direct browser testing too
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST' });
    return;
  }

  const body = req.body as { document?: string; type?: string; model?: string } | undefined;

  if (!body?.document) {
    res.status(400).json({ error: 'invalid_request', message: 'Missing required field: document' });
    return;
  }

  const modelMode: ModelMode = body.model === 'accurate' ? 'accurate' : 'fast';
  const typeHint = (body.type && VALID_TYPES.has(body.type as DocumentType))
    ? body.type as DocumentType
    : undefined;

  // Process document input (base64 or URL)
  let processed;
  try {
    processed = await processDocumentInput(body.document);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.code, message: err.message });
    } else {
      res.status(500).json({ error: 'internal_error', message: 'Failed to process document' });
    }
    return;
  }

  // Detect document type
  let documentType: DocumentType;
  try {
    documentType = typeHint ?? (await detectDocumentType(processed)).type;
  } catch {
    documentType = 'unknown';
  }

  // Extract
  let result;
  try {
    result = await extractDocument(processed, { model: modelMode, type: documentType });
  } catch (err) {
    if (err instanceof ExtractionError) {
      res.status(422).json({ error: 'extraction_failed', message: 'Extraction failed. Try a clearer image or different document.' });
    } else {
      res.status(500).json({ error: 'internal_error', message: 'Unexpected error during extraction.' });
    }
    return;
  }

  res.status(200).json({
    data: result.data,
    metadata: {
      type: documentType,
      confidence: result.confidence,
      model: result.modelUsed,
      processing_time_ms: result.processingTimeMs,
      page_count: 1,
    },
  });
}
