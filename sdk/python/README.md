# docuextract

Official Python SDK for the [DocuExtract API](https://docuextract-azure.vercel.app/docs).

Send a document, get structured JSON back. No templates. No training. Works in 2 minutes.

## Installation

```bash
pip install docuextract
```

## Quick Start

```python
from docuextract import DocuExtract

dex = DocuExtract("dex_live_YOUR_API_KEY")

# Extract from a URL
result = dex.extract("https://example.com/invoice.pdf", type="invoice")
print(result.data)
# {
#   'vendor_name': 'Acme Corp',
#   'invoice_number': 'INV-2024-0847',
#   'total_amount': 1250.0,
#   'currency': 'USD',
#   'line_items': [...]
# }

print(result.metadata.confidence)  # 0.96
```

## Usage

### Initialize

```python
import os
from docuextract import DocuExtract

dex = DocuExtract(os.environ["DOCUEXTRACT_KEY"])
```

### Extract structured data

```python
# From a URL
result = dex.extract("https://example.com/receipt.jpg", type="receipt")

# From a local file (base64)
import base64

with open("contract.pdf", "rb") as f:
    b64 = "data:application/pdf;base64," + base64.b64encode(f.read()).decode()

result = dex.extract(b64, type="contract")

# Use accurate mode for complex or multi-page documents
result = dex.extract(b64, model="accurate")

# Custom schema — extract exactly what you need
result = dex.extract(b64, schema={
    "party_names": "array of party names in this contract",
    "effective_date": "contract start date in ISO format",
    "governing_law": "jurisdiction for disputes",
})

print(result.data["party_names"])  # ['Acme Corp', 'Jane Smith']
```

### Detect document type

```python
detection = dex.detect("https://example.com/doc.pdf")
print(detection.type)        # "invoice"
print(detection.confidence)  # 0.98
```

### Check usage

```python
stats = dex.usage()
print(f"{stats.used} / {stats.limit} extractions used this month")
print(f"Plan: {stats.plan}, renews: {stats.period_end}")

for day in stats.breakdown:
    print(f"  {day.date}: {day.count} extractions")
```

### Error handling

```python
from docuextract import DocuExtract, DocuExtractAPIError

try:
    result = dex.extract(document)
except DocuExtractAPIError as e:
    print(f"Error {e.error}: {e.message} (HTTP {e.status})")

    if e.status == 429:
        # Rate limited — back off and retry
        pass
    elif e.status == 401:
        # Bad API key
        pass
```

### Context manager

```python
with DocuExtract(api_key) as dex:
    result = dex.extract(document)
# Session is automatically closed
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
