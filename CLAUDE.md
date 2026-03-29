# CLAUDE.md — DocuExtract

> **Read this file in full before starting ANY task.** This is your single source of truth.
> Last updated: 2026-03-29

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

### Single-Project Deployment

DocuExtract is a **single Next.js 14 App Router application** deployed as **one Vercel project**. Both the user-facing UI (landing page, playground, docs, dashboard) and the API (extraction, billing, webhooks) are served from the same deployment.

| Attribute | Value |
|-----------|-------|
| **Framework** | Next.js 14+ (App Router) |
| **Deployment** | Single Vercel project |
| **Root Directory** | Repo root (project root IS the Next.js app) |
| **UI Routes** | `/`, `/playground`, `/docs`, `/login`, `/dashboard/*` |
| **API Routes** | `/v1/extract`, `/v1/detect`, `/v1/usage`, `/v1/health`, `/v1/billing/*`, `/v1/webhooks/*` |
| **Current URL** | https://docuextract.dev |
| **Domain** | `docuextract.dev` (serves both UI and API from one deployment) |

The previous two-project architecture (separate API serverless functions + separate Next.js dashboard) has been retired. The old `docuextract-azure.vercel.app` deployment has been replaced by the unified deployment at `docuextract.dev`.

**Why single project:** Same-origin means no CORS configuration, one set of environment variables, one deployment pipeline, one `package.json`, and simpler debugging. API route handlers in Next.js have the same capabilities as raw Vercel serverless functions.

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **App Framework** | Next.js 14+ (App Router) on Vercel | Unified UI + API, React pages, route handlers, SSR |
| **Database** | Supabase (PostgreSQL + Auth + Storage) | Free tier generous, built-in auth, file storage for docs |
| **AI Engine** | Claude API (Haiku 4.5 for speed, Sonnet 4.6 for complex docs) | Best-in-class document extraction, consistent JSON output |
| **Billing** | Stripe (Subscriptions + Metered Billing) | Industry standard, usage-based billing support |
| **Monitoring** | Sentry (free tier) — planned | Error tracking, performance monitoring |
| **Domain** | docuextract.dev | Short, memorable, developer-oriented |

### System Flow
```
Developer Request (POST /v1/extract)
       ↓
[Next.js Route Handler — src/app/v1/extract/route.ts]
  - Validate API key (Supabase lookup via bcrypt hash)
  - Check rate limits (atomic SQL counters)
  - Log request
       ↓
[Input Processing — src/lib/documents/]
  - Accept: base64 or URL
  - Detect document type (invoice, receipt, contract, etc.)
  - Validate file size (<10MB) and format (PDF, PNG, JPG, WEBP)
       ↓
[Extraction Engine — src/lib/extraction/]
  - Build specialized system prompt based on document type
  - If custom schema provided, inject schema into prompt
  - Call Claude API (Haiku 4.5 default, Sonnet 4.6 for "accurate" mode)
  - Parse response, validate JSON structure
  - Retry once if malformed output
       ↓
[Post-Processing — src/lib/extraction/postprocess.ts]
  - Apply validation rules (dates, currencies, totals)
  - Calculate confidence score per field
  - Normalize data formats (ISO dates, standardized currencies)
       ↓
[Response]
  - Return clean JSON with extracted data
  - Include metadata: confidence, processing_time, document_type, model
  - Log usage to Supabase (fire-and-forget, non-blocking)
  - Report overage usage to Stripe if user exceeds plan limit
       ↓
[Async Billing]
  - Stripe aggregates usage and charges at period end
  - Webhooks sync subscription changes back to Supabase
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
  endpoint TEXT NOT NULL,
  document_type TEXT,
  model_used TEXT NOT NULL,
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

-- Webhook events (Stripe idempotency)
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Applied Migrations (001-009):**
- 001: Initial schema (users, api_usage, rate_limits, webhook_events)
- 002: API key functions (generate_api_key, lookup_user_by_api_key)
- 003: RLS policies
- 004: Rate limit atomic increment function (check_and_increment_rate_limit)
- 005: Auth trigger (handle_new_auth_user — auto-creates users row on signup) + regenerate_my_api_key RPC
- 006: create_user_with_api_key RPC
- 007: Fixed create_user_with_api_key signature (FK-safe)
- 008: Made handle_new_auth_user trigger defensive (EXCEPTION WHEN OTHERS)
- 009: Fixed lookup_user_by_api_key search_path to include 'extensions' (pgcrypto crypt() visibility)

### API Endpoints

All API routes are Next.js Route Handlers under `src/app/v1/`.

```
BASE URL: https://docuextract.dev (or current Vercel deployment URL)

