# CLAUDE.md — DocuExtract API

> **Read this file in full before starting ANY task.** This is your single source of truth.
> Last updated: 2026-03-24

---

## 🎯 What We're Building

**DocuExtract** is a developer-facing REST API that converts unstructured documents (invoices, receipts, contracts, forms, resumes) into clean, validated JSON. Developers send a document (image, PDF, or URL), specify what they want extracted, and receive structured data back in seconds.

**One-liner:** "Send a document, get JSON back. No templates. No training. Works in 5 minutes."

---

## 🧭 Business Context

### The Problem We Solve
Every SaaS company, fintech, logistics platform, and accounting tool needs to extract structured data from documents. Building this in-house takes weeks, edge cases are endless, and maintenance is perpetual. Existing solutions (Docparser, Parseur, Mindee, Veryfi) require template configuration, charge $100-500+/month, and have poor developer experience.

### Who We Serve (Personas)
1. **Indie developers** building expense trackers, invoice tools, or receipt scanners
2. **Small SaaS companies** (5-50 employees) that process documents as part of their product
3. **Agencies and freelancers** automating data entry for clients
4. **Automation builders** on Zapier, Make, and n8n who need document parsing nodes

### Revenue Target
- **$10,000 MRR** (Monthly Recurring Revenue)
- Path: ~100 customers × $100/month average
- Pricing: Tiered subscriptions + usage-based overages

### Competitive Advantage
1. **Zero configuration** — No templates, no training, no rules. Send any document, get data back.
2. **Developer-first DX** — Single endpoint, clean JSON, SDKs, playground, docs that don't suck.
3. **Transparent pricing** — Simple per-page tiers. No credit multipliers, no enterprise-gating.
4. **Claude-powered accuracy** — 90-97% extraction accuracy with built-in validation and confidence scores.

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **API Runtime** | Vercel Serverless Functions (Node.js) | Zero-config deployment, auto-scaling, edge network |
| **Database** | Supabase (PostgreSQL + Auth + Storage) | Free tier generous, built-in auth, file storage for docs |
| **AI Engine** | Claude API (Haiku 4.5 for speed, Sonnet 4.6 for complex docs) | Best-in-class document extraction, consistent JSON output |
| **Billing** | Stripe (Subscriptions + Metered Billing) | Industry standard, usage-based billing support |
| **Docs** | Mintlify or custom MDX on Vercel | Developer-friendly, searchable |
| **Monitoring** | Sentry (free tier) | Error tracking, performance monitoring |
| **Domain** | TBD (e.g., docuextract.com or extractapi.dev) | Short, memorable, developer-oriented |

### System Flow
```
Developer Request
       ↓
[Vercel API Gateway]
  - Validate API key (Supabase lookup)
  - Check rate limits
  - Log request
       ↓
[Input Processing]
  - Accept: base64, URL, or Supabase Storage reference
  - Detect document type (invoice, receipt, contract, etc.)
  - Validate file size (<10MB) and format (PDF, PNG, JPG, WEBP)
       ↓
[Extraction Engine]
  - Build specialized system prompt based on document type
  - If custom schema provided, inject schema into prompt
  - Call Claude API (Haiku 4.5 default, Sonnet 4.6 for complex)
  - Parse response, validate JSON structure
  - Retry once if malformed output
       ↓
[Post-Processing]
  - Apply validation rules (dates, currencies, totals)
  - Calculate confidence score per field
  - Normalize data formats (ISO dates, standardized currencies)
       ↓
[Response]
  - Return clean JSON with extracted data
  - Include metadata: confidence, processing_time, document_type
  - Log usage to Supabase (for billing metering)
  - Report usage event to Stripe
       ↓
[Async]
  - Stripe handles invoicing at period end
  - Usage dashboard updates in real-time
```

### Database Schema (Supabase PostgreSQL)

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL DEFAULT generate_api_key(),
  api_key_hash TEXT NOT NULL, -- bcrypt hash for lookup
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- free, starter, pro, scale
  monthly_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  endpoint TEXT NOT NULL, -- /v1/extract, /v1/detect, etc.
  document_type TEXT, -- invoice, receipt, contract, etc.
  model_used TEXT NOT NULL, -- haiku-4.5, sonnet-4.6
  input_tokens INTEGER,
  output_tokens INTEGER,
  processing_time_ms INTEGER,
  confidence_score NUMERIC(4,3),
  status TEXT NOT NULL, -- success, error, rate_limited
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting
CREATE TABLE public.rate_limits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id),
  requests_this_minute INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  minute_reset_at TIMESTAMPTZ,
  month_reset_at TIMESTAMPTZ
);

-- Webhook events (Stripe)
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

