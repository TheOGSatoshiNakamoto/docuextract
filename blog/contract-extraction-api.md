---
title: "I Built a Contract Search Engine for 180 Rental Units in a Weekend"
description: "A developer at a property management company uses a contract extraction API to index 400+ lease and vendor contracts, catching 3 auto-renewals before they triggered."
slug: contract-extraction-api
date: 2026-04-12
keywords: ["contract extraction API", "legal document parsing", "contract clause extraction", "contract analysis API", "PDF contract parser"]
---

# I Built a Contract Search Engine for 180 Rental Units in a Weekend

I'm Rafael. I write backend code for a property management company that handles 180 rental units across Austin, Denver, and Phoenix. My job title says "software developer" but most weeks I'm more of a plumber — fixing data pipelines, wiring up integrations, putting out fires.

The fire this story is about was a $14,000 fire. A vendor contract auto-renewed because nobody knew it was about to expire. My boss lost it. Not at me — at the situation. We had no system for tracking contract terms. Every lease, vendor agreement, and service contract was a PDF sitting in a folder on a shared drive. Finding anything meant opening files one by one and reading.

He asked me to fix it. I said I'd try. I did not expect to finish in a weekend.

---

## The Filing Cabinet Problem

Here's what we were dealing with:

- **180 residential leases** (renewed annually, staggered dates)
- **~90 vendor contracts** (landscaping, HVAC, plumbing, pest control, elevator maintenance, security)
- **~60 service agreements** (insurance, property management sub-contracts, HOA agreements)
- **~40 miscellaneous** (partnership agreements, equipment leases, utility contracts)

That's roughly 370 active PDFs. Some are 2 pages. Some are 40. All of them contain dates, parties, dollar amounts, and clauses that matter — termination windows, auto-renewal terms, liability caps, insurance requirements.

When our operations manager needed to know "which vendor contracts expire before July," she opened a shared drive, navigated to the vendor folder, and started clicking. It took her an afternoon. She found 8 contracts. There were actually 12. She missed 4, and 3 of those had auto-renewal clauses with 30-day notice windows. One of them was the $14,000 HVAC maintenance contract that renewed without anyone noticing.

This is not a technology problem. It's a "nobody extracted the important information from these documents" problem.

---

## What I Actually Needed

I didn't need a contract management platform. Those start at $10,000/year for the enterprise ones, and they come with onboarding calls, implementation timelines, and feature sets designed for legal departments at companies 50 times our size. We're 22 people. I needed:

1. **Extract key data from each contract PDF** — parties, dates, dollar amounts, key clauses
2. **Store it in a searchable database**
3. **Build a simple UI** so our ops team can query it

I already had Supabase for our tenant portal database. I could build the search UI in a day. The hard part was step 1: getting structured data out of 370 PDFs.

I found DocuExtract through a blog post about [invoice extraction](/blog/how-to-extract-data-from-invoices-with-an-api). The API handles more than invoices — their [use cases page](/use-cases) lists contracts specifically. I opened the [playground](/playground) and uploaded one of our vendor contracts.

---

## First Test: A Landscaping Contract

I dropped a 6-page landscaping maintenance contract into the DocuExtract playground. The contract was dense — boilerplate legal language, a schedule of services, pricing table, and a termination clause buried on page 4.

The response came back in about 3 seconds:

