---
title: "Automate Receipt Processing with Python in 5 Minutes"
description: "Step-by-step tutorial: use Python to extract structured data from receipts automatically. Install the DocuExtract SDK, send a receipt image, get JSON back. Complete working code included."
slug: automate-receipt-processing-with-python
date: 2026-03-29
keywords: ["receipt OCR Python", "automate receipt processing", "extract data from receipt Python", "receipt parsing Python", "Python invoice extraction"]
---

# Automate Receipt Processing with Python in 5 Minutes

If you've ever built an expense tracking tool, a bookkeeping integration, or a reimbursement workflow, you know the pain: users upload receipt photos, and somehow you have to turn a JPEG of a coffee shop receipt into structured data your application can use.

Manual entry is slow and error-prone. Building your own OCR pipeline takes weeks and still struggles with curved text, bad lighting, and the infinite variety of receipt formats.

This tutorial shows you how to automate it in 5 minutes using Python and the DocuExtract API. By the end, you'll have working code that takes a receipt image (URL or file) and returns a clean Python dictionary with merchant name, date, total, line items, and more.

---

## What You'll Need

- Python 3.8+
- A DocuExtract API key (free at [docuextract.dev](https://docuextract.dev))
- The `docuextract` Python package

That's it. No Tesseract, no OpenCV, no custom models.

---

## Step 1: Install the SDK

```bash
pip install docuextract
```

If you prefer to use `requests` directly, that works too — we'll show both approaches.

---

## Step 2: Get Your API Key

Sign up at [docuextract.dev](https://docuextract.dev). Your API key is on the dashboard under API Keys. It looks like `dex_live_xxxxxxxxxxxxxxxx`.

Store it as an environment variable — never hardcode secrets in source code:

```bash
export DOCUEXTRACT_API_KEY="dex_live_your_key_here"
```

---

## Step 3: Extract a Receipt

Here's the complete working code:

```python
import os
from docuextract import DocuExtract

# Initialize the client
client = DocuExtract(api_key=os.environ["DOCUEXTRACT_API_KEY"])

# Extract from a URL
result = client.extract(
    document="https://example.com/receipts/coffee-shop-receipt.jpg",
    document_type="receipt",
)

print(f"Merchant: {result.data['merchant']['name']}")
print(f"Date: {result.data['date']}")
print(f"Total: {result.data['currency']} {result.data['total']}")
print(f"Confidence: {result.metadata.confidence:.1%}")
```

Output:

```
Merchant: Blue Bottle Coffee
Date: 2026-03-28
Total: USD 8.75
Confidence: 96.2%
```

---

## Step 4: See the Full Response

The `result.data` dictionary contains everything extracted from the receipt:

```python
import json

print(json.dumps(result.data, indent=2))
```

```json
{
  "merchant": {
    "name": "Blue Bottle Coffee",
    "address": "300 Webster St, Oakland, CA 94607",
    "phone": "(510) 653-3394"
  },
  "date": "2026-03-28",
  "time": "09:14",
  "line_items": [
    {
      "description": "Gibraltar",
      "quantity": 1,
      "unit_price": 5.50,
      "total": 5.50
    },
    {
      "description": "Almond Croissant",
      "quantity": 1,
      "unit_price": 3.25,
      "total": 3.25
    }
  ],
  "subtotal": 8.75,
  "tax": 0.00,
  "tip": null,
  "total": 8.75,
  "currency": "USD",
  "payment_method": "Visa ****4521",
  "receipt_number": "0042-8891"
}
```

---

## Step 5: Extract from an Uploaded File

If your users upload receipt photos, read the file and pass the path directly:

```python
# Extract from a local file
result = client.extract(
    document="/path/to/receipt.jpg",
    document_type="receipt",
)
```

The SDK handles the base64 encoding automatically. Supported formats: PDF, PNG, JPG, WEBP. Maximum size: 10MB.

---

## Step 6: Process a Batch of Receipts

Here's how to process multiple receipts and write the results to a CSV:

```python
import os
import csv
from pathlib import Path
from docuextract import DocuExtract

client = DocuExtract(api_key=os.environ["DOCUEXTRACT_API_KEY"])

receipt_dir = Path("./receipts")
output_file = "expenses.csv"

fieldnames = ["file", "merchant", "date", "total", "currency", "confidence"]

with open(output_file, "w", newline="") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for receipt_path in sorted(receipt_dir.glob("*.{jpg,jpeg,png,pdf}")):
        print(f"Processing {receipt_path.name}...")

        try:
            result = client.extract(
                document=str(receipt_path),
                document_type="receipt",
            )
            writer.writerow({
                "file": receipt_path.name,
                "merchant": result.data.get("merchant", {}).get("name", ""),
                "date": result.data.get("date", ""),
                "total": result.data.get("total", ""),
                "currency": result.data.get("currency", ""),
                "confidence": f"{result.metadata.confidence:.1%}",
            })

        except Exception as e:
            print(f"  Error: {e}")
            writer.writerow({
                "file": receipt_path.name,
                "merchant": "ERROR",
                "date": "", "total": "", "currency": "",
                "confidence": "0%",
            })

print(f"\nDone. Results saved to {output_file}")
```

---

## Using `requests` Directly (No SDK)

If you'd rather not install the SDK, here's the same extraction using `requests`:

```python
import os
import base64
import requests

API_KEY = os.environ["DOCUEXTRACT_API_KEY"]
BASE_URL = "https://docuextract.dev/v1"

def extract_receipt_from_url(url: str) -> dict:
    response = requests.post(
        f"{BASE_URL}/extract",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"document": url, "type": "receipt"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()

def extract_receipt_from_file(file_path: str) -> dict:
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")

    response = requests.post(
        f"{BASE_URL}/extract",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"document": encoded, "type": "receipt"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()

# Usage
result = extract_receipt_from_url("https://example.com/receipt.jpg")
data = result["data"]
print(f"{data['merchant']['name']} — {data['currency']} {data['total']}")
```

---

## Building a Flask API Endpoint

Here's how to wire this into a Flask app so users can upload receipts via a web form:

```python
import os
import base64
from flask import Flask, request, jsonify
from docuextract import DocuExtract

app = Flask(__name__)
client = DocuExtract(api_key=os.environ["DOCUEXTRACT_API_KEY"])

@app.route("/upload-receipt", methods=["POST"])
def upload_receipt():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Save temporarily and extract
    tmp_path = f"/tmp/{file.filename}"
    file.save(tmp_path)

    try:
        result = client.extract(
            document=tmp_path,
            document_type="receipt",
        )
        return jsonify({
            "merchant": result.data.get("merchant", {}).get("name"),
            "date": result.data.get("date"),
            "total": result.data.get("total"),
            "currency": result.data.get("currency"),
            "confidence": result.metadata.confidence,
            "raw": result.data,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    app.run(debug=True)
```

---

## Handling Low-Confidence Results

The confidence score tells you how certain the model is about the extraction. For automated workflows, you may want to flag low-confidence results for human review:

```python
CONFIDENCE_THRESHOLD = 0.85

result = client.extract(document=receipt_path, document_type="receipt")

if result.metadata.confidence < CONFIDENCE_THRESHOLD:
    # Flag for manual review
    queue_for_human_review(receipt_path, result.data)
    print(f"Low confidence ({result.metadata.confidence:.1%}) — queued for review")
else:
    # Process automatically
    save_to_database(result.data)
    print(f"Processed successfully ({result.metadata.confidence:.1%})")
```

A confidence score above 0.85 is generally safe to process automatically. Below that, a quick human glance catches edge cases — bad lighting, crumpled receipts, unusual layouts.

---

## Using "Accurate" Mode for Difficult Receipts

The default model handles most receipts well. For receipts with poor image quality, non-standard layouts, or non-English text, use `model="accurate"` to get higher accuracy:

```python
result = client.extract(
    document=receipt_path,
    document_type="receipt",
    model="accurate",  # Uses Claude Sonnet 4.6
)
```

Accurate mode is slower (~3-5 seconds vs ~1-2 seconds) and counts as a higher-tier extraction, but it significantly improves results on difficult documents.

---

## Next Steps

- **Try it now:** Drop a receipt into the [playground](https://docuextract.dev/playground) before writing any code.
- **Read the docs:** Full API reference and SDK documentation at [docuextract.dev/docs](https://docuextract.dev/docs).
- **Python SDK source:** Available on PyPI as `docuextract`.
- **Get your API key:** [docuextract.dev](https://docuextract.dev) — 100 free extractions/month.

The same API works for invoices, bank statements, contracts, resumes, and business cards. Once you have the pattern down, adding a new document type to your application takes minutes, not weeks.