Authentication: Bearer token (API key) in Authorization header

POST /v1/extract
  - Main extraction endpoint
  - Body: { document: <base64|url>, type?: <string>, schema?: <object>, model?: "fast"|"accurate" }
  - Returns: { data: {...}, metadata: { type, confidence, model, processing_time_ms, page_count } }

POST /v1/detect
  - Detect document type without extraction
  - Body: { document: <base64|url> }
  - Returns: { type: "invoice", confidence: 0.98 }

GET /v1/usage
  - Get current usage stats (requires auth)
  - Returns: { used, limit, plan, period_end, breakdown: [...] }

GET /v1/health
  - Health check (no auth required)
  - Returns: { status: "ok", version: "1.0.0" }

POST /v1/billing/checkout
  - Create Stripe Checkout session (requires auth)
  - Body: { plan: "starter"|"pro"|"scale" }
  - Returns: { url: "https://checkout.stripe.com/..." }

POST /v1/billing/portal
  - Create Stripe Billing Portal session (requires auth)
  - Returns: { url: "https://billing.stripe.com/..." }

POST /v1/webhooks/stripe
  - Stripe webhook handler (signature verified, no Bearer auth)
  - Handles: subscription.created/updated/deleted, invoice.payment_succeeded/failed
```

### Pricing Tiers (Stripe Products — Test Mode)

| Tier | Price | Extractions/month | Rate Limit | Model Access |
|------|-------|-------------------|------------|-------------|
| **Free** | $0 | 100 | 10/min | Haiku only |
| **Starter** | $49/mo | 2,500 | 30/min | Haiku + Sonnet |
| **Pro** | $99/mo | 10,000 | 60/min | Haiku + Sonnet |
| **Scale** | $249/mo | 50,000 | 120/min | Haiku + Sonnet + Priority |
| **Overage** | $0.05/extraction beyond plan limit | — | — | — |

**Stripe Price IDs (test mode):**
- Starter: price_1TEmTpKtX9wthBvgToGOwsi1
- Pro: price_1TEmajKtX9wthBvgQ2Fq8Few
- Scale: price_1TEmmwKtX9wthBvgNCP9f71m
- Overage: price_1TEmf0KtX9wthBvg7kOfbAyc

---

## 📁 Project Structure

Single Next.js application at the repo root. All dependencies in one `package.json`.

```
docuextract/
├── CLAUDE.md                        # THIS FILE — master context
├── README.md                        # Public repo README
├── package.json                     # Single package.json — all deps merged (Next.js, Anthropic, Supabase, Stripe, etc.)
├── next.config.js                   # Next.js configuration
├── tsconfig.json                    # TypeScript strict mode config
├── tailwind.config.js               # Tailwind CSS config
├── vercel.json                      # { "framework": "nextjs" }
├── .env.local                       # Environment variables (NEVER commit)
├── .env.example                     # Template for env vars
├── openapi.yaml                     # OpenAPI 3.0 spec (for RapidAPI listing)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout. NO AUTH. <html>, <body>, global CSS, metadata.
│   │   ├── page.tsx                 # Landing page (public). React component.
│   │   │
│   │   ├── playground/
│   │   │   └── page.tsx             # Interactive playground (public).
│   │   │
│   │   ├── docs/
│   │   │   └── page.tsx             # API documentation (public).
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts         # Supabase Auth callback (GET). Exchanges code for session.
│   │   │
│   │   ├── (auth)/                  # Route group. Auth boundary. No URL segment added.
│   │   │   ├── layout.tsx           # Auth layout. Checks session. Redirects if unauthenticated.
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login/signup page.
│   │   │   └── dashboard/
│   │   │       ├── page.tsx         # Dashboard home (protected).
│   │   │       ├── keys/
│   │   │       │   └── page.tsx     # API key management (protected).
│   │   │       ├── usage/
│   │   │       │   └── page.tsx     # Usage analytics (protected).
│   │   │       └── billing/
│   │   │           └── page.tsx     # Billing management (protected).
│   │   │
│   │   └── v1/                      # API route handlers (server-only)
│   │       ├── extract/
│   │       │   └── route.ts         # POST /v1/extract — main extraction
│   │       ├── detect/
│   │       │   └── route.ts         # POST /v1/detect — document type detection
│   │       ├── usage/
│   │       │   └── route.ts         # GET /v1/usage — usage stats
│   │       ├── health/
│   │       │   └── route.ts         # GET /v1/health — health check
│   │       ├── billing/
│   │       │   ├── checkout/
│   │       │   │   └── route.ts     # POST /v1/billing/checkout
│   │       │   └── portal/
│   │       │       └── route.ts     # POST /v1/billing/portal
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts     # POST /v1/webhooks/stripe
│   │
│   ├── lib/                         # Server-only shared logic
│   │   ├── auth.ts                  # API key validation, user lookup, 60s cache
│   │   ├── billing.ts               # Stripe client, checkout, portal, metered usage
│   │   ├── claude.ts                # Claude API client, retry logic, model selection
│   │   ├── extraction/
│   │   │   ├── engine.ts            # Core extraction orchestration
│   │   │   ├── prompts.ts           # System prompts per document type (8 types + generic)
│   │   │   ├── schemas.ts           # Output schemas and per-type normalization
│   │   │   └── postprocess.ts       # Date/currency normalization, confidence scoring
│   │   ├── documents/
│   │   │   ├── input.ts             # Input processing (base64, URL)
│   │   │   ├── detect.ts            # Document type detection via Claude
│   │   │   └── validate.ts          # File size, format, MIME validation
│   │   ├── ratelimit.ts             # Atomic rate limiting (per-minute + per-month)
│   │   ├── usage.ts                 # Usage logging + stats retrieval
│   │   ├── errors.ts                # Standardized error responses
│   │   └── types.ts                 # TypeScript type definitions
│   │
│   └── components/                  # Client-side React components
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── UsageChart.tsx
│       ├── PlaygroundForm.tsx
│       └── ...
│
├── supabase/
│   └── migrations/                  # SQL migrations 001-009 (all applied)
│
├── sdk/
│   ├── javascript/                  # npm-ready, TypeScript, fetch-based
│   └── python/                      # PyPI-ready, requests-based
│
├── scripts/
│   ├── seed-stripe.ts
│   ├── generate-api-key.ts
│   └── test-billing-e2e.ts
│
└── tests/
    └── fixtures/                    # 14 sample documents (invoices, receipts, resumes, business cards)
