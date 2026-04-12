---
title: "Every Bank Formats Statements Differently. I Stopped Writing Parsers for Each One."
description: "A fintech developer's journey parsing European bank statements — date formats, decimal separators, and why a bank statement parser API saved the product."
slug: bank-statement-extraction-api
date: 2026-04-12
keywords: ["bank statement parser API", "bank statement extraction", "parse bank PDF", "transaction extraction API", "bank statement to JSON"]
---

# Every Bank Formats Statements Differently. I Stopped Writing Parsers for Each One.

I'm Tomas. I build a personal finance app in Lisbon called Caixa Clara — "clear box" in Portuguese. The idea is simple: connect your bank accounts, see all your transactions in one place, get spending insights. Standard fintech stuff.

For most users, Plaid handles the bank connection. Pull transaction data via API, display it in the app, done. But here's the thing about building a finance app in Europe: Plaid doesn't support every bank. Especially not the smaller ones.

My first beta testers were friends. Three of them used banks that Plaid couldn't connect to — Banco CTT (the postal bank), ActivoBank, and a small credit union in the Azores. They wanted to use the app. They were willing to upload their bank statements as PDFs. All I had to do was parse them.

"All I had to do."

---

## The Problem Looks Simple

Bank statements are tables. Columns: date, description, amount, balance. Maybe a debit/credit split. How hard can it be to parse a table?

I started with Millennium BCP, my own bank, because I had statements to test with.

```python
import pdfplumber

with pdfplumber.open("millennium_bcp_march_2026.pdf") as pdf:
    for page in pdf.pages:
        table = page.extract_table()
        for row in table:
            print(row)
```

Output looked decent. Rows with dates, descriptions, amounts. I wrote a parser that cleaned up the data, matched columns to fields, and produced a list of transaction objects. Took about a day. Tested on three months of my own statements. Worked.

I felt confident.

Then my friend Joana uploaded her Santander Totta statement.

---

## The European Date/Decimal Nightmare

Joana's statement used DD.MM.YYYY for dates. My Millennium BCP parser expected DD-MM-YYYY. Different separator. Easy fix, right?

Except Santander also uses periods as thousands separators and commas as decimal separators. A transaction for one thousand two hundred euros and fifty cents appears as:

```
1.200,50
```

My parser saw "1.200" and interpreted the period as a decimal point. It recorded a transaction for 1.20 euros instead of 1,200.50 euros.

I fixed the decimal handling with locale detection. Then a tester uploaded a statement from Banco CTT. Their dates use DD/MM/YYYY — forward slashes now. And their amounts have a space as the thousands separator:

```
1 200,50
```

My parser split "1 200,50" on the space and got "1" and "200,50" as two separate values.

Here's a table of what I was dealing with, and this is only three banks:

| Bank | Date Format | Thousands Sep | Decimal Sep | Debit/Credit |
|------|-------------|---------------|-------------|-------------|
| Millennium BCP | DD-MM-YYYY | . | , | Separate columns |
| Santander Totta | DD.MM.YYYY | . | , | Single column, negative for debit |
| Banco CTT | DD/MM/YYYY | (space) | , | "D"/"C" suffix |

By the time I'd written parsers for three banks, I had:

- A date normalizer handling three separator styles
- A decimal parser handling three thousands-separator conventions
- Column detection logic for each bank's unique table structure
- Special-case handling for Banco CTT's "D"/"C" debit/credit suffix

The code was 280 lines. And I only supported three banks out of roughly 30 that operate in Portugal.

---

## The Breaking Point

Week two. A tester named Miguel used ActivoBank. Their statements have a twist: transaction descriptions sometimes wrap to two lines, but `pdfplumber` extracts them as separate rows. My parser treated the continuation line as a new transaction with no date and no amount.

```python
# pdfplumber output for ActivoBank:
['15.03.2026', 'PAGAMENTO DE SERVICO', '', '-45,00', '1.234,56']
['', 'MULTIBANCO 12345 LISBOA', '', '', '']  # This is a continuation, not a new row
['16.03.2026', 'TRANSFERENCIA', '', '-200,00', '1.034,56']
```

I wrote a merge function that looked for rows without dates and concatenated their descriptions with the previous row. It worked for ActivoBank. Then I found that Millennium BCP sometimes also wraps long descriptions, but in a different pattern — they indent the continuation with extra spaces.

Every bank was its own special case. Every parser was brittle. And I hadn't even started on the Azores credit union, which sent statements as scanned PDFs — images, not text.

I was building a bank statement parser library when I was supposed to be building a personal finance app.

---

## Finding DocuExtract

I was on the Indie Hackers forum reading a thread about document parsing and someone mentioned DocuExtract. I checked the [playground](/playground) first — I've learned not to sign up for things before testing them.

