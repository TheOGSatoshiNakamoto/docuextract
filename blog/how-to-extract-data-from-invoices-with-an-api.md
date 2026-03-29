---
title: "How to Extract Data from Invoices with an API (2026 Guide)"
description: "Learn how to automatically extract structured data from invoices using a document extraction API. Skip templates and training — get JSON back in seconds with a single API call."
slug: how-to-extract-data-from-invoices-with-an-api
date: 2026-03-29
keywords: ["invoice extraction API", "extract data from invoice", "invoice OCR API", "invoice parsing API", "automated invoice processing"]
---

# How to Extract Data from Invoices with an API (2026 Guide)

Every accounting tool, expense tracker, and accounts payable system has the same problem: invoices arrive as PDFs and images, but your database needs structured data. Vendor name, invoice number, line items, totals — it all has to get out of that document and into your system somehow.

The manual approach takes your team hours per week. Template-based OCR tools break the moment a vendor changes their layout. And training a custom ML model is a multi-month project that most teams can't afford.

In 2026, there's a better way: a document extraction API that reads any invoice and returns clean JSON in seconds, with no templates and no training required.

This guide shows you exactly how to do it.

---

## The Problem with Manual Invoice Processing

Before we get to the solution, it's worth understanding why invoice extraction is hard.

**Invoices have no standard format.** A SaaS subscription invoice from Stripe looks nothing like a contractor invoice from a freelancer. Both look nothing like a wholesale invoice from a supplier. Every vendor has their own layout, font, table structure, and field names.

**Template-based tools don't scale.** Tools like Docparser and Parseur require you to define extraction rules for each document layout. That works when you have 5 vendors. It breaks when you have 50, or when any vendor updates their template.

**The cost of getting it wrong is high.** A missed line item or a misread total can cause payment errors, audit failures, or reconciliation nightmares.

What you actually need is a system that understands document *intent* — not just pixel positions.

---

## What a Document Extraction API Does

A document extraction API like DocuExtract uses a large language model to read and understand the document the same way a human would. You send the invoice (as a base64-encoded image, PDF, or a URL), and the API returns structured JSON.

No templates. No training. No configuration.

Here's what the output looks like for a typical invoice:

```json
{
  "data": {
    "vendor": {
      "name": "Acme Software Inc.",
      "address": "123 Market St, San Francisco, CA 94105",
      "email": "billing@acme.com"
    },
    "invoice_number": "INV-2026-00847",
    "invoice_date": "2026-03-15",
    "due_date": "2026-04-14",
    "line_items": [
      {
        "description": "Pro Plan — March 2026",
        "quantity": 1,
        "unit_price": 99.00,
        "total": 99.00
      },
      {
        "description": "Additional seats (3 × $25)",
        "quantity": 3,
        "unit_price": 25.00,
        "total": 75.00
      }
    ],
    "subtotal": 174.00,
    "tax": 15.66,
    "total": 189.66,
    "currency": "USD",
    "payment_terms": "Net 30"
  },
  "metadata": {
    "type": "invoice",
    "confidence": 0.97,
    "model": "claude-haiku-4-5-20251001",
    "processing_time_ms": 1243
  }
}
```

Every field is normalized: dates are ISO 8601, currency amounts are floats, and a confidence score tells you how certain the model is about each extraction.

---

## Getting Started in 5 Minutes

### Step 1: Get an API key

Sign up at [docuextract.dev](https://docuextract.dev) and grab your API key from the dashboard. Free tier includes 100 extractions/month — enough to build and test your integration.

### Step 2: Make your first extraction call

Here's the simplest possible call using curl:

```bash
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dex_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "https://example.com/invoices/invoice-march-2026.pdf",
    "type": "invoice"
  }'
```

That's it. The `type` field is optional — if you omit it, the API will detect the document type automatically.

### Step 3: Handle the response in your application

Here's a complete JavaScript example that extracts an invoice and saves it to your database:

```javascript
const DOCUEXTRACT_API_KEY = process.env.DOCUEXTRACT_API_KEY;

async function processInvoice(invoiceUrl) {
  const response = await fetch('https://docuextract.dev/v1/extract', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DOCUEXTRACT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document: invoiceUrl,
      type: 'invoice',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Extraction failed: ${error.error.message}`);
  }

  const { data, metadata } = await response.json();

  console.log(`Extracted invoice ${data.invoice_number} from ${data.vendor.name}`);
  console.log(`Total: ${data.currency} ${data.total}`);
  console.log(`Confidence: ${(metadata.confidence * 100).toFixed(1)}%`);

  // Save to your database
  await db.invoices.create({
    vendor_name: data.vendor.name,
    invoice_number: data.invoice_number,
    invoice_date: data.invoice_date,
    due_date: data.due_date,
    total_amount: data.total,
    currency: data.currency,
    line_items: data.line_items,
    raw_extraction: data,
  });

  return data;
}
```

### Step 4: Handle uploaded files (base64)

If your users upload invoice files directly, encode the file as base64:

```javascript
import fs from 'fs';

async function processUploadedInvoice(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');

  const response = await fetch('https://docuextract.dev/v1/extract', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DOCUEXTRACT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document: base64,
      type: 'invoice',
    }),
  });

  return response.json();
}
```

Supported formats: PDF, PNG, JPG, WEBP. Maximum file size: 10MB.

---

## Improving Accuracy with Custom Schemas

By default, DocuExtract returns a standard invoice schema. If your workflow needs specific fields — like a purchase order number, a cost center code, or a project reference — you can define a custom schema:

```javascript
const response = await fetch('https://docuextract.dev/v1/extract', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DOCUEXTRACT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document: invoiceUrl,
    type: 'invoice',
    schema: {
      vendor_name: 'string',
      invoice_number: 'string',
      po_number: 'string | null',        // Your custom field
      cost_center: 'string | null',      // Your custom field
      total: 'number',
      currency: 'string',
      due_date: 'string',
    },
  }),
});
```

The model will extract the standard fields plus your custom ones, returning `null` for any field it can't find in the document.

---

## Using the "Accurate" Mode for Complex Invoices

The default extraction model (Haiku) handles 90%+ of invoices correctly. For complex multi-page invoices, invoices with dense tables, or documents in non-English languages, use `"model": "accurate"` to switch to the more powerful Sonnet model:

```javascript
body: JSON.stringify({
  document: invoiceUrl,
  type: 'invoice',
  model: 'accurate',  // Uses Claude Sonnet 4.6 instead of Haiku
}),
```

Accurate mode costs more per call but produces higher confidence scores on difficult documents.

---

## What to Build With This

Once you have reliable invoice data extraction, a whole category of automation becomes possible:

- **Accounts payable automation** — route invoices to approvers, match POs automatically, schedule payments
- **Expense tracking** — let employees photograph receipts and invoices; sync to accounting software automatically
- **Vendor analysis** — aggregate spend by vendor, category, or month without manual data entry
- **Audit preparation** — build a searchable database of every invoice your company has received
- **ERP integration** — push extracted data directly into QuickBooks, Xero, or SAP

---

## Next Steps

The free tier at [docuextract.dev](https://docuextract.dev) gives you 100 extractions to build and test your integration. The [interactive playground](https://docuextract.dev/playground) lets you try it with your own invoices before writing a single line of code.

If you need more than 100 extractions/month, the Starter plan at $49/month covers 2,500 extractions — enough for most small and medium businesses.

The full API reference is at [docuextract.dev/docs](https://docuextract.dev/docs).
