# DocuExtract — Launch Materials

> **For Kiano:** Copy-paste ready materials for Product Hunt and Hacker News.
> Launch on a Tuesday, Wednesday, or Thursday. PH posts go live at 12:01am PST.
> HN Show HN posts get best traction 8–10am EST on weekdays.

---

## PRODUCT HUNT

### Tagline (60 chars max)
```
Send a document, get JSON back. No templates, no training.
```
*(58 chars)*

### Short Description (260 chars max)
```
DocuExtract is a REST API that turns any invoice, receipt, contract, or resume into clean, validated JSON. Powered by Claude. Zero configuration — no templates to build, no models to train. Works on any document in seconds.
```
*(224 chars)*

### Long Description (for the listing body)
```
We built DocuExtract because every developer eventually hits the same wall: users upload documents, and somehow you have to turn unstructured PDFs and images into structured data your app can use.

The existing tools either require you to build templates for every document layout (which break when vendors update their format) or cost $500+/month with enterprise-only access.

DocuExtract is different:

→ Zero configuration. Send any document, get JSON back. No templates, no training data, no rules to define.

→ Works on any document type. Invoices, receipts, bank statements, resumes, contracts, ID documents, business cards, forms.

→ Developer-first. Single endpoint, clean JSON output, OpenAPI spec, JavaScript and Python SDKs. You can be making real extractions in under 5 minutes.

→ Transparent pricing. Free tier (100/month), then $49–$249/month based on volume. No credit multipliers, no enterprise gating.

→ Claude-powered accuracy. 90–97% field-level accuracy with per-field confidence scores, so you know when to trust the output automatically and when to flag for human review.

Built by a solo developer. We use it ourselves. Feedback welcome.
```

### Maker Comment (post this yourself on launch day)
```
Hey PH! 👋

I built DocuExtract after spending way too long building document parsers for client projects. Every time a vendor updated their invoice template, the parser broke. Every time a new document type appeared, I had to build new rules.

The insight that drove DocuExtract: LLMs are already great at reading documents the way humans do. Instead of writing rules that describe where a field *should* be, just ask the model what the field *is*.

The result is an API where you POST any document and get back clean, validated JSON — no setup, no templates, no training. It handles invoices from 100 different vendors the same way it handles a one-off contractor invoice you've never seen before.

A few things I'm particularly proud of:
- Confidence scores per extraction so you can auto-process high-confidence results and flag edge cases
- Custom schema support — tell it exactly which fields you want extracted
- The playground at docuextract.dev/playground — try it with your own documents before writing a line of code

I'd love to hear what you're building with it. What document types are most painful for your team right now?
```

### Gallery Image Descriptions (5 images — for a designer or screenshot tool)
1. **Playground screenshot** — Show the playground UI with a sample invoice loaded and JSON output visible side-by-side
2. **JSON output** — Clean, formatted JSON response from an invoice extraction, highlighting confidence scores
3. **Code example** — Dark-mode code snippet showing the 5-line curl/fetch integration
4. **Pricing table** — The four tiers (Free / Starter / Pro / Scale) with extraction counts and prices
5. **Document type grid** — Icon grid showing all 8 supported document types (invoice, receipt, bank statement, resume, contract, form, ID, business card)

### Topics / Tags
- Developer Tools
- APIs
- Artificial Intelligence
- Productivity
- SaaS

---

## HACKER NEWS — SHOW HN

### Post Title
```
Show HN: DocuExtract – REST API that turns any document into structured JSON
```

### Post Body
```
I built DocuExtract (https://docuextract.dev) — a single-endpoint REST API that extracts structured data from documents (invoices, receipts, contracts, resumes) and returns clean, validated JSON.

The core idea: instead of building template-based parsers that break when document layouts change, use an LLM (Claude) to read documents the way a human would and extract whatever fields you ask for.

How it works:

  POST /v1/extract
  Authorization: Bearer <api_key>
  { "document": "<base64 or URL>", "type": "invoice" }

Returns:
  { "data": { "vendor": ..., "total": 189.66, "line_items": [...] },
    "metadata": { "confidence": 0.97, "processing_time_ms": 1243 } }

Notable design decisions:

- Per-field confidence scores so you can auto-process high-confidence extractions and flag edge cases for human review
- Custom schema support: tell it exactly which fields to extract
- "Accurate" mode switches to a larger model for complex/multi-page documents
- All extractions are logged to Supabase for usage tracking; overage billing via Stripe meters
- /v1/health and /v1/usage are on Edge Runtime for near-zero cold starts; extraction routes stay on Node.js

Tech: Next.js 14 App Router, Supabase, Stripe, Claude API, deployed on Vercel.

Playground to try without signing up: https://docuextract.dev/playground

Pricing: 100/month free, then $49–$249/month. Open to feedback on the pricing model.

Happy to answer questions about the technical implementation or the extraction approach.
```

---

## LAUNCH DAY CHECKLIST

### Before posting:
- [ ] Verify docuextract.dev is live and playground works
- [ ] Test the extraction endpoint with a real document one more time
- [ ] Have 5–10 people ready to upvote and comment on PH on launch day (friends, colleagues, Twitter followers)
- [ ] Schedule the PH post for 12:01am PST on chosen day
- [ ] Draft 3–4 responses to likely PH comments in advance ("How does it compare to Mindee?" / "What's the accuracy?" / "Is there a self-hosted option?")

### After posting:
- [ ] Reply to every HN comment within the first 2 hours
- [ ] Post in relevant Slack communities (Indie Hackers, relevant developer Slack groups)
- [ ] Share on Twitter/X with a demo GIF of the playground
- [ ] Post in r/SideProject and r/webdev

### Responses to common questions:

**"How does it compare to Mindee/Docparser?"**
> Mindee uses pre-trained models for specific document types — great accuracy, but only works for supported types and gets expensive at scale. Docparser uses template rules — reliable for known layouts, breaks on novel ones. DocuExtract uses an LLM so it handles any document type without templates, including ones you've never seen before. The tradeoff is slightly higher per-call cost, but lower total cost of ownership since there's no template maintenance.

**"What's the accuracy?"**
> 90–97% field-level accuracy depending on document complexity and image quality. Every response includes a confidence score — above ~0.85 you can generally auto-process; below that, flag for review. We're working on a feedback loop to improve accuracy over time.

**"Is there a self-hosted option?"**
> Not currently. The extraction engine relies on the Claude API. If there's enough demand for a self-hosted version using a local LLM, that's something we'd consider.

**"What about GDPR/data privacy?"**
> Documents are processed in memory and not stored permanently. Extraction metadata (token counts, confidence scores, document type) is logged but not the document content itself. We're working on a data processing agreement for EU customers.
```