```json
{
  "data": {
    "document_type": "contract",
    "parties": [
      {
        "name": "Greenfield Property Management LLC",
        "role": "client"
      },
      {
        "name": "Southwest Landscape Solutions",
        "role": "service_provider"
      }
    ],
    "effective_date": "2025-03-01",
    "expiration_date": "2026-02-28",
    "auto_renewal": true,
    "renewal_terms": "Automatically renews for successive 12-month periods unless either party provides 60 days written notice prior to expiration.",
    "notice_period_days": 60,
    "total_value": {
      "amount": 42000,
      "currency": "USD",
      "period": "annual"
    },
    "key_clauses": [
      {
        "name": "Termination for Convenience",
        "summary": "Either party may terminate with 60 days written notice. Client responsible for payment of services rendered through termination date."
      },
      {
        "name": "Insurance Requirements",
        "summary": "Service provider must maintain general liability insurance of at least $1,000,000 per occurrence and $2,000,000 aggregate."
      },
      {
        "name": "Indemnification",
        "summary": "Service provider indemnifies client against claims arising from provider's negligence. Mutual indemnification for respective breaches."
      },
      {
        "name": "Service Level",
        "summary": "Weekly mowing April-October, bi-weekly November-March. Snow removal within 4 hours of 2+ inch accumulation at Denver properties."
      }
    ],
    "governing_law": "State of Colorado"
  },
  "metadata": {
    "type": "contract",
    "confidence": 0.91,
    "model": "claude-sonnet-4-6-20250514",
    "processing_time_ms": 4215
  }
}
```

A few things jumped out. First, it caught the auto-renewal clause and extracted the notice period as a separate integer field — 60 days. That's the exact data point that would have prevented the $14,000 surprise. Second, `key_clauses` came back as a structured array with names and summaries. I didn't define these. DocuExtract identified them from the document.

Third: it used Sonnet, not Haiku. I had toggled "accurate" mode in the playground. More on why that matters for contracts in a minute.

---

## Haiku vs. Sonnet for Legal Documents

DocuExtract offers two models. Haiku is the default — fast, cheap, good for structured documents like invoices and receipts where the data is mostly numbers and short strings. Sonnet is the "accurate" mode — slower, more expensive (each Sonnet call counts as 3 extractions from your plan), but significantly better at understanding nuance.

Contracts have nuance. A termination clause might say "either party may terminate upon 60 days written notice" or it might say "this agreement may be terminated by the client for cause, with the provider entitled to 30 days cure period, failing which termination becomes effective 60 days from the date of the notice." Both contain the number 60. Only one means what you think it means.

I tested both models on 20 contracts from our drive:

| Metric | Haiku | Sonnet |
|---|---|---|
| Party identification | 96% | 98% |
| Date extraction | 94% | 97% |
| Dollar amounts | 95% | 97% |
| Clause summary quality | Acceptable | Notably better |
| Auto-renewal detection | 85% | 94% |
| Average confidence score | 0.88 | 0.93 |
| Processing time | ~2 seconds | ~4 seconds |

For simple contracts — a one-page equipment lease, a straightforward service agreement — Haiku is fine. For anything with legal complexity, Sonnet is worth the 3x cost. I decided to use Sonnet for all contract processing. At roughly 370 contracts, that's 1,110 extractions (370 x 3), which fits within the [Pro plan's](/pricing) 5,000 monthly limit.

---

## The Indexing Pipeline

Saturday morning, I sat down and built the pipeline. The plan: scan every PDF in our shared drive, send it to DocuExtract, store the structured data in Supabase, build a search UI on top.

Here's the batch processing script:

```javascript
import fs from 'fs';
import path from 'path';

const CONTRACT_DIR = '/mnt/shared/contracts';
const API_URL = 'https://docuextract.dev/v1/extract';
const API_KEY = 'dk_live_your_api_key_here';

async function extractContract(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document: base64,
      document_type: 'contract',
      model: 'sonnet',
    }),
  });

  const result = await response.json();
  return {
    file: path.basename(filePath),
    ...result.data,
    confidence: result.metadata.confidence,
  };
}

async function processAll() {
  const files = fs.readdirSync(CONTRACT_DIR)
    .filter(f => f.endsWith('.pdf'));

  console.log(`Found ${files.length} contracts to process`);

  const results = [];
  for (const file of files) {
    try {
      console.log(`Processing: ${file}`);
      const data = await extractContract(path.join(CONTRACT_DIR, file));
      results.push(data);

      // Rate limiting: Pro plan allows 60/min
      await new Promise(r => setTimeout(r, 1100));
    } catch (err) {
      console.error(`Failed: ${file} — ${err.message}`);
      results.push({ file, error: err.message });
    }
  }

  return results;
}
```

