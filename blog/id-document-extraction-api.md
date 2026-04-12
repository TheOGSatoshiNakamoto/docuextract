---
title: "How I Built KYC Document Extraction for a Remittance App (Without Paying $10K)"
description: "How a fintech developer used an ID extraction API to extract passport and national ID data for KYC onboarding — without enterprise pricing or months of integration."
slug: id-document-extraction-api
date: 2026-04-12
keywords: ["ID extraction API", "passport extraction API", "KYC document verification", "identity document parsing", "document extraction API"]
---

# How I Built KYC Document Extraction for a Remittance App (Without Paying $10K)

My name is Yuki. I'm a fullstack developer at a small fintech startup in Singapore. We're building a remittance app — the kind where migrant workers send money home to their families in the Philippines, Indonesia, and Myanmar.

Regulatory reality hit us on day one. Under MAS (Monetary Authority of Singapore) guidelines, every user must complete KYC before they can transfer a single dollar. That means uploading a government-issued ID — passport, national ID card, or work permit — and having the details verified against their profile.

We have around 200 users right now. Not 200,000. Two hundred.

And that distinction matters, because it determines what kind of KYC solution makes sense.

---

## The Enterprise KYC Trap

My first instinct was to evaluate the established players. Jumio. Onfido. Veriff. These are serious platforms that handle identity verification for banks and large fintechs.

They're also priced accordingly.

Jumio wanted a $10,000+ setup fee before we'd process a single document. Onfido was in a similar range, with per-verification pricing that assumed volume we won't see for a year. Both solutions are genuinely good — if you're onboarding 100,000 users, the unit economics make perfect sense. At 200 users, we'd be paying more for KYC tooling than our entire AWS bill.

There's also the integration complexity. These platforms do everything: liveness detection, facial matching, document authentication, sanctions screening, PEP checks. Full-stack identity verification. We don't need all of that — our compliance team handles the actual verification decisions. We just need the data off the document.

Specifically, we need: full name, date of birth, nationality, document number, and expiry date. Extracted from a photo of a passport or national ID card. Accurately. That's it.

---

## What We Actually Need vs. What Enterprise KYC Sells

Let me be precise about the workflow:

1. User uploads a photo of their passport or national ID
2. We extract the key fields from that document
3. The extracted data pre-populates the KYC form
4. User confirms or corrects any errors
5. Our compliance team reviews and approves

Steps 1-3 are data extraction. Steps 4-5 are verification. The enterprise platforms bundle both together — and charge accordingly. But for an early-stage company, you can decouple these concerns.

**Important disclaimer: DocuExtract is a data extraction tool, not a KYC compliance solution.** It reads text from identity documents. It does not perform identity verification, liveness detection, document authentication, or sanctions screening. If your regulatory requirements mandate those capabilities, you need a dedicated KYC/AML platform. DocuExtract handles the extraction layer — what you do with that data for compliance purposes is your responsibility.

With that clear, here's how I built the extraction piece.

---

## Evaluating DocuExtract for ID Extraction

I found DocuExtract while reading a Hacker News thread about document parsing APIs. The [playground](/playground) let me test without signing up, which is exactly the kind of thing that wins developer trust.

I uploaded a photo of a sample Singapore national ID card. Two seconds later, I had structured JSON:

```json
{
  "data": {
    "document_type": "national_id",
    "full_name": "TAN WEI MING",
    "date_of_birth": "1990-03-14",
    "nationality": "Singaporean",
    "document_number": "S9012345A",
    "expiry_date": "2030-06-20",
    "issuing_country": "SG"
  },
  "metadata": {
    "type": "identity_document",
    "confidence": 0.95,
    "model": "claude-sonnet-4-5-20250514",
    "processing_time_ms": 1870
  }
}
```

Clean. Structured. Every field I needed. I tested with a Malaysian MyKad, a Philippines passport, and an Indonesian KTP. All came back with the same consistent schema.

---

## The Integration

The actual code took less than an hour. Here's the core of it.

### Accepting the Upload

Our React Native app captures the photo. On the backend, we receive it as a base64-encoded image:

```bash
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "data:image/jpeg;base64,/9j/4AAQ...",
    "type": "identity_document",
    "model": "sonnet"
  }'
```

