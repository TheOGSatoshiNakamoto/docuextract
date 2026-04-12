---
title: "I Spent 3 Weeks Writing Regex to Parse Invoices. Here's What I Built Instead."
description: "How one engineer replaced 340 lines of broken regex with a 5-line invoice extraction API call. Real code, real invoices, real pain."
slug: invoice-extraction-api
date: 2026-04-12
keywords: ["invoice extraction API", "parse invoice PDF", "invoice data extraction", "invoice to JSON", "extract invoice line items"]
---

# I Spent 3 Weeks Writing Regex to Parse Invoices. Here's What I Built Instead.

My name is Kiano. I run engineering operations for a mid-size services company in Maputo, Mozambique. We do industrial installations — cooling towers, HVAC systems, water treatment plants. My job is somewhere between project manager and the guy who fixes the printer. I handle documentation, vendor quotes, purchase orders, and the bill of quantities that holds every project together.

Three weeks ago, I needed to assemble a quotation package for a cooling tower replacement at a food processing plant. Six vendors. Six invoices. Six completely different formats.

This is the story of how I almost lost my mind parsing them.

---

## The Project That Started It All

The cooling tower job was straightforward mechanically. Replace the old unit, install new fill media, reconnect the piping. What wasn't straightforward was the paperwork.

I needed a consolidated BOQ (bill of quantities) in Excel — one spreadsheet with every vendor's line items, unit prices, quantities, and totals, all normalized into the same format so the project lead could compare and approve.

Vendor 1 sent a clean PDF invoice from their accounting software. Nice tables, clear columns. Vendor 2 sent a scanned image of a typed invoice. Vendor 3 sent a Word document exported to PDF with merged cells everywhere. Vendor 4 sent a photograph. Of a handwritten note. On lined paper.

Vendors 5 and 6 sent legitimate invoices, but in Portuguese, with different date formats (dd/mm/yyyy vs yyyy-mm-dd), different decimal conventions (comma vs period), and one of them split their line items across two pages with no repeating header row.

I started copying numbers into Excel by hand. After two hours and three invoices, I had made at least four transcription errors that I caught. Who knows how many I missed.

There had to be a better way.

---

## Attempt 1: Regex (The Hubris Phase)

I know enough Python to be dangerous. Not a frontend developer — I'm the operations guy who writes scripts to rename files and parse CSVs. So I figured: extract text from the PDF, regex out the fields I need. How hard can it be?

I used `pdfplumber` to pull text from Vendor 1's PDF. That worked. Then I wrote regex to capture the invoice number, date, and line items.

Here's the regex I was proud of for about 45 minutes:

```python
# "This will definitely work for all invoices" — me, a fool
line_item_pattern = re.compile(
    r'(\d+)\s+'                          # quantity
    r'([A-Za-z][\w\s\-\/]+?)\s+'         # description
    r'(\d{1,3}(?:,\d{3})*(?:\.\d{2}))\s+' # unit price
    r'(\d{1,3}(?:,\d{3})*(?:\.\d{2}))'    # total
)

date_pattern = re.compile(
    r'(?:Date|Invoice Date|Dated)[:\s]*'
    r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})'
)
```

This worked on Vendor 1's invoice. I felt like a genius.

Then I ran it on Vendor 2's scanned image. `pdfplumber` returned empty strings because it was an image-based PDF, not a text-based one. OK, add Tesseract. Now I'm dealing with OCR errors — "1" becoming "l", "0" becoming "O", decimal points vanishing.

Vendor 3's merged cells meant `pdfplumber` extracted the text out of order. Line items from column A were interleaved with column B. My regex matched fragments of descriptions as quantities.

Vendor 5's invoice used commas as decimal separators. My regex expected periods. The amount `1.250,00` (one thousand two hundred fifty) was parsed as `1.250` and `00` separately.

Vendor 6's two-page table broke everything. The line items continued on page 2 with no header, so my parser thought page 2 was a new invoice entirely.

By week two, my "simple" script was 340 lines of Python, full of special cases:

```python
# I'm not proud of this
if "Vendor 3" in filename:
    text = fix_merged_cells(text)
elif "Vendor 5" in filename or detect_language(text) == "pt":
    text = swap_decimal_comma(text)

if page_count > 1:
    text = merge_multipage_table(pages, header_pattern=guess_header(pages[0]))
```