I uploaded Miguel's ActivoBank statement. The one with the wrapping descriptions that broke my parser.

Response in 2.3 seconds:

```json
{
  "data": {
    "bank_name": "ActivoBank",
    "account_holder": "Miguel A. Ferreira",
    "account_number": "IBAN PT50 0023 XXXX XXXX XXXX XXX47",
    "statement_period": {
      "from": "2026-03-01",
      "to": "2026-03-31"
    },
    "currency": "EUR",
    "opening_balance": 1479.56,
    "closing_balance": 1034.56,
    "transactions": [
      {
        "date": "2026-03-15",
        "description": "PAGAMENTO DE SERVICO MULTIBANCO 12345 LISBOA",
        "amount": -45.00,
        "balance": 1234.56,
        "type": "debit"
      },
      {
        "date": "2026-03-16",
        "description": "TRANSFERENCIA",
        "amount": -200.00,
        "balance": 1034.56,
        "type": "debit"
      }
    ]
  },
  "metadata": {
    "confidence": 0.95,
    "document_type": "bank_statement",
    "processing_time_ms": 2287,
    "model": "haiku-4.5"
  }
}
```

The wrapped description was merged. "PAGAMENTO DE SERVICO MULTIBANCO 12345 LISBOA" — one transaction, one description. Dates normalized to ISO 8601 (YYYY-MM-DD). Amounts in standard decimal notation with period separators. Debits as negative numbers. Currency detected.

All the things my 280 lines of custom code tried to do, handled automatically.

I tested the Millennium BCP statement next. Different layout, different conventions. Same clean output format. Then Santander Totta. Same. Then the Banco CTT statement with its space-as-thousands-separator and D/C suffixes. Same clean JSON.

```bash
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "data:application/pdf;base64,JVBERi0xLj...",
    "type": "bank_statement"
  }'
```

One API call. No bank-specific logic. No date format detection. No decimal separator guessing. DocuExtract reads the document like a human would — it understands that "1.200,50" in a Portuguese bank statement means one thousand two hundred euros and fifty cents, not 1.200 and 50 separately.

---

## Haiku vs. Sonnet: When to Use Which

Most of my bank statements are clean PDFs generated by banking software. Haiku handles these perfectly — fast (under 2 seconds), accurate, cheap.

But the Azores credit union sends scanned paper statements. Photocopied, slightly crooked, with a watermark. On Haiku, I got 87% accuracy — most transactions correct, but a few amounts were off and some dates were misread.

I ran the same document through DocuExtract with Sonnet mode:

```bash
curl -X POST https://docuextract.dev/v1/extract \
  -H "Authorization: Bearer dk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "data:application/pdf;base64,JVBERi0xLj...",
    "type": "bank_statement",
    "model": "sonnet"
  }'
```

Accuracy jumped to 95%. The amounts that Haiku misread — mostly ones where the scan quality was poor — Sonnet got right. Processing time went from 1.8 to 3.4 seconds. Still fast.

The trade-off: Sonnet calls count as 3x against your plan allocation because the model costs more to run. For my use case, I default to Haiku for all clean PDF statements and only use Sonnet when the confidence score comes back below 0.88 on the first pass. The retry adds cost but catches the edge cases.

The [documentation](/docs) explains how to specify the model in your request.

---

## Integrating Into Caixa Clara

The integration into my app was straightforward. User uploads a PDF on the web frontend, my backend sends it to DocuExtract, parses the response, and inserts transactions into the database.

```python
import requests, base64

def parse_bank_statement(pdf_bytes):
    b64 = base64.b64encode(pdf_bytes).decode()
    response = requests.post(
        "https://docuextract.dev/v1/extract",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "document": f"data:application/pdf;base64,{b64}",
            "type": "bank_statement"
        }
    )
    data = response.json()
    
    if data["metadata"]["confidence"] < 0.88:
        # Retry with Sonnet for low-confidence results
        response = requests.post(
            "https://docuextract.dev/v1/extract",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json={
                "document": f"data:application/pdf;base64,{b64}",
                "type": "bank_statement",
                "model": "sonnet"
            }
        )
        data = response.json()
    
    return data["data"]["transactions"]
```

I replaced 280 lines of bank-specific parsing code with this. The entire parser module went from four files (one per bank plus a shared utilities file) to a single function.

The normalization DocuExtract does is the real time-saver. Dates come back as `YYYY-MM-DD` regardless of whether the source statement uses periods, slashes, or dashes. Amounts come back as standard floats — no more guessing whether a comma is a decimal separator or a thousands separator. Debit/credit is normalized to positive/negative numbers. I don't need locale detection or bank-specific formatting rules.

---

## What About Privacy?

This is a finance app. Bank statements contain sensitive data — account numbers, transaction histories, balances. I'd be irresponsible not to address this.