I added a 1.1-second delay between calls to stay comfortably within the Pro plan's 60 requests/minute rate limit. At that pace, 370 contracts took about 7 minutes. The Sonnet model averaged 4 seconds per contract, so the actual extraction time was about 25 minutes including the rate limit padding.

After extraction, I pushed everything into a Supabase table:

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  party_client TEXT,
  party_provider TEXT,
  effective_date DATE,
  expiration_date DATE,
  auto_renewal BOOLEAN,
  notice_period_days INTEGER,
  total_value_cents BIGINT,
  total_value_period TEXT,
  key_clauses JSONB,
  governing_law TEXT,
  confidence NUMERIC(4,3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## The Confidence Score Question

Not every contract extracted cleanly. Out of 370:

- **312** came back with confidence above 0.90 — I trusted these and loaded them directly
- **47** came back between 0.85 and 0.90 — I spot-checked a sample; most were fine, a few had clause summaries that were vague
- **11** came back below 0.85 — these were scanned copies with poor quality, handwritten amendments, or multi-language contracts

The 11 low-confidence ones, I reviewed manually. That took about 40 minutes. Some had handwritten margin notes that DocuExtract tried to interpret — it got the gist but missed specifics. A couple were Spanish-language contracts from our Phoenix properties; the extraction was decent but the clause summaries defaulted to English paraphrasing, which lost some legal nuance.

For a first pass across 370 documents, 97% at usable quality is a number I can work with. The alternative was reading all 370 manually, which our ops manager estimated would take two full weeks.

---

## Building the Search UI

Sunday afternoon. I had structured data in Supabase. Now I needed a way for our team to query it.

I built a simple Next.js page with a search bar and filters. The queries our ops team actually runs:

**"Which contracts expire before July 2026?"**
```sql
SELECT * FROM contracts
WHERE expiration_date < '2026-07-01'
ORDER BY expiration_date ASC;
```
Result: 12 contracts. Including the 3 auto-renewals our ops manager had missed.

**"Which vendors have auto-renewal clauses?"**
```sql
SELECT file_name, party_provider, expiration_date, notice_period_days
FROM contracts
WHERE auto_renewal = true
ORDER BY expiration_date ASC;
```
Result: 23 contracts. We now have a calendar alert set for each one, triggered `notice_period_days` before expiration.

**"What's our total annual spend on landscaping?"**
```sql
SELECT party_provider, total_value_cents / 100 as annual_cost
FROM contracts
WHERE key_clauses::text ILIKE '%landscape%'
  OR key_clauses::text ILIKE '%mowing%'
  OR party_provider ILIKE '%landscape%';
```
Result: 4 vendors, $127,000/year combined. Our CFO did not know this number before Monday morning.

---

## What Happened Monday

I showed my boss the search UI on Monday morning. He typed "contracts expiring before July" into the search bar. Twelve results. He clicked through three of them — the auto-renewals.

One was a pest control contract for $8,400/year with a vendor we'd been unhappy with. Notice window: 30 days. Expiration: May 15. He had 34 days to send the cancellation letter. Without the search tool, he would have missed it. Again.

Two others were HVAC contracts at our Denver properties — both auto-renewing, both with 60-day windows, both expiring in June. He made calls that afternoon to renegotiate.

Between those three contracts alone, the renegotiations saved the company roughly $18,000 in the first year. The DocuExtract Pro plan costs $99/month — $1,188/year. The ROI math is not complicated.

---

## Honest Limitations

This is not a contract management system. It's a search index. DocuExtract extracts the data; it doesn't manage workflows, send reminders, or handle approvals. I built the reminder system myself — a cron job that checks for contracts approaching their notice windows and sends a Slack message.

Other things I noticed:

**Long contracts (30+ pages) take longer.** A 40-page master services agreement took about 12 seconds with Sonnet. Not slow, but not the 2-3 seconds I was used to with shorter documents.

**Amendment tracking is manual.** If a contract has been amended three times, DocuExtract extracts the document you give it. It doesn't know about the previous versions. I had to build a simple version chain in Supabase myself.

**Clause extraction isn't legal review.** The `key_clauses` summaries are useful for search and triage, but they're not a substitute for a lawyer reading the actual clause. The 89% average confidence on clause summaries means about 1 in 10 might miss a nuance. I treat them as pointers to the right section of the document, not as legal advice.

**Non-PDF contracts.** A few of our older contracts exist only as Word documents. I converted them to PDF before processing. DocuExtract handles images and PDFs — check the [documentation](/docs) for the full list of supported formats.

---

## The Cost Breakdown

| Item | Cost |
|---|---|
| DocuExtract Pro plan | $99/month |
| 370 contracts x Sonnet (3x multiplier) = 1,110 extractions | Included in Pro (5,000/month) |
| Supabase | Free tier |
| My weekend | 2 days |
| **Total first-year cost** | **$1,188 + a weekend** |

Compare that to the enterprise contract management platforms I evaluated: $10,000-$40,000/year, plus implementation timelines measured in months.

For ongoing use, I run new contracts through DocuExtract as they're signed. That's maybe 10-15 new contracts per month — negligible against the 5,000 monthly limit. If we grow significantly, the [Scale plan](/pricing) at $249/month gives 20,000 extractions.

---

## What I'd Do Differently

If I built this again, I'd add a webhook to trigger extraction automatically when a new PDF is uploaded to our shared drive. Right now it's a manual step — someone signs a contract, saves the PDF, and then runs the extraction script. It works, but it relies on humans remembering. DocuExtract has [webhook support coming](/docs), which would make this seamless.

I'd also build a diff view for contract amendments. Upload the original and the amendment, extract both, show what changed. That's a weekend project I haven't gotten to yet.

If you manage any kind of contract library — even a small one — try dropping a contract into the [DocuExtract playground](/playground). Seeing your actual clauses and dates come back as searchable JSON makes the use case click in a way that reading about it doesn't.

---

## FAQ

**Q: Can DocuExtract handle contracts in languages other than English?**
It handled our Spanish-language contracts adequately — party names, dates, and dollar amounts were accurate. Clause summaries were paraphrased in English, which lost some specificity. I'd recommend Sonnet mode for non-English contracts and reviewing the clause summaries against the original text. I haven't tested extensively beyond English and Spanish.

**Q: How does the Sonnet 3x multiplier work with plan limits?**
Each Sonnet extraction counts as 3 extractions from your monthly allocation. So on the [Pro plan](/pricing) with 5,000 extractions/month, you get about 1,666 Sonnet calls. For a one-time batch of 370 contracts, that's 1,110 Sonnet extractions — well within limits. Ongoing, a few new contracts per month barely registers.

**Q: Is the extracted clause data legally binding or admissible?**
No. DocuExtract extracts and summarizes — it doesn't provide legal analysis. The `key_clauses` summaries are useful for search, triage, and flagging contracts that need attention, but they're not a substitute for legal review. Always verify critical terms against the original document.

**Q: How do you handle contracts with handwritten amendments or signatures?**
DocuExtract picks up handwritten text with moderate confidence (typically 0.78-0.88). Signatures are noted but not transcribed as text. For contracts with handwritten margin notes or strike-throughs, the extraction captures the printed content reliably and makes a best effort on handwriting. I flag anything below 0.85 confidence for manual review.

**Q: What happens when a contract exceeds the file size limit?**
DocuExtract accepts files up to 10MB. Most of our contracts are well under that. The one 40-page MSA with embedded images was about 4MB. If you have larger files, the [docs](/docs) suggest compressing the PDF or splitting into sections, though I haven't needed to do either.
