// Core domain types for DocuExtract API

// ─── Plans ───────────────────────────────────────────────────────────────────

export type Plan = 'free' | 'starter' | 'pro' | 'scale';

export const PLAN_LIMITS: Record<Plan, { perMinute: number; perMonth: number }> = {
  free:    { perMinute: 10,  perMonth: 100 },
  starter: { perMinute: 30,  perMonth: 2500 },
  pro:     { perMinute: 60,  perMonth: 10000 },
  scale:   { perMinute: 120, perMonth: 50000 },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  api_key: string;
  api_key_hash: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

// ─── Document Types ───────────────────────────────────────────────────────────

export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'contract'
  | 'form'
  | 'resume'
  | 'bank_statement'
  | 'id_document'
  | 'unknown';

export type ModelMode = 'fast' | 'accurate';

// Maps to Claude model IDs
export const MODEL_MAP: Record<ModelMode, string> = {
  fast:     'claude-haiku-4-5-20251001',
  accurate: 'claude-sonnet-4-6',
};

// ─── API Request / Response ───────────────────────────────────────────────────

export interface ExtractRequest {
  document: string;          // base64-encoded content or URL
  type?: DocumentType;       // optional hint; auto-detected if omitted
  schema?: Record<string, unknown>; // optional custom extraction schema
  model?: ModelMode;         // defaults to 'fast'
}

export interface DetectRequest {
  document: string;          // base64-encoded content or URL
}

export interface ExtractResponse {
  data: Record<string, unknown>;
  confidence: number;        // 0–1 overall confidence score
  type: DocumentType;
  processing_time_ms: number;
  model_used: string;
}

export interface DetectResponse {
  type: DocumentType;
  confidence: number;
}

export interface UsageResponse {
  used: number;
  limit: number;
  plan: Plan;
  period_end: string;        // ISO date
}

export interface HealthResponse {
  status: 'ok';
  version: string;
}

// ─── Internal Processing ──────────────────────────────────────────────────────

export interface ProcessedDocument {
  /** How the document was provided */
  source: 'base64' | 'url';
  /** MIME type detected */
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';
  /** Base64 content (fetched from URL if needed) */
  base64Content: string;
  /** File size in bytes */
  sizeBytes: number;
}

export interface ExtractionResult {
  data: Record<string, unknown>;
  rawResponse: string;
  inputTokens: number;
  outputTokens: number;
  processingTimeMs: number;
}

export interface ConfidenceResult {
  overall: number;
  perField: Record<string, number>;
}

// ─── API Usage Tracking ───────────────────────────────────────────────────────

export type RequestStatus = 'success' | 'error' | 'rate_limited';

export interface UsageRecord {
  user_id: string;
  endpoint: string;
  document_type: DocumentType | null;
  model_used: string;
  input_tokens: number | null;
  output_tokens: number | null;
  processing_time_ms: number | null;
  confidence_score: number | null;
  status: RequestStatus;
  error_message: string | null;
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  limitMinute: number;
  remainingMinute: number;
  limitMonth: number;
  remainingMonth: number;
  resetMinuteAt: string;    // ISO datetime
  resetMonthAt: string;     // ISO datetime
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export type ErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'invalid_request'
  | 'file_too_large'
  | 'unsupported_format'
  | 'extraction_failed'
  | 'internal_error';

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}