A note on model selection: I use Sonnet for ID documents specifically. The extra accuracy matters when you're extracting names with diacritics, non-Latin scripts, or faded print on older documents. Sonnet costs 3x the extraction credits (1 Sonnet call = 3 extractions from your plan allocation), but for a KYC flow where accuracy directly affects compliance, it's worth it.

### Node.js Integration

```javascript
const extractIdData = async (base64Image) => {
  const response = await fetch('https://docuextract.dev/v1/extract', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DOCUEXTRACT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document: base64Image,
      type: 'identity_document',
      model: 'sonnet',
    }),
  });

  const result = await response.json();

  if (result.metadata.confidence < 0.90) {
    return {
      success: false,
      message: 'Could not read document clearly. Please retake the photo.',
      data: result.data,
    };
  }

  return { success: true, data: result.data };
};
```

### The Confidence Threshold

That `0.90` threshold is important. If DocuExtract returns a confidence score below 90%, we don't silently accept the data — we prompt the user to retake the photo. Common reasons for low confidence:

- Glare on a laminated card
- Finger covering part of the document
- Blurry photo (motion or focus issues)
- Photo of a photocopy instead of the original

In our testing across 50+ sample documents, confidence above 90% correlated with zero extraction errors on the critical fields (name, DOB, document number). Below 90%, we saw occasional issues — usually partial names or misread digits.

### Pre-populating the KYC Form

Once we have the extracted data, we use it to pre-fill the user's KYC form:

```javascript
const populateKycForm = (extractedData) => ({
  fullName: extractedData.full_name,
  dateOfBirth: extractedData.date_of_birth,
  nationality: extractedData.nationality,
  documentNumber: extractedData.document_number,
  documentExpiry: extractedData.expiry_date,
  // User confirms or edits these before submission
  confirmed: false,
});
```

The user reviews the pre-populated fields, corrects anything that looks wrong, and submits. Our compliance team then reviews the submission alongside the original document photo (which they access through our internal admin panel).

---

## PII and Data Handling

This is the part that matters most for a fintech handling identity documents.

DocuExtract processes documents in memory and does not store them. The image you send is processed by Claude's vision capabilities, the structured data is returned, and the original document is not retained on DocuExtract's servers. This is critical for PII handling.

On our side, we store only the extracted fields in our users table, delete the base64 payload from server memory immediately after the API call, and keep the original photo in an encrypted S3 bucket with strict access controls for the compliance-mandated retention period.

Your data handling requirements depend on your jurisdiction. For Singapore, PDPA applies. For EU users, GDPR. Consult your compliance counsel.

---

## What DocuExtract Doesn't Do (and When You'll Outgrow It)

I want to be honest about the boundaries here.

**DocuExtract extracts data. It does not verify identity.**

It cannot tell you whether:
- The document is genuine or forged
- The photo on the ID matches the person holding it
- The document has been digitally altered
- The person is on a sanctions list

If your regulatory environment requires any of the above, you need a dedicated KYC platform — Jumio, Onfido, Veriff, Sumsub, or similar. At scale, the per-unit cost of these platforms becomes reasonable, and the risk of non-compliance far outweighs the cost savings.

For us at 200 users, DocuExtract handles the extraction layer perfectly. Our compliance team does the verification. When we hit 5,000+ users, we'll likely add a full KYC platform for automated verification and keep DocuExtract for the extraction step — or migrate entirely. That's a good problem to have.

---

## Cost Breakdown

Here's what the numbers look like on DocuExtract's [Pro plan](/pricing) at $99/month:

- **5,000 extractions/month** included
- Using Sonnet for IDs: each extraction costs 3 credits (the Sonnet multiplier)
- So effectively **~1,666 ID extractions/month** on Sonnet
- We onboard roughly 30-40 new users per month right now
- Even with retakes, that's maybe 60 extractions per month
- We're using about 4% of our plan capacity

Compare that to enterprise KYC: $10,000+ setup, $2-5 per verification, annual minimums.

For an early-stage fintech processing fewer than 500 verifications per month, DocuExtract is an order of magnitude cheaper. The math changes at scale — and that's okay. Use the right tool for the right stage.