DocuExtract processes documents synchronously and doesn't store them after extraction. The document goes in, the JSON comes out, and the file isn't retained on their servers. That's what their [documentation](/docs) states. For my use case, this is acceptable — the PDF is transmitted over HTTPS, processed, and discarded.

I still show a clear consent screen before users upload. "Your bank statement will be sent to a third-party API for processing. It is not stored after extraction." Transparency matters, especially with financial data.

For users who aren't comfortable with this, I keep the manual transaction entry option available. About 20% of my users prefer to enter transactions by hand even when upload is available. That's fine.

---

## The Result

Three weeks after integrating DocuExtract, here's where Caixa Clara stands:

- **Banks supported via Plaid:** 12 (the major ones)
- **Banks supported via manual PDF upload:** effectively all of them
- **Time to parse a statement:** 2-4 seconds instead of "I'll build a parser next weekend"
- **Beta testers using the app daily:** went from 8 (Plaid-only) to 14 (including the 3 who upload PDFs)

Those three users — the ones with unsupported banks — are my most engaged testers. They upload statements weekly. They file bug reports. They suggest features. Losing them because I couldn't parse their bank's PDF format would have meant losing my best feedback loop.

DocuExtract costs me about $49/month on the Starter plan. My app processes roughly 40-60 statements per month (some users upload monthly, some weekly). Well within the 1,500 extraction limit. The [pricing page](/pricing) has the full breakdown if you want to estimate your own costs.

---

## What I'd Tell Other Fintech Developers

If you're building a finance app and thinking "I'll just write a PDF parser for bank statements," stop. I spent two weeks building parsers for three banks. DocuExtract handles all of them — plus every other bank I haven't encountered yet — with a single API call.

The European date/decimal problem alone will eat a week of your time. And that's before you deal with multi-line descriptions, scanned documents, or banks that put transaction tables in slightly different positions on the page.

There are limitations. DocuExtract can't handle password-protected PDFs (common with some European banks that email encrypted statements). You'll need to decrypt those first. And for statements with hundreds of transactions (6+ pages), I've seen occasional missed transactions near page breaks — always verify the transaction count and closing balance against what the statement says.

But for the 90% case — a standard bank statement PDF with 20-80 transactions — it works reliably and saves you from writing bank-specific code.

Try it on one of your statements in the [playground](/playground). Upload a real PDF, see the output. If it handles your bank's format correctly, you've just saved yourself a week of parsing code. If it doesn't, you've lost 30 seconds.

I'm going back to building the features my beta testers actually asked for — spending categories and budget alerts. The statement parsing problem is solved.

---

## Frequently Asked Questions

### Can DocuExtract handle bank statements from any country, not just Portugal?

DocuExtract uses Claude's vision AI to read documents, so it handles bank statements regardless of country, language, or formatting conventions. I've only tested extensively with Portuguese banks, but the same normalization that handles European decimal separators (comma) also handles American ones (period). Dates are always returned in ISO 8601 format (YYYY-MM-DD) regardless of the input format. If your bank produces a PDF statement with a readable table, DocuExtract should parse it. Test with the [playground](/playground) to verify.

### How does DocuExtract handle the difference between debit and credit transactions?

DocuExtract normalizes transactions with negative amounts for debits and positive amounts for credits, regardless of how the source statement represents them. Some banks use separate debit/credit columns, some use a single column with negative numbers, some use "D"/"C" suffixes. The API output is consistent — you always get a signed number. The `type` field in each transaction also explicitly says "debit" or "credit."

### Is DocuExtract secure enough for financial documents?

DocuExtract processes documents over HTTPS and does not retain uploaded files after extraction. For a personal finance app, this is a reasonable trade-off — the document is in transit briefly, processed, and the structured data is returned. I still recommend showing users a clear consent screen before uploading financial documents to any third-party service. Check the [docs](/docs) for their full data handling policy.

### What happens if DocuExtract misses a transaction or gets an amount wrong?

Always validate the output. I check the transaction count against the statement and verify the closing balance matches. When DocuExtract returns a confidence score below 0.88, I automatically retry with Sonnet mode (higher accuracy, counts as 3x against plan allocation). For truly problematic statements, I flag them for manual review. In practice, this affects about 5-10% of scanned documents and almost never happens with clean PDF statements.

### Can I use DocuExtract to reconcile bank statements with accounting records?

DocuExtract extracts the raw transaction data — date, description, amount, balance — from the statement PDF. Reconciliation logic (matching transactions to invoices, flagging discrepancies, categorizing expenses) is business logic you'd build on top of the extracted data. DocuExtract gives you the structured JSON; what you do with it is up to your application. Check the [use cases page](/use-cases) for more examples of how developers integrate the extracted data into their workflows.