```

### Key Architectural Patterns

**Root Layout (`src/app/layout.tsx`) — NO Auth**
- Contains ONLY: `<html>`, `<body>`, global CSS imports, metadata (title, description, OG tags)
- Must NEVER contain Supabase Auth provider, session wrapper, or authentication logic
- This keeps all top-level routes (`/`, `/playground`, `/docs`, `/v1/*`) public by default

**Auth Route Group (`src/app/(auth)/layout.tsx`) — Dashboard Only**
- Wraps ONLY dashboard routes in Supabase Auth
- The `(auth)` prefix does NOT add a URL segment — `/dashboard` and `/login` are the actual URLs
- Initializes Supabase browser client
- Checks for active session on mount
- If no session and route is NOT `/login` → redirect to `/login`
- If session exists and route IS `/login` → redirect to `/dashboard`
- Passes user/session data to children via React context
- Listens for `onAuthStateChange` for real-time session updates

**Auth Callback Route (`/auth/callback/route.ts`)**
- Next.js API route (GET) that handles Supabase email confirmation redirect
- Extracts `code` query parameter
- Calls `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `/dashboard` on success, `/login?error=confirmation_failed` on failure

**API Route Handlers (`src/app/v1/*/route.ts`) — Server-Only**
- These are Next.js Route Handlers, NOT pages. They export `GET`, `POST`, etc. functions.
- They replace the old `api/v1/*.ts` Vercel serverless functions
- They import from `src/lib/` which contains all server-only logic
- They run server-side only — never bundled into the client

**Server-Only Enforcement (`src/lib/`)**
- Every file in `src/lib/` MUST include `import 'server-only'` at the top
- This prevents accidental import of server code (API keys, secrets) into client components
- This replaces the old two-project separation as the security boundary

### Supabase Dashboard Configuration (after deployment)
Set in Supabase Dashboard > Authentication > URL Configuration:
- **Site URL**: The deployed Vercel URL (e.g., `https://docuextract.dev`)
- **Redirect URLs**: `https://<deployment-url>/auth/callback`

---

## 🔑 Environment Variables

Single `.env.local` file at the repo root. One Vercel project, one set of environment variables.

```env
# Supabase — server-side (DO NOT prefix with NEXT_PUBLIC_)
SUPABASE_URL=https://jdvogyzrawcwxlrambpd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Supabase — client-side (NEXT_PUBLIC_ prefix required for browser access)
NEXT_PUBLIC_SUPABASE_URL=https://jdvogyzrawcwxlrambpd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Claude API — server-side only (DO NOT prefix with NEXT_PUBLIC_)
ANTHROPIC_API_KEY=sk-ant-...

# Stripe — server-side only (DO NOT prefix with NEXT_PUBLIC_)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_1TEmTpKtX9wthBvgToGOwsi1
STRIPE_PRICE_PRO=price_1TEmajKtX9wthBvgQ2Fq8Few
STRIPE_PRICE_SCALE=price_1TEmmwKtX9wthBvgNCP9f71m
STRIPE_PRICE_OVERAGE=price_1TEmf0KtX9wthBvg7kOfbAyc

# Stripe — client-side (for Checkout redirect)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL (for Supabase auth redirects and internal references)
NEXT_PUBLIC_APP_URL=https://<vercel-deployment-url>

# Vercel (for log access during debugging)
VERCEL_TOKEN=vcp_...
```

**CRITICAL SECURITY RULE:** Never prefix secret variables with `NEXT_PUBLIC_`. Variables without the prefix are server-only and invisible to the browser. Variables WITH the prefix are bundled into client JavaScript and visible to anyone. The following must NEVER have `NEXT_PUBLIC_`:
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Server-only enforcement is handled by adding `import 'server-only'` to all files in `src/lib/`. This causes a build error if any client component tries to import server code.

---

## 🧪 Testing Strategy

- **Unit tests**: Each lib/ module has corresponding test file
- **E2E billing test**: `scripts/test-billing-e2e.ts`
- **Manual testing**: Playground for real document extraction
- **Test documents**: 14 samples in tests/fixtures/

---

## 📏 Code Standards

- **Language**: TypeScript (strict mode) for everything
- **Framework**: Next.js 14+ App Router
- **Runtime**: Node.js 20+
- **Formatting**: Prettier (default config)
- **CSS**: Tailwind CSS for UI components
- **Error handling**: All API route handlers use standardized error format from src/lib/errors.ts
- **Logging**: Structured JSON logs. Use VERCEL_TOKEN for log access.
- **Comments**: Explain WHY, not WHAT.
- **Server isolation**: Every file in `src/lib/` starts with `import 'server-only'`

---

## 🚨 Critical Rules for Claude Code

1. **NEVER commit .env files or API keys.** Use .env.example as template.
2. **NEVER skip input validation.** Every route handler validates all inputs.
3. **ALWAYS handle Claude API errors gracefully.** Retry once on malformed output.
4. **ALWAYS log usage to Supabase** on every extraction call. Fire-and-forget.
5. **ALWAYS report overage usage to Stripe** when user exceeds plan limit.
6. **ALWAYS return standardized error responses** using src/lib/errors.ts.
7. **NEVER expose Supabase service role key** in client-side code.
8. **Keep route handlers lean** — import only what's needed.
9. **Use Haiku 4.5 as default model** — Sonnet only when user requests "accurate".
10. **All money values in cents** internally (Stripe convention).
11. **Root layout (src/app/layout.tsx) must NEVER contain auth wrappers.** Auth goes ONLY in `(auth)/layout.tsx`.
12. **Never add NEXT_PUBLIC_ prefix to ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, or SUPABASE_SERVICE_ROLE_KEY.** Add `import 'server-only'` to ALL files in `src/lib/`.
13. **Present implementation plans to Kiano** before large architectural changes.

---

## 🔌 Platform Access (MCP Tools)

You have direct MCP access to these platforms. **Use them instead of asking Kiano.**

| Platform | What You Can Do |
|----------|----------------|
| **Notion** | Read/write tasks, update statuses, log issues |
| **Supabase** | Run SQL, manage tables, deploy migrations |
| **Stripe** | Create products/prices, manage subscriptions, configure webhooks |
| **Vercel** | Deploy the single project, configure env vars, check status, read logs |
| **GitHub** | Read repo contents, manage files |

**Only flag for Kiano when:** signup/payment required, domain purchase, physical-world tasks.

---

## 📋 Notion Command Center

> **Check Notion for tasks and updates at every session start.**

### Workspace Link
**🔗 https://www.notion.so/DocuExtract-HQ-Command-Center-32d995287c1281d19ed3e8cd95a36138**

### Workspace Structure

| Page | Purpose |
|------|---------|
| **Claude Code Tasks** | YOUR task queue with specs and acceptance criteria |
| **Claude Code — Issues & Suggestions** | YOUR feedback channel for bugs, questions, decisions |
| **Kiano Tasks** | Tasks for Kiano — do NOT work on these |
| **Architecture & Technical Spec** | Technical reference |
| **Research & Market Intelligence** | Market research and competitor data |
| **Daily Progress Log** | Log what you completed each session |

### Your Workflow
1. Read this CLAUDE.md
2. Check "Claude Code Tasks" for Queued/In Progress tasks
3. Pick highest priority Queued task with no unresolved dependencies
4. Set status to "In Progress"
5. Build following this file's architecture
6. Set status to "Done" with completion notes
7. Log issues/questions in Issues & Suggestions database
8. Update the Daily Progress Log
9. Move to next task

### Issues & Suggestions Types
- **Bug / Issue**: Unexpected behavior found during implementation
- **Suggestion**: Improvement idea for architecture, DX, or performance
- **Question for CEO**: Need strategic decision
- **Question for Kiano**: Need something from the human operator
- **Technical Debt**: Shortcut taken that needs revisiting
- **Decision Needed**: Fork in the road requiring guidance

---

## 🗺️ Build Phases & Status

### Phase 1: Foundation ✅ COMPLETE
### Phase 2: Core Engine ✅ COMPLETE
### Phase 3: Billing ✅ COMPLETE
### Phase 4: Developer Experience ✅ COMPLETE
### Phase 5: Distribution & Launch 🔄 IN PROGRESS

**Current work:**
- Migrating `api/v1/*.ts` serverless functions into `src/app/v1/*/route.ts` Next.js Route Handlers
- Merging the old root `package.json` (API deps) with `dashboard/package.json` (Next.js deps) into a single `package.json`
- Converting static HTML pages (landing, playground, docs) into React components
- Implementing the `(auth)` route group for dashboard-only auth wrapping
- Adding `import 'server-only'` to all `src/lib/` files

**Remaining after migration:**
- Deploy unified app to Vercel
- Update Supabase Auth redirect URLs to new deployment URL
- Generate OpenAPI 3.0 spec for RapidAPI
- List API on RapidAPI marketplace
- Set up Sentry error tracking
- Write 3 SEO blog posts
- Prepare Product Hunt and Hacker News launch
- Purchase domain (Kiano)

---

## 📊 Key URLs & Resources

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/TheOGSatoshiNakamoto/docuextract |
| App (Vercel) | https://docuextract.dev |
| Supabase Project | https://jdvogyzrawcwxlrambpd.supabase.co |
| Stripe Dashboard (Test) | https://dashboard.stripe.com/test |
| Notion HQ | https://www.notion.so/DocuExtract-HQ-Command-Center-32d995287c1281d19ed3e8cd95a36138 |