```
BASE URL: https://api.docuextract.com/v1

Authentication: Bearer token (API key) in Authorization header

POST /v1/extract
  - Main extraction endpoint
  - Body: { document: <base64|url>, type?: <string>, schema?: <object>, model?: "fast"|"accurate" }
  - Returns: { data: {...}, confidence: 0.96, type: "invoice", processing_time_ms: 1200 }

POST /v1/detect
  - Detect document type without extraction
  - Body: { document: <base64|url> }
  - Returns: { type: "invoice", confidence: 0.98 }

GET /v1/usage
  - Get current usage stats
  - Returns: { used: 847, limit: 5000, plan: "pro", period_end: "2026-04-24" }

GET /v1/health
  - Health check (no auth required)
  - Returns: { status: "ok", version: "1.0.0" }
```

### Pricing Tiers (Stripe Products)

| Tier | Price | Extractions/month | Rate Limit | Model Access |
|------|-------|-------------------|------------|-------------|
| **Free** | $0 | 100 | 10/min | Haiku only |
| **Starter** | $49/mo | 2,500 | 30/min | Haiku + Sonnet |
| **Pro** | $99/mo | 10,000 | 60/min | Haiku + Sonnet |
| **Scale** | $249/mo | 50,000 | 120/min | Haiku + Sonnet + Priority |
| **Overage** | $0.05/extraction beyond plan limit | — | — | — |

---

## 📁 Project Structure

```
docuextract/
├── CLAUDE.md                    # THIS FILE — master context
├── README.md                    # Public repo README
├── package.json                 # Root package config
├── vercel.json                  # Vercel deployment config
├── .env.local                   # Local environment variables (NEVER commit)
├── .env.example                 # Template for env vars
│
├── api/                         # Vercel serverless functions
│   └── v1/
│       ├── extract.ts           # POST /v1/extract — main extraction
│       ├── detect.ts            # POST /v1/detect — document type detection
│       ├── usage.ts             # GET /v1/usage — usage stats
│       ├── health.ts            # GET /v1/health — health check
│       └── webhooks/
│           └── stripe.ts        # POST /v1/webhooks/stripe — Stripe webhooks
│
├── lib/                         # Shared library code
│   ├── auth.ts                  # API key validation, user lookup
│   ├── billing.ts               # Stripe integration, usage reporting
│   ├── claude.ts                # Claude API client, prompt management
│   ├── extraction/
│   │   ├── engine.ts            # Core extraction logic
│   │   ├── prompts.ts           # System prompts per document type
│   │   ├── schemas.ts           # Output schemas and validation
│   │   └── postprocess.ts       # Data normalization, confidence scoring
│   ├── documents/
│   │   ├── input.ts             # Input processing (base64, URL, storage)
│   │   ├── detect.ts            # Document type detection
│   │   └── validate.ts          # File size, format validation
│   ├── ratelimit.ts             # Rate limiting logic
│   ├── usage.ts                 # Usage tracking and metering
│   ├── errors.ts                # Standardized error responses
│   └── types.ts                 # TypeScript type definitions
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_api_key_functions.sql
│       └── 003_rls_policies.sql
│
├── scripts/
│   ├── seed-stripe.ts           # Create Stripe products/prices
│   └── generate-api-key.ts      # Utility to generate API keys
│
├── docs/                        # API documentation (Mintlify or MDX)
│   ├── introduction.mdx
│   ├── quickstart.mdx
│   ├── authentication.mdx
│   ├── extract.mdx
│   ├── detect.mdx
│   ├── pricing.mdx
│   └── errors.mdx
│
├── sdk/                         # Client SDKs
│   ├── javascript/
│   │   ├── package.json
│   │   └── src/index.ts
│   └── python/
│       ├── setup.py
│       └── docuextract/client.py
│
├── dashboard/                   # Developer dashboard (Next.js on Vercel)
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── usage/page.tsx   # Usage analytics
│   │   │   ├── keys/page.tsx    # API key management
│   │   │   └── billing/page.tsx # Billing & plan management
│   │   ├── playground/
│   │   │   └── page.tsx         # Interactive API playground
│   │   └── docs/
│   │       └── page.tsx         # Embedded documentation
│   └── components/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── UsageChart.tsx
│       └── PlaygroundForm.tsx
│
├── tasks/                       # Task specs for Claude Code
│   ├── CURRENT_TASK.md          # Active task being worked on
│   ├── completed/               # Completed task specs
│   └── backlog/                 # Upcoming task specs
│
└── tests/
    ├── api/
    │   ├── extract.test.ts
    │   ├── detect.test.ts
    │   └── auth.test.ts
    └── lib/
        ├── extraction.test.ts
        └── postprocess.test.ts
```

---

## 🔑 Environment Variables

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only, never expose

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_SCALE=price_...

