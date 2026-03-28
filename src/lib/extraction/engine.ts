import 'server-only';
import { callClaude, cleanJsonText } from '../claude';
import { getPromptForType } from './prompts';
import { validateAndNormalizeOutput } from './schemas';
import { postProcess } from './postprocess';
import type { DocumentType, ModelMode, ProcessedDocument } from '../types';
import { MODEL_MAP } from '../types';

export interface ExtractionOptions {
  model: ModelMode;
  type: DocumentType;
  customSchema?: Record<string, unknown> | undefined;
}

export interface ExtractionEngineResult {
  data: Record<string, unknown>;
  confidence: number;
  inputTokens: number;
  outputTokens: number;
  processingTimeMs: number;
  modelUsed: string;
}

export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Core extraction pipeline:
 *   ProcessedDocument → Claude (with specialized prompt) → JSON → post-process → result
 *
 * Throws ExtractionError if Claude's output cannot be parsed as JSON after one retry.
 */
export async function extractDocument(
  doc: ProcessedDocument,
  options: ExtractionOptions,
): Promise<ExtractionEngineResult> {
  const start = Date.now();
  const { model, type, customSchema } = options;

  const systemPrompt = getPromptForType(type, customSchema);

  const claudeResult = await callClaude({
    model,
    systemPrompt,
    base64Content: doc.base64Content,
    mediaType: doc.mimeType,
  });

  // Parse JSON from Claude's response
  let rawData: Record<string, unknown>;
  try {
    rawData = JSON.parse(cleanJsonText(claudeResult.text)) as Record<string, unknown>;
  } catch (err) {
    throw new ExtractionError(
      `Could not parse extraction output as JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Normalize array fields and structural expectations per document type
  const normalized = validateAndNormalizeOutput(type, rawData);

  // Date normalization + confidence scoring
  const { data, confidence } = postProcess(type, normalized);

  return {
    data,
    confidence,
    inputTokens: claudeResult.inputTokens,
    outputTokens: claudeResult.outputTokens,
    processingTimeMs: Date.now() - start,
    modelUsed: MODEL_MAP[model],
  };
}
