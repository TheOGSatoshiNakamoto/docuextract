import { callClaude, cleanJsonText } from '../claude.js';
import type { DocumentType, ProcessedDocument } from '../types.js';

const VALID_TYPES: DocumentType[] = [
  'invoice', 'receipt', 'bank_statement', 'resume',
  'contract', 'form', 'id_document', 'unknown',
];

const DETECT_SYSTEM_PROMPT = `You are an expert document classifier.

Analyze the document and classify it into exactly one of these types:
- invoice: Bills, invoices, purchase orders, pro-forma invoices
- receipt: Store receipts, transaction receipts, payment confirmations
- bank_statement: Bank statements, financial account statements, credit card statements
- resume: Resumes, CVs, curriculum vitae
- contract: Legal contracts, agreements, NDAs, leases, terms of service
- form: Filled forms, applications, questionnaires, surveys
- id_document: Passports, driver's licenses, national ID cards, visas
- unknown: Cannot be confidently classified into any of the above

Return ONLY a JSON object with this exact structure:
{ "type": "<one of the types above>", "confidence": <0.0 to 1.0> }

No markdown, no backticks, no explanation.`;

export interface DetectionResult {
  type: DocumentType;
  confidence: number;
}

/**
 * Classifies a document's type using Claude.
 * Falls back to { type: 'unknown', confidence: 0 } on any error.
 */
export async function detectDocumentType(doc: ProcessedDocument): Promise<DetectionResult> {
  try {
    const result = await callClaude({
      model: 'fast', // Always use the fast model for detection
      systemPrompt: DETECT_SYSTEM_PROMPT,
      base64Content: doc.base64Content,
      mediaType: doc.mimeType,
      userText: 'Classify this document.',
      maxTokens: 128,
    });

    const parsed = JSON.parse(cleanJsonText(result.text)) as {
      type: unknown;
      confidence: unknown;
    };

    const type: DocumentType =
      typeof parsed.type === 'string' && VALID_TYPES.includes(parsed.type as DocumentType)
        ? (parsed.type as DocumentType)
        : 'unknown';

    const confidence: number =
      typeof parsed.confidence === 'number'
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.5;

    return { type, confidence };
  } catch {
    return { type: 'unknown', confidence: 0 };
  }
}