# App
API_BASE_URL=https://api.docuextract.com
DASHBOARD_URL=https://docuextract.com
```

---

## 🧪 Testing Strategy

- **Unit tests**: Each lib/ module has corresponding test file
- **Integration tests**: Test full API flow with mock Claude responses
- **Manual testing**: Use Playground to test with real documents
- **Test documents**: Store sample invoices/receipts in tests/fixtures/

---

## 📏 Code Standards

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 20+ (Vercel default)
- **Formatting**: Prettier (default config)
- **Linting**: ESLint with TypeScript plugin
- **Error handling**: All API responses use standardized error format from lib/errors.ts
- **Logging**: Structured JSON logs for Vercel observability
- **Comments**: Explain WHY, not WHAT. Code should be self-documenting.

---

## 🚨 Critical Rules for Claude Code

1. **NEVER commit .env files or API keys.** Use .env.example as template.
2. **NEVER skip input validation.** Every endpoint validates all inputs before processing.
3. **ALWAYS handle Claude API errors gracefully.** Retry once on malformed output, return clear error to user.
4. **ALWAYS log usage to Supabase** on every extraction call (success or failure).
5. **ALWAYS report usage to Stripe** for metered billing.
6. **ALWAYS return standardized error responses** using lib/errors.ts format.
7. **NEVER expose Supabase service role key** in client-side code.
8. **Keep serverless functions lean** — import only what's needed, cold starts matter.
9. **Use Haiku 4.5 as default model** — only use Sonnet when user explicitly requests "accurate" mode.
10. **All money values in cents** internally (Stripe convention), convert for display only.

---

## 📋 Notion Command Center (Project Management Hub)

> **This project is managed through a Notion workspace. You MUST check it for tasks and updates.**

### Workspace Link
**🔗 https://www.notion.so/DocuExtract-HQ-Command-Center-32d995287c1281d19ed3e8cd95a36138**

### Workspace Structure
The Notion workspace contains:

| Page | Purpose | Link |
|------|---------|------|
| **DocuExtract HQ — Command Center** | Main hub, decisions log, current phase | [Open](https://www.notion.so/32d995287c1281d19ed3e8cd95a36138) |
| **Claude Code Tasks** | YOUR task queue — tasks assigned to you with specs, acceptance criteria, priorities | Database under HQ page |
| **Kiano Tasks** | Tasks assigned to Kiano (human operator) — do NOT work on these | Database under HQ page |
| **Architecture & Technical Spec** | Detailed technical reference (supplements this file) | [Open](https://www.notion.so/32d995287c128133b02ee6dd36e0e4af) |
| **Research & Market Intelligence** | Market research, competitor data, case studies | [Open](https://www.notion.so/32d995287c12811a8378d4ad0217b1ab) |
| **Daily Progress Log** | Where you log what you completed each session | [Open](https://www.notion.so/32d995287c1281738f76c6e3876d75e3) |

### Your Workflow (Claude Code)

1. **Start of session:** Read this CLAUDE.md file, then check the "Claude Code Tasks" database in Notion for tasks with Status = "Queued" or "In Progress"
2. **Pick the highest priority Queued task** (P0 > P1 > P2 > P3) that has no unresolved dependencies
3. **Read the full task spec** by opening the task page in Notion — it contains acceptance criteria and detailed instructions
4. **Set status to "In Progress"** before you start working
5. **Build the solution** following the architecture in this file
6. **When complete:** Set status to "Done" and write a summary in the "Completion Notes" field
7. **Update the Daily Progress Log** with what you accomplished
8. **Move to the next Queued task** or stop if no more tasks are available

### Communication Protocol
- **Claude (Strategist on claude.ai)** creates tasks, reviews your work, and adjusts priorities
- **You (Claude Code)** execute development tasks and report completion in Notion
- **Kiano (Human Operator)** handles physical-world tasks (account setup, domain purchase, deployments)
- If you are **blocked** by a dependency (e.g., waiting for Kiano to provide credentials), set the task status to "Blocked" and move to the next available task
- If you encounter a **technical decision** not covered in this file, document it in Completion Notes and flag it for review

### Task File Mirror (Backup)
As a backup in case Notion is inaccessible, the active task should also be mirrored in:
- `tasks/CURRENT_TASK.md` — copy of the active task spec
- `tasks/completed/` — completed task specs with notes
- `tasks/backlog/` — upcoming task specs

**Notion is the source of truth.** The repo task files are a convenience mirror.

---

## 🗺️ Build Phases (30-Day Plan)

### Phase 1: Foundation (Days 1-3)
- Project scaffolding, Supabase schema, Vercel config
- Basic auth (API key generation and validation)
- Health endpoint

### Phase 2: Core Engine (Days 4-10)
- Extraction engine with Claude integration
- Document type detection
- Input processing (base64, URL)
- Post-processing and validation
- Error handling

### Phase 3: Billing (Days 11-14)
- Stripe product/price setup
- Usage tracking and metering
- Rate limiting
- Webhook handling

### Phase 4: Developer Experience (Days 15-20)
- API documentation
- JavaScript and Python SDKs
- Interactive playground
- Developer dashboard (signup, API keys, usage)

### Phase 5: Distribution (Days 21-30)
- Landing page
- RapidAPI listing
- SEO content (3-5 blog posts)
- Product Hunt and Hacker News launch prep
- n8n/Zapier/Make integrations
