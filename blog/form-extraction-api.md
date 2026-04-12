---
title: "How I Digitized 10,000 Paper Forms for $50 in a Weekend"
description: "A data engineer at a healthcare nonprofit digitizes 10,000 patient intake forms using a form extraction API — replacing a $25K manual project with a weekend script."
slug: form-extraction-api
date: 2026-04-12
keywords: ["form extraction API", "paper form to digital", "form digitization API", "form data extraction", "digitize paper forms"]
---

# How I Digitized 10,000 Paper Forms for $50 in a Weekend

My name is Leila. I'm a data engineer at a healthcare nonprofit in Chicago. We run community health clinics — three locations, about 6,000 patient visits per year. For the past nine years, every patient who walked in filled out a paper intake form. Name, date of birth, insurance, medications, allergies, emergency contact, medical history checkboxes. A single sheet, front and back.

Nobody digitized these. They went into filing cabinets.

Then we got a grant. A federal research grant that required digitized patient records going back five years. The grant coordinator told me the number: approximately 10,000 forms in filing cabinets across three clinics.

She asked how long it would take to digitize them. I said I'd figure it out. The answer turned out to be "one weekend and $50."

---

## The Options I Was Given

My director laid out three paths:

**Option 1: Hire temporary data entry staff.** A staffing agency quoted us 4 temps for 3 weeks at roughly $25,000 total. They'd type each form into our EHR system manually. Error rate estimate: 3-5% (industry standard for manual data entry). Timeline: 3-4 weeks.

**Option 2: Use a scanning service.** A local document scanning company quoted $15,000 for pickup, scanning, and basic data extraction. Timeline: 6 weeks. Their "extraction" was keyword-based — it could pull printed text but not handwritten fields. Since our forms are half handwritten, we'd still need manual review for most records.

**Option 3: Automate it.** My director looked at me when she said this one. She didn't say "build something." She said "you're the engineer."

---

## Step 1: Scanning (The Easy Part)

We have a Ricoh office copier at each clinic with a sheet feeder and scan-to-PDF capability. I asked our office managers to start feeding forms through the scanner in batches of 50. Front and back, single PDF per form.

Monday through Wednesday, the three clinics scanned everything. By Wednesday night I had 10,247 PDF files in a shared folder. Each file was one patient intake form — a two-page PDF, roughly 200-400KB depending on handwriting density and whether someone had used a blue or black pen (blue scans lighter and sometimes fades).

Total scanning cost: $0 (existing equipment). Total time: about 6 hours of office manager time spread across three days. Not glamorous, but done.

---

## Step 2: The Extraction Problem

Now I had 10,247 PDFs. I needed structured data from each one: patient name, DOB, phone, insurance provider, medication list, allergies, medical history flags.

I tried Google Document AI first. It's what I knew. I'd used it for a previous project extracting data from printed shipping labels, and it worked well for that. I set up a processor, uploaded 20 test forms, and waited.

Results on printed fields (name, DOB in block letters): decent. Maybe 85% accuracy.

Results on handwritten fields (medications, allergies, notes): bad. About 50-60% accuracy. It read "Lisinopril 10mg" as "Lsinopnl 10mg" and "Metformin" as "Metfonnin." Close enough for a human to interpret, useless for a database.

The issue is fundamental. Our forms are a mix of printed headers ("Patient Name: ___________") with handwritten answers. Google's Document AI is built around OCR — optical character recognition. OCR excels at printed text in standard fonts. Handwriting is a different problem. Especially doctor-and-patient handwriting on a form that's been photocopied and then scanned.

I needed something that could look at a form the way a person would — read the printed label, then interpret the handwritten answer next to it, understanding context. "Patient Name" followed by cursive scrawl should produce a name, not a string of misread characters.

---

## Finding DocuExtract

I found DocuExtract through a thread on r/dataengineering where someone was asking about alternatives to Google Document AI for handwritten forms. A commenter linked to the [playground](/playground) and said "try it, it's not OCR."

That's the key distinction. DocuExtract doesn't do OCR. It uses Claude's vision capabilities — the AI looks at the document image and reads it the way a human would. It understands that a scribbled word next to "Allergies:" is probably a medication or food name, not random characters. Context helps it interpret messy handwriting.

I uploaded one of our worst forms — a sheet where the patient had used a light blue pen on a form that had been photocopied so many times the printed headers were fading. Google Document AI returned mostly garbage for this one.

DocuExtract returned this:

```json
{
  "data": {
    "form_type": "patient_intake",
    "fields": {
      "patient_name": "Margaret Chen",
      "date_of_birth": "1954-08-12",
      "phone": "773-555-0148",
      "address": "2847 W. Diversey Ave, Chicago, IL 60647",
      "insurance_provider": "Blue Cross Blue Shield of Illinois",
      "insurance_id": "XGH882451907",
      "primary_care_physician": "Dr. Rajesh Patel",
      "medications": [
        "Lisinopril 10mg daily",
        "Metformin 500mg twice daily",
        "Atorvastatin 20mg nightly"
      ],
      "allergies": ["Penicillin", "Sulfa drugs"],
      "medical_history": {
        "diabetes": true,
        "hypertension": true,
        "heart_disease": false,
        "asthma": false,
        "cancer": false,
        "mental_health": true,
        "other": "Mild anxiety, managed with therapy"
      },
      "emergency_contact": {
        "name": "David Chen",
        "relationship": "Spouse",
        "phone": "773-555-0192"
      }
    }
  },
  "metadata": {
    "type": "form",
    "confidence": 0.91,
    "model": "claude-haiku-4-5-20251001",
    "processing_time_ms": 2103
  }
}
```

It read "Lisinopril" correctly. It read "Metformin" correctly. It understood that checked boxes under "Medical History" meant `true` and unchecked meant `false`. It even parsed the handwritten note in the "Other" field — "Mild anxiety, managed with therapy" — which was barely legible to me.

91% confidence on one of our worst forms. I tested 10 more forms at varying quality levels. Average confidence: 0.93. The printed-only forms hit 0.96-0.97. The messy handwritten ones ranged from 0.87 to 0.93.

---

## Step 3: The Batch Script

I wrote the processing script Friday evening. The logic is simple: iterate through every PDF, send it to DocuExtract, collect the results, flag anything with low confidence for manual review.

```bash
# Quick test with curl before writing the full script
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "'"$(base64 -w0 /path/to/form.pdf)"'",
    "document_type": "form"
  }'
```

That one-liner confirmed the API worked with our scanned PDFs. Then the full Python script:

```python
import os
import json
import base64
import time
import requests

API_URL = 'https://docuextract.dev/v1/extract'
API_KEY = os.environ['DOCUEXTRACT_API_KEY']
FORM_DIR = '/data/scanned_forms'
OUTPUT_DIR = '/data/extracted'
FLAGGED_DIR = '/data/flagged'

CONFIDENCE_THRESHOLD = 0.88

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}

def extract_form(pdf_path):
    with open(pdf_path, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')

    response = requests.post(API_URL, headers=headers, json={
        'document': encoded,
        'document_type': 'form',
    })
    response.raise_for_status()
    return response.json()

def process_all():
    pdfs = sorted([f for f in os.listdir(FORM_DIR) if f.endswith('.pdf')])
    print(f'Processing {len(pdfs)} forms...')

    stats = {'total': 0, 'high_conf': 0, 'flagged': 0, 'errors': 0}

    for i, filename in enumerate(pdfs):
        try:
            result = extract_form(os.path.join(FORM_DIR, filename))
            confidence = result['metadata']['confidence']
            stats['total'] += 1

            output = {
                'source_file': filename,
                'confidence': confidence,
                'data': result['data'],
            }

            if confidence >= CONFIDENCE_THRESHOLD:
                dest = os.path.join(OUTPUT_DIR, filename.replace('.pdf', '.json'))
                stats['high_conf'] += 1
            else:
                dest = os.path.join(FLAGGED_DIR, filename.replace('.pdf', '.json'))
                stats['flagged'] += 1

            with open(dest, 'w') as f:
                json.dump(output, f, indent=2)

            if (i + 1) % 100 == 0:
                print(f'  {i + 1}/{len(pdfs)} — '
                      f'{stats["high_conf"]} clean, '
                      f'{stats["flagged"]} flagged, '
                      f'{stats["errors"]} errors')

            # Stay within rate limits (free: 5/min, starter: 30/min)
            time.sleep(0.5)

        except Exception as e:
            stats['errors'] += 1
            print(f'  ERROR on {filename}: {e}')

    return stats

if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(FLAGGED_DIR, exist_ok=True)
    final = process_all()
    print(f'\nDone. {final}')
```

Simple. No ML frameworks, no training data, no model tuning. Read a PDF, POST it, save the JSON. Flag it if the confidence is low.

---

## The Cost Math

This is the part that made my director's jaw drop.

DocuExtract uses Haiku by default for form extraction. Each call costs one extraction from your plan. On the [Starter plan](/pricing) at $49/month, you get 1,500 extractions. For a one-time batch of 10,247 forms, I'd blow through that immediately.

But there's overage billing. On Starter, overage is $0.04 per call. On Pro ($99/month, 5,000 included), overage is $0.025 per call. On Scale ($249/month, 20,000 included), it's $0.015 per call.

I did the math:

| Plan | Included | Overage Calls | Overage Cost | Plan Cost | Total |
|---|---|---|---|---|---|
| Starter | 1,500 | 8,747 | $349.88 | $49 | $398.88 |
| Pro | 5,000 | 5,247 | $131.18 | $99 | $230.18 |
| Scale | 20,000 | 0 | $0 | $249 | $249.00 |

