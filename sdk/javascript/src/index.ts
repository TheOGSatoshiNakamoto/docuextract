const DEFAULT_BASE_URL = 'https://docuextract-azure.vercel.app/v1';

// ── Types ──────────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'bank_statement'
  | 'resume'
  | 'contract'
  | 'form'
  | 'id_document'
  | 'unknown';

export type ModelMode = 'fast' | 'accurate';

export interface ExtractOptions {
  /** Document type hint. Auto-detected if omitted. */
  type?: DocumentType;
  /** Use 'accurate' (Claude Sonnet) for complex or multi-page documents. Defaults to 'fast' (Claude Haiku). */
  model?: ModelMode;
  /** Custom schema: keys are field names, values are descriptions of what to extract. */
  schema?: Record<string, string>;
}

export interface ExtractMetadata {
  type: DocumentType;
  confidence: number;
  model: string;
  processing_time_ms: number;
  page_count: number;
}

export interface ExtractResult<T = Record<string, unknown>> {
  data: T;
  metadata: ExtractMetadata;
}

export interface DetectResult {
  type: DocumentType;
  confidence: number;
}

export interface UsageDayBreakdown {
  date: string;
  count: number;
}

export interface UsageResult {
  used: number;
  limit: number;
  plan: string;
  period_end: string;
  breakdown: UsageDayBreakdown[];
}

export interface DocuExtractError {
  error: string;
  message: string;
  status: number;
}

// ── Error class ────────────────────────────────────────────────────────────────

export class DocuExtractAPIError extends Error {
  readonly error: string;
  readonly status: number;

  constructor({ error, message, status }: DocuExtractError) {
    super(message);
    this.name = 'DocuExtractAPIError';
    this.error = error;
    this.status = status;
  }
}

// ── Client ─────────────────────────────────────────────────────────────────────

export class DocuExtract {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, options?: { baseUrl?: string }) {
    if (!apiKey) throw new Error('DocuExtract: apiKey is required');
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = await res.json() as T | DocuExtractError;

    if (!res.ok) {
      const err = json as DocuExtractError;
      throw new DocuExtractAPIError({
        error: err.error ?? 'unknown_error',
        message: err.message ?? `HTTP ${res.status}`,
        status: res.status,
      });
    }

    return json as T;
  }

  /**
   * Extract structured data from a document.
   * @param document - Base64-encoded document string or a publicly accessible URL.
   * @param options  - Optional type hint, model mode, and custom schema.
   */
  async extract<T = Record<string, unknown>>(
    document: string,
    options?: ExtractOptions,
  ): Promise<ExtractResult<T>> {
    return this.request<ExtractResult<T>>('POST', '/extract', {
      document,
      ...options,
    });
  }

  /**
   * Detect the type of a document without extracting its data.
   * @param document - Base64-encoded document string or a publicly accessible URL.
   */
  async detect(document: string): Promise<DetectResult> {
    return this.request<DetectResult>('POST', '/detect', { document });
  }

  /**
   * Get current usage statistics for the billing period.
   */
  async usage(): Promise<UsageResult> {
    return this.request<UsageResult>('GET', '/usage');
  }
}

export default DocuExtract;