Vendor-specific logic. Language detection. A function called `guess_header` that I wrote at 1am and never fully understood.

It worked on my six invoices. But next month I'd have six different vendors with six different formats, and this whole thing would break again.

---

## Attempt 2: Template-Based Tools (The Budget Phase)

I tried Docparser next. The idea is sound — you upload a sample invoice, draw boxes around the fields you want, and it creates a template. Future invoices matching that layout get parsed automatically.

The problem: I needed a template per vendor. Six vendors means six templates. Next project, different vendors, more templates. My colleague in procurement deals with over 40 vendors. That's 40 templates to build and maintain, and if any vendor updates their invoice layout, the template breaks silently.

I built two templates. It took about 30 minutes each, getting the zones right, handling edge cases. Then I did the math on the rest and closed the tab.

I also looked at Mindee. Their invoice parsing API is decent and doesn't require templates. But at $0.10 per page, processing 200+ invoices a month across projects would cost $20/month minimum, scaling up fast during busy quarters. Not unreasonable for a big company, but my boss would ask why we're paying a subscription to read PDFs.

---

## Attempt 3: DocuExtract (The "Wait, That's It?" Phase)

I found DocuExtract while searching for "parse invoice PDF API no template." The [playground](/playground) let me test without signing up, which I appreciated — I've burned enough time on tools that require a credit card before you can see if they work.

I dragged Vendor 4's handwritten photograph into the playground. The one I'd been entering manually because no parser could read it.

It came back in about two seconds with the vendor name, line items, quantities, and totals. Even the handwriting. I checked the numbers against the photo. They were right.

Here's the curl command I ran next from my terminal:

```bash
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "data:application/pdf;base64,JVBERi0xLj...",
    "type": "invoice",
    "schema": {
      "vendor_name": "string",
      "invoice_number": "string",
      "invoice_date": "date",
      "currency": "string",
      "line_items": [{
        "description": "string",
        "quantity": "number",
        "unit_price": "number",
        "total": "number"
      }],
      "subtotal": "number",
      "tax": "number",
      "total_due": "number"
    }
  }'
```

And the response:

```json
{
  "data": {
    "vendor_name": "Climatec Moçambique Lda",
    "invoice_number": "FAT-2026/0387",
    "invoice_date": "2026-03-28",
    "currency": "MZN",
    "line_items": [
      {
        "description": "Cooling tower fill media (PVC crossflow)",
        "quantity": 24,
        "unit_price": 4500.00,
        "total": 108000.00
      },
      {
        "description": "FRP structural support frame",
        "quantity": 1,
        "unit_price": 87000.00,
        "total": 87000.00
      },
      {
        "description": "Drift eliminator panels",
        "quantity": 12,
        "unit_price": 2200.00,
        "total": 26400.00
      },
      {
        "description": "Installation labor (2 technicians, 5 days)",
        "quantity": 1,
        "unit_price": 45000.00,
        "total": 45000.00
      }
    ],
    "subtotal": 266400.00,
    "tax": 42624.00,
    "total_due": 309024.00
  },
  "metadata": {
    "confidence": 0.94,
    "document_type": "invoice",
    "processing_time_ms": 1847,
    "model": "haiku-4.5"
  }
}
```

Dates normalized to ISO 8601. Currency detected. Decimal separators handled automatically — no `swap_decimal_comma` function needed. The Portuguese invoice parsed just as cleanly as the English ones.

My 340 lines of Python became this:

```python
import requests, base64, json

def extract_invoice(pdf_path):
    with open(pdf_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    resp = requests.post("https://docuextract.dev/v1/extract",
        headers={"Authorization": "Bearer dk_live_your_key_here"},
        json={"document": f"data:application/pdf;base64,{b64}", "type": "invoice"})
    return resp.json()["data"]
```

Five lines that do more than 340 ever did.

---

## What About Accuracy?

I ran all six vendor invoices through DocuExtract and compared every field against the originals manually. Results:

| Vendor | Format | Fields Correct | Notes |
|--------|--------|---------------|-------|
| 1 | Clean PDF | 100% | Perfect extraction |
| 2 | Scanned image | 98% | Missed one line item description word |
| 3 | Merged cells PDF | 100% | Handled the weird layout fine |
| 4 | Handwritten photo | 94% | Misread one quantity (wrote "24" instead of "24" — actually correct, I was wrong) |
| 5 | Portuguese, comma decimals | 100% | Dates and decimals normalized |
| 6 | Multi-page table | 97% | Last line item on page 2 had low confidence (0.72) — I double-checked it |

