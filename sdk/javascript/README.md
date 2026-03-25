# docuextract

Official JavaScript/TypeScript SDK for the [DocuExtract API](https://docuextract-azure.vercel.app/docs).

Send a document, get structured JSON back. No templates. No training. Works in 2 minutes.

## Installation

```bash
npm install docuextract
# or
yarn add docuextract
# or
pnpm add docuextract
```

## Quick Start

```typescript
import DocuExtract from 'docuextract';

const dex = new DocuExtract('dex_live_YOUR_API_KEY');

// Extract from a URL
const result = await dex.extract('https://example.com/invoice.pdf', {
  type: 'invoice',
});
console.log(result.data);
// {
//   vendor_name: "Acme Corp",
//   invoice_number: "INV-2024-0847",
//   total_amount: 1250.00,
//   currency: "USD",
//   line_items: [...]
// }

console.log(result.metadata.confidence); // 0.96
```

## Usage

### Initialize

```typescript
import DocuExtract from 'docuextract';

const dex = new DocuExtract(process.env.DOCUEXTRACT_KEY!);
```

### Extract structured data

```typescript
// From a URL
const result = await dex.extract('https://example.com/receipt.jpg', {
  type: 'receipt',
});

// From a local file (Node.js)
import fs from 'fs';
const buffer = fs.readFileSync('contract.pdf');
const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
const result = await dex.extract(base64, { type: 'contract' });

// Use accurate mode for complex or multi-page documents
const result = await dex.extract(base64, { model: 'accurate' });

// Custom schema — extract exactly what you need
const result = await dex.extract(base64, {
  schema: {
    party_names: 'array of party names in this contract',
    effective_date: 'contract start date in ISO format',
    governing_law: 'jurisdiction for disputes',
  },
});
```

### Detect document type

```typescript
const { type, confidence } = await dex.detect('https://example.com/doc.pdf');
console.log(type);       // "invoice"
console.log(confidence); // 0.98
```

### Check usage

```typescript
const stats = await dex.usage();
console.log(`${stats.used} / ${stats.limit} extractions used this month`);
console.log(`Plan: ${stats.plan}, renews: ${stats.period_end}`);
```

### Error handling

```typescript
import DocuExtract, { DocuExtractAPIError } from 'docuextract';

try {
  const result = await dex.extract(document);
} catch (err) {
  if (err instanceof DocuExtractAPIError) {
    console.error(`${err.error}: ${err.message} (HTTP ${err.status})`);

    if (err.status === 429) {
      // Rate limited — back off and retry
    }
  }
}
```

## TypeScript

The SDK ships with full TypeScript types. No separate `@types` package needed.

```typescript
import DocuExtract, { ExtractResult, DocumentType, UsageResult } from 'docuextract';

// Type your extracted data
interface Invoice {
  vendor_name: string;
  total_amount: number;
  invoice_number: string;
}

const result: ExtractResult<Invoice> = await dex.extract<Invoice>(document, {
  type: 'invoice',
});
// result.data is fully typed as Invoice
```

## Document Types

| Type | Description |
|------|-------------|
| `invoice` | Vendor invoices and billing statements |
| `receipt` | Purchase receipts |
| `bank_statement` | Bank and credit card statements |
| `resume` | CVs and resumes |
| `contract` | Legal agreements |
| `form` | Filled forms and applications |
| `id_document` | ID cards, passports, driver's licenses |
| `unknown` | Auto-detected fallback |

## API Reference

Full API documentation: [docuextract-azure.vercel.app/docs](https://docuextract-azure.vercel.app/docs)

## License

MIT
