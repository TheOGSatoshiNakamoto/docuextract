import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { ModelMode } from './types';
import { MODEL_MAP } from './types';

// Singleton — reused across warm serverless invocations
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface ClaudeCallOptions {
  model: ModelMode;
  systemPrompt: string;
  base64Content: string;
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';
  userText?: string;
  maxTokens?: number;
}

export interface ClaudeCallResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

const DEFAULT_MAX_TOKENS = 4096;

/**
 * Calls the Claude API with a document (image or PDF) and a system prompt.
 * Returns the raw text output from Claude.
 *
 * Retries once with stricter instructions if the response is not valid JSON,
 * since the extraction engine always expects JSON.
 */
export async function callClaude(options: ClaudeCallOptions): Promise<ClaudeCallResult> {
  const {
    model,
    systemPrompt,
    base64Content,
    mediaType,
    userText = 'Extract all structured data from this document. Return ONLY valid JSON.',
    maxTokens = DEFAULT_MAX_TOKENS,
  } = options;

  const modelId = MODEL_MAP[model];
  const client = getClient();

  const userContent = buildUserContent(base64Content, mediaType, userText);

  const firstResponse = await client.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const firstText = extractText(firstResponse);
  const firstUsage = {
    inputTokens: firstResponse.usage.input_tokens,
    outputTokens: firstResponse.usage.output_tokens,
  };

  if (isValidJson(firstText)) {
    return { text: firstText, ...firstUsage };
  }

  // Response is not valid JSON — retry with stricter follow-up
  console.warn(JSON.stringify({
    level: 'warn',
    message: 'Claude returned non-JSON output, retrying',
    model: modelId,
    preview: firstText.slice(0, 200),
  }));

  const retryResponse = await client.messages.create({
    model: modelId,
    max_tokens: DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userContent },
      { role: 'assistant', content: firstText },
      {
        role: 'user',
        content:
          'Your previous response was not valid JSON. ' +
          'Return ONLY a valid JSON object. ' +
          'Start with { and end with }. ' +
          'No markdown fences, no backticks, no explanatory text.',
      },
    ],
  });

  const retryText = extractText(retryResponse);

  return {
    text: retryText,
    inputTokens: firstUsage.inputTokens + retryResponse.usage.input_tokens,
    outputTokens: firstUsage.outputTokens + retryResponse.usage.output_tokens,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUserContent(
  base64Content: string,
  mediaType: string,
  userText: string,
): Anthropic.ContentBlockParam[] {
  const textBlock: Anthropic.TextBlockParam = { type: 'text', text: userText };

  if (mediaType === 'application/pdf') {
    const pdfBlock: Anthropic.DocumentBlockParam = {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: base64Content,
      },
    };
    return [pdfBlock, textBlock];
  }

  const imageBlock: Anthropic.ImageBlockParam = {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
      data: base64Content,
    },
  };
  return [imageBlock, textBlock];
}

function extractText(response: Anthropic.Message): string {
  const block = response.content[0];
  if (!block || block.type !== 'text') return '';
  return block.text.trim();
}

function isValidJson(text: string): boolean {
  try {
    JSON.parse(cleanJsonText(text));
    return true;
  } catch {
    return false;
  }
}

/**
 * Strips markdown code fences if Claude wraps its output despite instructions.
 * e.g. ```json\n{...}\n``` → {...}
 */
export function cleanJsonText(text: string): string {
  const fenced = text.match(/^```(?:json)?\s*([\s\S]+?)\s*```$/);
  if (fenced) return fenced[1]!;
  return text;
}
