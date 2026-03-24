# DocuExtract

**Send a document, get JSON back. No templates. No training. Works in 5 minutes.**

DocuExtract is a developer-facing REST API that converts unstructured documents (invoices, receipts, contracts, forms, resumes) into clean, validated JSON using Claude AI.

## Quick Start

```bash
curl -X POST https://api.docuextract.com/v1/extract \
  -H "Authorization: Bearer dex_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "document": "<base64-encoded-pdf-or-image>",
    "type": "invoice"
  }'
```

**Response:**
```json
{
  "data": {
    "invoice_number": "INV-2024-0042",
    "vendor": "Acme Corp",
    "total": 1250.00,
    "currency": "USD",
    "date": "2024-03-15",
    "line_items": [...]
  },
  "confidence": 0.97,
  "type": "invoice",
  "processing_time_ms": 1100
}
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/extract` | Extract structured data from a document |
| `POST` | `/v1/detect` | Detect document type without extraction |
| `GET`  | `/v1/usage` | Get current usage stats |
| `GET`  | `/v1/health` | Health check (no auth required) |

## Pricing

| Plan | Price | Extractions/month |
|------|-------|-------------------|
| Free | $0 | 100 |
| Starter | $49/mo | 2,500 |
| Pro | $99/mo | 10,000 |
| Scale | $249/mo | 50,000 |

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                   # starts vercel dev
```

## Tech Stack

- **Runtime:** Vercel Serverless Functions (Node.js 20)
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Claude API (Haiku 4.5 / Sonnet 4.6)
- **Billing:** Stripe

## License

Private — all rights reserved.