---

## Document Types We've Tested

We serve workers from across Southeast Asia, so we needed to verify DocuExtract against a range of ID formats:

| Document | Country | Confidence (avg) | Notes |
|----------|---------|-------------------|-------|
| Passport | Philippines | 0.96 | MRZ zone reads perfectly |
| Passport | Indonesia | 0.95 | Handles Indonesian names well |
| Passport | Myanmar | 0.93 | Burmese script extracted correctly |
| National ID (NRIC) | Singapore | 0.96 | Very consistent format |
| MyKad | Malaysia | 0.94 | Bilingual fields handled |
| KTP | Indonesia | 0.92 | Older cards score lower |
| Work Permit | Singapore | 0.91 | Variable card quality |

The lowest scores came from older, worn physical cards. When we prompt for a retake on anything below 0.90, the second attempt almost always clears the threshold.

---

## Lessons Learned

**1. Always use Sonnet for ID documents.** The accuracy difference between Haiku and Sonnet on identity documents is significant. Names with non-Latin characters, faded print, and small text all benefit from the more capable model. The 3x credit cost is worth it.

**2. Build the retake flow from day one.** Don't assume every photo will be readable. Build the "please retake" path before you build the happy path. It'll save you support tickets.

**3. Let the user confirm extracted data.** Never auto-submit extracted fields to your compliance system without human review. Extraction accuracy is high, but "high" is not "perfect."

**4. Keep your compliance team in the loop.** They need to understand that DocuExtract is an extraction tool, not a verification tool. The distinction matters for your audit trail.

**5. Test with real documents early.** Sample documents in a controlled environment are one thing. Real photos taken by users with cracked screens in poor lighting are another. The [playground](/playground) is great for quick validation, but production testing reveals the edge cases.

---

## The Result

We shipped the KYC extraction flow in two days. One day for integration and testing, one day for the retake flow and error handling. Our compliance team was skeptical until they saw the accuracy on real documents — now they prefer the pre-populated forms over manual data entry.

Total cost: $99/month on DocuExtract's Pro plan, using a fraction of the capacity. What would have required a $10,000+ enterprise contract and weeks of integration took a weekend and costs less than our team's monthly coffee budget.

If you're building a fintech app that needs to extract data from identity documents — and you're not yet at the scale where a full KYC platform makes financial sense — [try DocuExtract in the playground](/playground). Upload a sample ID and see the JSON come back. Then read the [docs](/docs) and integrate it into your flow.

The enterprise platforms will still be there when you need them. For now, extract what you need and ship.

---

## Frequently Asked Questions

### Is DocuExtract a KYC compliance solution?

No. DocuExtract extracts structured data from identity documents — names, dates, document numbers. It does not perform identity verification, liveness detection, document authentication, or sanctions screening. If your regulatory framework requires those capabilities, use a dedicated KYC platform (Jumio, Onfido, Veriff, etc.). DocuExtract handles the data extraction layer only.

### Which model should I use for ID documents?

Use Sonnet. Identity documents have small text, security patterns, and sometimes non-Latin scripts that benefit from the more capable model. Sonnet costs 3x the extraction credits (1 Sonnet call = 3 extractions from your plan allocation), but the accuracy improvement on ID documents is worth it. See the [pricing page](/pricing) for plan details.

### Does DocuExtract store my users' identity documents?

No. Documents are processed in memory using Claude's vision capabilities and are not retained on DocuExtract's servers. The API returns the extracted data and the original document is discarded. You're responsible for how you store and handle the extracted PII on your own infrastructure.

### What document types are supported?

DocuExtract handles passports, national ID cards, driver's licenses, work permits, and residence cards from most countries. It reads MRZ (machine-readable zone) data on passports and extracts fields from both Latin and non-Latin scripts. For the full list of supported document types, see the [use cases page](/use-cases) and the [API documentation](/docs).

### What happens if the extraction confidence is low?

The API returns a confidence score between 0 and 1 for each extraction. We recommend setting a threshold (0.90 works well for identity documents) and prompting the user to retake the photo if confidence falls below it. Common causes of low confidence include glare, blur, fingers covering the document, and photos of photocopies rather than originals.