Wait. At Scale, 10,247 forms fit within the 20,000 monthly limit. One month of Scale: $249.

But actually — I did some rough testing and realized I could process at roughly 2 calls/second sustainably. At that rate, 10,247 forms would take about 85 minutes. I could sign up for one month of Pro, process everything over a weekend, and the total cost with overage would be $230. Or I could pay $249 for Scale and have headroom.

I went with Pro. My total cost: **$99 (one month of Pro) + $131.18 (overage for 5,247 extra calls) = $230.18.**

Round it up. Call it $250 with tax. Against the alternatives:
- Manual data entry: $25,000
- Scanning service: $15,000 (plus manual review for handwritten fields)
- DocuExtract: $250

My director asked me to repeat the number. Then she asked me to repeat it again.

---

## Running It

I kicked off the script Saturday morning at 9am. By 10:30am, it had processed all 10,247 forms. Actual processing took about 85 minutes — each form averaged 2.1 seconds with DocuExtract, plus the half-second delay I added between calls.

Results:

- **9,634 forms** (94.0%) — confidence 0.88 or higher, saved to the clean output folder
- **487 forms** (4.8%) — confidence between 0.80 and 0.87, flagged for review
- **112 forms** (1.1%) — confidence below 0.80, flagged for review
- **14 forms** (0.1%) — errors (corrupted PDFs, blank scans, one that was apparently a lunch menu someone scanned by accident)

599 forms flagged, plus 14 errors. I spent Saturday afternoon and Sunday morning reviewing the flagged ones. Most of the 0.80-0.87 group were fine — the confidence dip was usually a single field where handwriting was ambiguous. Maybe a "7" that could be a "1" in a phone number, or a medication name written in shorthand. I corrected those and moved them to the clean pile.

The 112 low-confidence forms were the real work. Water-damaged forms, forms where someone had filled everything out in pencil that barely scanned, forms in languages other than English (we serve a diverse community — some patients filled out forms in Spanish or Polish). For these, I had a clinic coordinator verify against the original paper form.

By Sunday evening: 10,233 forms digitized and verified. 14 discarded (corrupted or irrelevant).

---

## What Happened Next

Monday morning, I imported the JSON records into our research database. The grant coordinator ran her first query — patients with Type 2 diabetes who had visited in the past three years. She got 847 results in under a second. This query would have taken weeks if we were still on paper.

The research study started on schedule. The grant deliverable was met. Total cost of the digitization project: $250 in API calls, plus one weekend of my time, plus about 6 hours of scanning across three clinics.

We kept the DocuExtract subscription. New intake forms now get scanned and processed the same day. Our front desk scans them after each clinic session, a cron job runs the extraction script nightly, and by the next morning the data is in our system. We're on the [Starter plan](/pricing) now — about 120 new forms per month, well within the 1,500 limit.

If you're sitting on a pile of paper forms and someone just told you they need to be digital, try running one through the [DocuExtract playground](/playground) before you call a staffing agency. The playground gives you 5 free extractions without even signing up. Drop your messiest, most handwritten form in there. If DocuExtract can read that one, it can read the rest.

---

## FAQ

**Q: How does DocuExtract handle mixed handwritten and printed text on the same form?**
It handles both in a single pass. The AI sees the full form image — printed headers and handwritten answers together — and uses context to interpret each field. "Patient Name:" printed in Arial followed by cursive handwriting is understood as a label-value pair. This is fundamentally different from OCR, which processes all text the same way regardless of context. Check the [use cases page](/use-cases) for more examples.

**Q: What about HIPAA compliance for healthcare data?**
DocuExtract processes documents via API — you send the data, they extract it, they return results. Check their [documentation](/docs) for their data handling and retention policies. For our project, we reviewed DocuExtract's security documentation with our compliance team before processing patient records. The data is transmitted over HTTPS. We also ran the script on a HIPAA-compliant workstation within our network.

**Q: Can it handle forms that aren't in English?**
I had mixed results. Spanish forms worked reasonably well — most fields extracted at 0.85+ confidence. Polish forms were less reliable, especially handwritten Polish. DocuExtract performs best on English and widely-used Latin-script languages. For non-Latin scripts, I'd recommend testing in the [playground](/playground) before committing to a batch job.

**Q: What if my forms have different layouts across years?**
Our intake form changed twice in nine years. DocuExtract handled all three versions without any configuration. Since it reads the form contextually rather than relying on fixed coordinates, a different layout is no problem — "Patient Name" in the top-left corner or the top-right corner still gets mapped to the same JSON field. No templates to update.

**Q: Is there a file size limit for scanned forms?**
DocuExtract accepts files up to 10MB. Our two-page scanned intake forms averaged 250-350KB each. Even a high-resolution scan of a multi-page form rarely exceeds 5MB. If your scans are unusually large, reducing DPI from 600 to 300 typically cuts size in half with negligible quality loss for extraction purposes.