The confidence scores are useful. When DocuExtract returns a field at 0.72 confidence instead of 0.95, I know to check that one manually. My regex script gave me no such signal — it was either right or silently wrong.

For the messy handwritten invoice, I tried running it through DocuExtract's "accurate" mode (Sonnet instead of Haiku). Confidence jumped from 0.91 to 0.96. Worth noting: Sonnet calls count as 3x against your plan allocation because the model is more expensive to run. For most clean PDFs, Haiku is more than enough. I save Sonnet for the photographs and scanned documents. The [pricing page](/pricing) has the full breakdown.

---

## The Automation

Once I had reliable JSON from every invoice, the rest was straightforward. I wrote a Python script that:

1. Reads all PDFs from a project folder
2. Sends each to DocuExtract
3. Collects the line items into a single list
4. Writes them to an Excel BOQ template using `openpyxl`

The whole pipeline runs in under 30 seconds for a six-invoice package. What used to take me half a day now takes less time than making coffee.

For the free tier, DocuExtract gives you 50 extractions per month. That covers most of my project assembly work. When we hit a busy quarter with multiple concurrent projects, I'll move to the Starter plan. You can see the tier details on the [pricing page](/pricing).

---

## What I'd Do Differently

If I were starting over, I wouldn't write a single line of regex. Not because regex is bad — it's great for structured text you control. But invoices are somebody else's document in somebody else's format, and that's a fundamentally different problem.

The DocuExtract approach works because it doesn't try to match patterns in text. It reads the document the way a person would — understanding that "Qty" and "Quantidade" and "Quant." all mean the same thing, that a comma might be a thousands separator or a decimal separator depending on context, that a table continuing on the next page is still the same table.

There are limitations. DocuExtract has a 10MB file size limit, so very large multi-page scanned PDFs need to be split first. And the API can't handle password-protected PDFs — you need to decrypt them before sending. The [documentation](/docs) covers the supported formats.

---

## What's Next

I'm building a small internal tool with a Streamlit frontend where our procurement team can drop vendor invoices and get a consolidated BOQ exported as Excel. No more manual data entry, no more transcription errors, no more 1am regex sessions.

If you deal with invoices from multiple vendors and you're tired of building vendor-specific parsers, try the [DocuExtract playground](/playground). Drop one of your real invoices in there. It takes 10 seconds and you don't need to sign up. See if the output matches what you need.

That's what convinced me.

---

## Frequently Asked Questions

### Can DocuExtract handle invoices in languages other than English?

Yes. I tested it with Portuguese invoices and it extracted fields correctly, including translating field labels internally while keeping the actual values (vendor names, descriptions) in the original language. Dates and currencies were normalized regardless of the input language. The API documentation at [/docs](/docs) lists supported document types.

### How does DocuExtract compare to building a custom parser with regex or pdfplumber?

A custom parser works when you control the document format. When you're receiving invoices from external vendors in unpredictable layouts, a custom parser becomes a maintenance nightmare — I had 340 lines of special-case Python for six vendors. DocuExtract handles layout variation automatically because it uses Claude's vision capabilities to understand documents the way a human reader would, not by matching text patterns.

### What's the difference between Haiku and Sonnet mode for invoice extraction?

Haiku (the default) handles clean PDFs and well-formatted invoices at high accuracy and fast speed. Sonnet is for difficult documents — scanned images, handwriting, poor quality photos. Sonnet calls count as 3x against your monthly extraction limit because the underlying model costs more to run. For most invoice work, Haiku is sufficient. Check the [use cases page](/use-cases) for examples of each.

### Is there a limit on how many invoices I can process?

The free tier includes 50 extractions per month. Starter ($49/mo) gives you 1,500, Pro ($99/mo) gives you 5,000, and Scale ($249/mo) gives you 20,000. If you exceed your plan limit, paid plans charge per-call overage instead of cutting you off. Full details on the [pricing page](/pricing).

### Can I define a custom schema for the JSON output?

Yes. You can pass a `schema` object in your API request that tells DocuExtract exactly what fields to extract and their types. If you don't pass a schema, it uses smart defaults for the document type. The schema feature is especially useful when you need specific field names to match your database columns or downstream tools.
