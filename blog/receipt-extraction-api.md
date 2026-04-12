---
title: "120 Receipts Every Monday Morning: How I Automated Expense Reports for a Construction Firm"
description: "A freelance developer's guide to automating receipt extraction with an API. From blurry phone photos to structured JSON in seconds."
slug: receipt-extraction-api
date: 2026-04-12
keywords: ["receipt extraction API", "receipt parser", "expense automation", "receipt to JSON", "automate expense reports"]
---

# 120 Receipts Every Monday Morning: How I Automated Expense Reports for a Construction Firm

I'm Dana. I freelance as a developer for small companies that need automation but can't justify a full-time hire. One of my clients is a construction firm in Colorado — 15 field workers, three active job sites, and a bookkeeper named Pam who has been doing expense tracking in Excel since 2014.

Every Friday afternoon, each field worker photographs their week's receipts and dumps them into a shared Google Drive folder. Fuel, materials, lunches, equipment rentals. By Sunday night, there are roughly 120 images sitting in that folder. My job is to turn them into a structured expense spreadsheet by Monday morning.

I've been doing this for eight months. For the first six, I did it manually.

---

## The Monday Morning Ritual

Here's what 120 receipts from construction workers look like:

- Half are crumpled thermal paper receipts from gas stations and hardware stores. Some are already fading.
- About 20 are photographed at an angle, in bad lighting, or with a thumb partially covering the total.
- One guy — Marcus, I know his name at this point — photographs every receipt upside down. Every single one. Eight months running.
- A few are handwritten receipts from small suppliers.
- Some are digital receipts screenshotted from a phone, with half the screen being the notification bar.

I'd open each image, squint at the merchant name, type the date, the total, the category. Two hours if I was fast. Three if the thermal paper receipts were extra faded. I made mistakes constantly — transposing digits, misreading a $16.50 as $18.50 because the thermal ink was ghosting.

Pam never questioned the numbers. She trusted my spreadsheet. That bothered me more than the tedium.

---

## Attempt 1: Tesseract

I'm a Python person. Naturally, I reached for Tesseract.

```python
import pytesseract
from PIL import Image

text = pytesseract.image_to_string(Image.open("receipt_042.jpg"))
print(text)
```

On a clean, well-lit receipt from Home Depot, Tesseract worked okay. It got the merchant name, most of the line items, and the total. I could regex out what I needed.

On a faded thermal paper receipt from a gas station? Disaster.

```
# Actual Tesseract output for a Shell gas station receipt:
# She|l
# 03/2l/2026
# Regu ar    $3.4E/ga
# l2.847 gal
# Tot l:   $44 33
```

"She|l." "03/2l/2026." "Tot l." The pipe character where an "l" should be. A "2l" instead of "21." The total missing its period.

I spent a weekend preprocessing images — converting to grayscale, increasing contrast, applying adaptive thresholding, deskewing. It helped on some receipts and made others worse. The thermal paper ones with yellow-brown backgrounds were consistently terrible.

I also tried Google Cloud Vision. Better accuracy on the text extraction, but it still just gave me raw text. I'd still need to parse merchant name from line items from totals. Every receipt layout is different. The gas station has the total at the bottom. The restaurant puts it in the middle with a tip line after. The hardware store has a subtotal, tax, and total in three different spots.

Six hours into my "automation," I was writing more code than it would take to just type the numbers manually.

---

## Finding DocuExtract

I was complaining about this in a Slack group for freelancers. Someone posted a link to the [DocuExtract playground](/playground) and said "try this on your worst receipt."

I picked Marcus's upside-down gas station receipt from the previous Friday. Faded thermal paper, shot at an angle, rotated 180 degrees. My personal nemesis.

I dropped it into the playground.

Two seconds later:

