import { type NextRequest, NextResponse } from 'next/server';
import { processDocumentInput, ValidationError } from '@/lib/documents/input';
import { detectDocumentType } from '@/lib/documents/detect';
import { extractDocument, ExtractionError } from '@/lib/extraction/engine';
import type { DocumentType, ModelMode } from '@/lib/types';

// Playground: no auth required, rate limit enforced client-side via localStorage.
// Server-side protection: tight body size limit + Vercel's built-in DDoS protection.

export const runtime = 'nodejs';
export const maxDuration = 30;

const VALID_TYPES = new Set<DocumentType>([
  'invoice', 'receipt', 'bank_statement', 'resume',
  'contract', 'form', 'id_document', 'unknown',
]);

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { document?: string; type?: string; model?: string };
  try {
    body = await request.json() as { document?: string; type?: string; model?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_request', message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.document) {
    return NextResponse.json({ error: 'invalid_request', message: 'Missing required field: document' }, { status: 400 });
  }

  const modelMode: ModelMode = body.model === 'accurate' ? 'accurate' : 'fast';
  const typeHint = (body.type && VALID_TYPES.has(body.type as DocumentType))
    ? body.type as DocumentType
    : undefined;

  let processed;
  try {
    processed = await processDocumentInput(body.document);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'internal_error', message: 'Failed to process document' }, { status: 500 });
  }

  let documentType: DocumentType;
  try {
    documentType = typeHint ?? (await detectDocumentType(processed)).type;
  } catch {
    documentType = 'unknown';
  }

  let result;
  try {
    result = await extractDocument(processed, { model: modelMode, type: documentType });
  } catch (err) {
    if (err instanceof ExtractionError) {
      return NextResponse.json({ error: 'extraction_failed', message: 'Extraction failed. Try a clearer image or different document.' }, { status: 422 });
    }
    return NextResponse.json({ error: 'internal_error', message: 'Unexpected error during extraction.' }, { status: 500 });
  }

  return NextResponse.json({
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
