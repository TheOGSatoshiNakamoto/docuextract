import type { DocumentType } from '../types.js';

/**
 * Returns the system prompt for the given document type.
 * For 'unknown' or 'generic', an optional custom schema can be injected.
 */
export function getPromptForType(
  type: DocumentType,
  customSchema?: Record<string, unknown>,
): string {
  switch (type) {
    case 'invoice':        return INVOICE_PROMPT;
    case 'receipt':        return RECEIPT_PROMPT;
    case 'bank_statement': return BANK_STATEMENT_PROMPT;
    case 'resume':         return RESUME_PROMPT;
    case 'contract':       return CONTRACT_PROMPT;
    case 'form':           return FORM_PROMPT;
    case 'id_document':    return ID_DOCUMENT_PROMPT;
    default:               return buildGenericPrompt(customSchema);
  }
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const INVOICE_PROMPT = `You are an expert document parser specializing in invoices and billing documents.

Extract all structured data from this invoice and return it as a single JSON object matching this schema exactly:

{
  "vendor": { "name": string|null, "address": string|null, "email": string|null, "phone": string|null, "website": string|null, "tax_id": string|null },
  "invoice_number": string|null,
  "date": string|null,
  "due_date": string|null,
  "currency": string|null,
  "payment_terms": string|null,
  "purchase_order_number": string|null,
  "bill_to": { "name": string|null, "address": string|null, "email": string|null },
  "line_items": [ { "description": string, "quantity": number|null, "unit_price": number|null, "amount": number|null } ],
  "subtotal": number|null,
  "discount": number|null,
  "tax": number|null,
  "tax_rate": string|null,
  "shipping": number|null,
  "total": number|null,
  "amount_paid": number|null,
  "amount_due": number|null,
  "notes": string|null,
  "payment_method": string|null
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- If a field cannot be determined, set it to null. Never omit a field from the schema.
- Dates must be ISO 8601 format: YYYY-MM-DD.
- Monetary values must be numbers (no currency symbols, no commas). E.g. 1234.56 not "$1,234.56".
- currency must be a 3-letter ISO code: "USD", "EUR", "GBP", etc.
- line_items must be an array; use [] if no line items are visible.`;

const RECEIPT_PROMPT = `You are an expert document parser specializing in receipts and purchase records.

Extract all structured data from this receipt and return it as a single JSON object matching this schema exactly:

{
  "merchant": { "name": string|null, "address": string|null, "phone": string|null, "website": string|null, "tax_id": string|null },
  "receipt_number": string|null,
  "date": string|null,
  "time": string|null,
  "currency": string|null,
  "items": [ { "name": string, "quantity": number|null, "unit_price": number|null, "price": number|null } ],
  "subtotal": number|null,
  "discount": number|null,
  "tax": number|null,
  "tip": number|null,
  "total": number|null,
  "payment_method": string|null,
  "card_last_four": string|null,
  "cashier": string|null,
  "store_number": string|null,
  "transaction_id": string|null
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- If a field cannot be determined, set it to null.
- Dates must be ISO 8601: YYYY-MM-DD. Time must be HH:MM (24-hour).
- Monetary values must be numbers (no symbols or commas).
- currency should be a 3-letter ISO code: "USD", "EUR", etc.
- items must be an array; use [] if no items are visible.`;

const BANK_STATEMENT_PROMPT = `You are an expert document parser specializing in bank and financial statements.

Extract all structured data from this bank statement and return it as a single JSON object matching this schema exactly:

{
  "bank_name": string|null,
  "account_holder": string|null,
  "account_number_last_four": string|null,
  "account_type": string|null,
  "statement_period": { "from": string|null, "to": string|null },
  "currency": string|null,
  "opening_balance": number|null,
  "closing_balance": number|null,
  "total_credits": number|null,
  "total_debits": number|null,
  "transactions": [
    {
      "date": string,
      "description": string,
      "amount": number,
      "type": "credit"|"debit",
      "balance": number|null,
      "reference": string|null
    }
  ]
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- If a field cannot be determined, set it to null.
- Dates must be ISO 8601: YYYY-MM-DD.
- Monetary values must be numbers (no symbols). Use positive values for both credits and debits; the type field distinguishes them.
- Only include the last 4 digits of account numbers.
- transactions must be an array; use [] if no transactions are visible.`;

const RESUME_PROMPT = `You are an expert document parser specializing in resumes and CVs.

Extract all structured data from this resume/CV and return it as a single JSON object matching this schema exactly:

{
  "name": string|null,
  "email": string|null,
  "phone": string|null,
  "location": string|null,
  "linkedin": string|null,
  "website": string|null,
  "github": string|null,
  "summary": string|null,
  "work_experience": [
    {
      "company": string,
      "title": string,
      "location": string|null,
      "start_date": string|null,
      "end_date": string|null,
      "current": boolean,
      "description": string|null,
      "highlights": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string|null,
      "field": string|null,
      "location": string|null,
      "start_date": string|null,
      "end_date": string|null,
      "gpa": string|null
    }
  ],
  "skills": string[],
  "certifications": [ { "name": string, "issuer": string|null, "date": string|null } ],
  "languages": string[]
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- If a field cannot be determined, set it to null.
- Dates should be YYYY-MM when only month/year is visible, or YYYY-MM-DD when full date is shown.
- Set current=true for roles with no end date or where "present"/"current" is indicated.
- All array fields (work_experience, education, skills, etc.) must be arrays; use [] if empty.`;

const CONTRACT_PROMPT = `You are an expert document parser specializing in legal contracts and agreements.

Extract all structured data from this contract and return it as a single JSON object matching this schema exactly:

{
  "contract_type": string|null,
  "title": string|null,
  "date": string|null,
  "effective_date": string|null,
  "expiration_date": string|null,
  "parties": [ { "role": string, "name": string, "address": string|null, "email": string|null } ],
  "governing_law": string|null,
  "jurisdiction": string|null,
  "payment_terms": string|null,
  "contract_value": number|null,
  "currency": string|null,
  "key_terms": string[],
  "termination_notice_days": number|null,
  "auto_renewal": boolean|null,
  "confidentiality": boolean|null,
  "non_compete": boolean|null,
  "signatures": [ { "party": string, "signed": boolean, "date": string|null } ]
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- If a field cannot be determined, set it to null.
- Dates must be ISO 8601: YYYY-MM-DD.
- key_terms should list the most important obligations and conditions (max 10 items).
- parties and signatures must be arrays; use [] if none are identified.`;

const FORM_PROMPT = `You are an expert document parser specializing in forms and questionnaires.

Extract all structured data from this form and return it as a single JSON object matching this schema exactly:

{
  "form_title": string|null,
  "form_number": string|null,
  "date": string|null,
  "fields": [
    { "label": string, "value": string|null, "type": "text"|"checkbox"|"radio"|"date"|"signature"|"other" }
  ],
  "sections": [
    {
      "title": string|null,
      "fields": [ { "label": string, "value": string|null, "type": "text"|"checkbox"|"radio"|"date"|"signature"|"other" } ]
    }
  ],
  "submitter": { "name": string|null, "signature_present": boolean, "date": string|null }
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- Capture ALL fields visible in the form, including empty ones (value: null).
- For checkboxes: use "true", "false", or null as the value string.
- Dates must be ISO 8601: YYYY-MM-DD.
- fields and sections must be arrays; use [] if none are found.`;

const ID_DOCUMENT_PROMPT = `You are an expert document parser specializing in identity documents (passports, driver's licenses, national IDs).

Extract all structured data from this identity document and return it as a single JSON object matching this schema exactly:

{
  "document_type": string|null,
  "document_number": string|null,
  "country": string|null,
  "full_name": string|null,
  "first_name": string|null,
  "last_name": string|null,
  "date_of_birth": string|null,
  "gender": string|null,
  "nationality": string|null,
  "place_of_birth": string|null,
  "issue_date": string|null,
  "expiry_date": string|null,
  "issuing_authority": string|null,
  "address": string|null,
  "mrz": string|null
}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- If a field cannot be determined, set it to null.
- Dates must be ISO 8601: YYYY-MM-DD.
- country should be a 2-letter ISO country code when possible (e.g., "US", "GB", "DE").
- mrz is the Machine Readable Zone text, if present.`;

function buildGenericPrompt(customSchema?: Record<string, unknown>): string {
  if (customSchema) {
    return `You are an expert document parser.

Extract data from this document according to the following JSON schema and return a single object matching it exactly:

${JSON.stringify(customSchema, null, 2)}

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- Follow the schema structure exactly. Do not add or remove top-level fields.
- If a field cannot be determined, set it to null.
- Dates must be ISO 8601: YYYY-MM-DD.
- Monetary values must be numbers without currency symbols.`;
  }

  return `You are an expert document parser.

Extract all structured data visible in this document and return it as a single JSON object. Capture every meaningful field, label, value, date, amount, name, and identifier you can find.

Rules:
- Return ONLY the JSON object. No markdown fences, no backticks, no explanation.
- Use descriptive snake_case keys.
- If a field cannot be determined, set it to null.
- Dates must be ISO 8601: YYYY-MM-DD.
- Monetary values must be numbers without currency symbols.`;
}