```json
{
  "data": {
    "merchant": {
      "name": "Shell",
      "address": "4521 W Colfax Ave, Denver, CO 80204"
    },
    "date": "2026-03-21",
    "items": [
      {
        "description": "Regular Unleaded",
        "quantity": 12.847,
        "unit_price": 3.46,
        "total": 44.45
      }
    ],
    "subtotal": 44.45,
    "tax": 0.00,
    "total": 44.45,
    "payment_method": "Visa ending 4421"
  },
  "metadata": {
    "confidence": 0.92,
    "document_type": "receipt",
    "processing_time_ms": 1623,
    "model": "haiku-4.5"
  }
}
```

It read the receipt upside down. I didn't tell it the image was rotated. It just handled it.

I checked the total against the photo. $44.45. Correct. The date was March 21st — the "2l" that Tesseract couldn't read was "21" all along.

DocuExtract doesn't use traditional text recognition. It uses Claude's vision capabilities — the same AI that can look at an image and understand what it's seeing. It doesn't care if the receipt is upside down, sideways, or crumpled. It reads the document the way you would if you were holding it.

---

## Building the Pipeline

I signed up for a DocuExtract account (free tier, 50 extractions/month — enough for testing) and wrote the batch processing script.

```bash
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "data:image/jpeg;base64,/9j/4AAQ...",
    "type": "receipt",
    "schema": {
      "merchant_name": "string",
      "date": "date",
      "items": [{"description": "string", "quantity": "number", "total": "number"}],
      "subtotal": "number",
      "tax": "number",
      "total": "number",
      "payment_method": "string"
    }
  }'
```

Then the full Python script:

```python
import requests, base64, json, os
from datetime import datetime

API_KEY = os.environ["DOCUEXTRACT_API_KEY"]
RECEIPTS_DIR = "/path/to/google-drive/receipts/2026-W13/"

def extract_receipt(image_path):
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    ext = image_path.split(".")[-1].lower()
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/jpeg")
    
    resp = requests.post("https://docuextract.dev/v1/extract",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "document": f"data:{mime};base64,{b64}",
            "type": "receipt"
        })
    return resp.json()

results = []
for filename in sorted(os.listdir(RECEIPTS_DIR)):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        path = os.path.join(RECEIPTS_DIR, filename)
        print(f"Processing {filename}...")
        result = extract_receipt(path)
        if result.get("data"):
            results.append({
                "file": filename,
                "merchant": result["data"].get("merchant_name", "Unknown"),
                "date": result["data"].get("date", ""),
                "total": result["data"].get("total", 0),
                "tax": result["data"].get("tax", 0),
                "payment_method": result["data"].get("payment_method", ""),
                "confidence": result["metadata"]["confidence"]
            })

# Flag low-confidence results for manual review
for r in results:
    if r["confidence"] < 0.85:
        r["needs_review"] = True
        print(f"  ⚠ Low confidence ({r['confidence']}) — flagging for review: {r['file']}")
```

I run this every Monday at 6am via cron. By the time I sit down with coffee, the spreadsheet is generated. I scan the flagged items — usually 3-5 out of 120 — verify them against the photos, and send the sheet to Pam.

---

## The Numbers

After four weeks of running DocuExtract on real receipts:

- **Average accuracy on clean receipts:** 96-98% of fields correct
- **Average accuracy on faded thermal paper:** 89-93% (the hard ones)
- **Marcus's upside-down receipts:** 91-95% (it really does handle rotation)
- **Processing time per receipt:** 1.2 to 2.8 seconds
- **Receipts flagged for manual review (confidence < 0.85):** about 5 per batch

The faded thermal paper receipts are genuinely hard. Some of them, I can barely read myself. When DocuExtract returns a 0.78 confidence score on a gas station receipt where the ink is half-gone, that's an honest signal. I pull up the photo and verify. Most of the time, it got it right anyway — the low confidence just means it wasn't sure.

For the truly unreadable ones — maybe 2 per batch — I enter them manually. That's two receipts instead of 120. I can live with that.

---

## Cost

120 receipts per week is roughly 500 per month. The free tier covers 50, so I needed a paid plan.

The Starter plan at $49/month gives 1,500 extractions. That covers the construction client with room for my other clients' smaller jobs. Per-receipt cost works out to about $0.03-0.04, which is well under what I'd charge per hour to do it manually.

I bill my client a flat monthly fee for the expense processing service. They don't know I automated it. They don't need to know. What they know is that the spreadsheet shows up Monday morning with fewer errors than when I was doing it by hand.

You can check the full plan comparison on the [pricing page](/pricing).

---

## Limitations I've Hit

DocuExtract isn't magic. Here's where it struggles:

**Multiple receipts in one photo.** One worker occasionally photographs two receipts side by side in a single image. DocuExtract picks up the larger one and ignores the smaller one. I told the team to photograph one receipt per image. Problem solved, but not by the API.

**Extremely long receipts.** CVS-style receipts that are 18 inches of paper with 40 line items — the line item extraction gets spotty past about 25 items. Confidence drops. For expense reporting, I usually only need the total, so this doesn't matter much. But if you need every line item from a long receipt, check the output carefully.

**Handwritten additions.** If someone writes a tip amount on a restaurant receipt by hand, DocuExtract sometimes picks it up and sometimes doesn't. The printed total is always accurate; the handwritten additions are hit or miss.

The [documentation](/docs) has more detail on supported formats and known limitations.

---

## What Pam Thinks

I showed Pam the system last week. Not the code — just the output. I told her the spreadsheet is now generated automatically, and I review flagged items manually.

She said: "So it's like having an assistant who reads receipts?"

Yeah, Pam. That's exactly what it is.

---

## If You're Processing Receipts

If you're in a similar situation — batches of receipt photos that need to become structured data — here's what I'd suggest:

1. Try the [DocuExtract playground](/playground) with your worst receipt. The blurriest, most faded, most annoying one. See what comes back.
2. Check the confidence scores. Anything above 0.90 is reliable. Between 0.80-0.90, verify manually. Below 0.80, definitely double-check.
3. Build your pipeline to flag low-confidence results instead of blindly trusting them. The confidence scores exist for a reason.
4. Start on the free tier. 50 extractions is enough to validate that it works on your receipts before committing to a paid plan.

The [use cases page](/use-cases) has more examples of receipt extraction, including before/after comparisons with different receipt types.

I'm going back to my Monday morning coffee. The spreadsheet's already done.

---

## Frequently Asked Questions

### Does DocuExtract handle faded thermal paper receipts?

Yes, though accuracy is lower than on clean receipts. In my testing, faded thermal paper receipts scored 89-93% field accuracy compared to 96-98% for clean ones. The confidence score in the API response tells you how certain DocuExtract is about each extraction — use it to flag questionable results for manual review.

### Can I process receipts in batch, or is it one-at-a-time only?

The API processes one document per request, but you can parallelize requests easily. My batch script processes 120 receipts in about 5 minutes by sending multiple requests. There are rate limits per plan tier — the free tier allows 5 requests per minute, Starter allows 30/min, and higher plans allow more. See the [pricing page](/pricing) for rate limit details per tier.

### How does DocuExtract handle receipts that are photographed upside down or sideways?

It handles them automatically. DocuExtract uses Claude's vision capabilities to understand the document content regardless of orientation. I tested this extensively with one team member who photographs every receipt upside down — accuracy was 91-95%, comparable to right-side-up receipts of similar quality. No preprocessing or rotation needed on your end.

### What file formats are supported for receipt images?

DocuExtract accepts JPEG, PNG, WebP, and PDF files up to 10MB. For receipt photos from phones, JPEG is the most common and works well. You send the file as a base64-encoded string in the API request. The [docs](/docs) have the full specification.

### Is DocuExtract an OCR tool?

No. Traditional OCR extracts raw text from images and leaves you to parse the structure yourself. DocuExtract uses Claude's vision AI to understand the document holistically — it identifies what's a merchant name, what's a line item, what's a total, and returns structured JSON directly. That's why it handles messy layouts, mixed fonts, and inconsistent formatting better than OCR pipelines.
