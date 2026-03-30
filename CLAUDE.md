# CLAUDE.md — DocuExtract

> **Read this file in full before starting ANY task.** This is your single source of truth.
> Last updated: 2026-03-30

---

## 🎯 What We're Building

**DocuExtract** is a developer-facing REST API that converts unstructured documents (invoices, receipts, contracts, forms, resumes) into clean, validated JSON. Developers send a document (image, PDF, or URL), specify what they want extracted, and receive structured data back in seconds.

**One-liner:** "Send a document, get JSON back. No templates. No training. Works in 5 minutes."

**Market position:** The "Resend of document extraction" — indie roots, premium execution. We set the new standard for developer experience in document extraction, the way Stripe set the standard for payments and Vercel set the standard for deployments.

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
- Path: ~200 mixed paid users across tiers (~100 Starter × $49 + ~50 Pro × $99 = ~$9,850)
- Requires ~4,000 free users at 5% free-to-paid conversion
- Requires ~40,000 website visitors at 10% visitor-to-signup conversion
- Channels: SEO blog content, Hacker News, build-in-public Twitter, RapidAPI marketplace

### Competitive Advantage
1. **Zero configuration** — No templates, no training, no rules. Send any document, get data back.
2. **Developer-first DX** — Single endpoint, clean JSON, SDKs, playground, docs that don't suck.
3. **Transparent pricing** — Simple per-page tiers. No credit multipliers, no enterprise-gating.
4. **Claude-powered accuracy** — 90-97% extraction accuracy with built-in validation and confidence scores.
5. **Premium visual craft** — Dark-mode-first, Stripe-tier design quality signals the API is built with the same care.

---

## 🎨 Brand & DX Strategy

> **This section is the creative and strategic compass for all UI, copy, email, and design work. Read it before building ANY user-facing page or component.**

### Brand Voice: "Casual but Premium"

The target voice is **"confident solo builder meets polished small team"** — technically precise, conversationally direct, never corporate. This is the voice of someone who built the tool they wished existed and is genuinely proud of the craft.

**Do:**
- Lead with what the product does, not what it is: "Extract structured data from any document" NOT "DocuExtract is a document extraction platform"
- Use specific numbers: "<2 second processing · 99.5% accuracy · 20+ document types"
- Write in first person when personal, second person when instructional: "I built this because parsing PDFs is unreasonably hard" (blog) vs. "Upload a document, get JSON back" (landing page)
- Acknowledge pain honestly: "Parsing PDFs is notoriously hard. We handle the edge cases so you don't have to"
- Use imperative verbs for CTAs: "Extract your first document" NOT "Get Started"

**Don't:**
- Use corporate buzzwords: "leverage," "synergize," "enterprise-grade solution," "cutting-edge"
- Use fake urgency: countdown timers, "limited time offer," "don't miss out"
- Over-promise: "The best API ever" — instead, let the code and numbers speak
- Hide behind passive voice: "Documents are processed" → "We process your documents in <2 seconds"

**Copy Examples to Follow:**
1. Hero headline: "Send a document, get structured JSON back."
2. Subheadline: "The document extraction API you wish existed. Upload PDFs, invoices, receipts — get clean data in seconds."
3. Feature: "No ML expertise needed. No model training. Upload → Extract → Ship."
4. Playground CTA: "Try it now — drop any invoice and watch the magic happen."
5. Pricing: "Start free. Pay when you're serious. No credit card, no sales calls."
6. Docs: "Extract data from documents with one API call. Here's how."
7. Empty state: "No extractions yet. Here's a curl command to change that:" [code block]
8. Blog opener: "I built DocuExtract because I was tired of writing regex to parse invoices."
9. Changelog: "v2.1: Batch endpoint is 3x faster. Also fixed that edge case with rotated PDFs."
10. Error page: "Something went wrong on our end. We're looking into it. Here's our status page."

### The "Aha Moment"

For a document extraction API, the aha moment is unambiguous: **upload a messy invoice PDF → receive clean, structured JSON back in under 3 seconds**. This transformation — chaos to order — is visually dramatic and immediately demonstrates value.

**The playground MUST show this before signup**, with pre-loaded sample documents that extract instantly. 5 free demo extractions with no auth required.

**Activation metric:** Developer successfully extracts structured data from **their own uploaded document** (not just a sample). This indicates real intent to integrate. Track this ruthlessly.

### Conversion Funnel Targets

| Funnel Stage | Industry Benchmark | DocuExtract Target |
|---|---|---|
| Visitor → Signup | 10% median | 8-12% |
| Signup → First API call | 20-40% activation | **60%+ within 24 hours** |
| First call → Regular usage | 23% median (28-day retention) | 30%+ |
| Free → Paid (6 months) | 5% median for dev tools | 5-7% |
| Time to Hello World | <5 min (exceptional) | **<3 minutes** with playground |

**Critical insight from research:** Users who interact with core features in their first 3 days are 4x more likely to convert. More than half of all trial cancellations happen on Day 1. Every screen must be engineered to get developers from signup to successful extraction within a single session.

### Complete User Journey

```
Landing Page (/) → Playground (/playground) → Docs (/docs) → Signup (/login)
→ Dashboard (/dashboard) → First API Call → Usage Growth → Billing (/dashboard/billing)
→ Paid Plan → Expansion
```

The flywheel: **Playground (pre-signup aha moment) → Signup → Dashboard onboarding → First real extraction → Usage growth → Usage limit email → Upgrade → Usage report emails reinforcing value → Expansion to higher tiers.**

---

## 🖌️ Visual Design System

> **Follow these specs precisely when building any UI component, page, or animation. Match the existing landing page — do NOT deviate.**

### Design Philosophy
Dark-mode-first. Developer-native. Clean and fast. No heavy animation frameworks, no bento grids, no aurora gradients. The style is self-contained inline CSS per page — each page is a standalone component with an embedded `<style>` block. This approach keeps pages fast and consistent without a CSS framework.

**Do not use Tailwind CSS for public pages.** Tailwind is only used inside the `(auth)/` route group (dashboard). Public pages (`/`, `/pricing`, `/blog`, `/changelog`, `/use-cases`, `/docs`, `/playground`) use the inline CSS pattern established by the existing landing page.

### Color Palette (CSS Custom Properties)

These are the exact variables used across all public pages. Use them verbatim — do not substitute Tailwind color classes.

```css
:root {
  --bg: #0f1117;              /* Page background — dark near-black */
  --bg-card: #161b27;         /* Card / section background */
  --bg-code: #1e2435;         /* Code block background */
  --border: #2a3147;          /* Border color */
  --text: #e2e8f0;            /* Primary text — soft white */
  --text-muted: #8892a4;      /* Secondary / label text */
  --accent: #6c8ef5;          /* Primary accent — indigo/blue-violet */
  --accent-hover: #5a7ef0;    /* Accent on hover */
  --accent-dim: rgba(108,142,245,0.12); /* Accent tint for badges/backgrounds */
  --green: #4ade80;           /* Success — extraction complete */
  --green-bg: rgba(74,222,128,0.08);
  --red: #f87171;             /* Error state */
  --yellow: #facc15;          /* Warning */
  --orange: #fb923c;          /* Orange accent */
  --purple: #c084fc;          /* Purple accent */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
  --max-w: 1100px;            /* Max content width */
  --radius: 10px;             /* Standard border-radius */
}
```

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Hero headline | `--font-sans` | `clamp(36px, 6vw, 64px)` | 800, letter-spacing -1.5px |
| Section headers | `--font-sans` | 32px | 700, letter-spacing -0.5px |
| Body text | `--font-sans` | 16px, line-height 1.6 | 400 |
| Small/labels | `--font-sans` | 13–14px | 500 |
| Code/API | `--font-mono` | 13–14px | 400 |

**System font stack only.** No Google Fonts, no `next/font` imports on public pages.

### Layout Conventions

- **Max content width:** 1100px (`--max-w`), centered with `margin: 0 auto`
- **Section padding:** `80px 24px` (vertical + horizontal)
- **Card border-radius:** `var(--radius)` = 10px
- **Grid gap:** 24px for two-column demo grids; 20–32px for feature grids
- **Navbar:** Sticky, `background: rgba(15,17,23,0.92)`, `backdrop-filter: blur(12px)`, height 60px, border-bottom `1px solid var(--border)`

### Button Styles

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }

.btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }
```

### Hero Section Pattern

- Centered text layout, `padding: 100px 24px 80px`
- Radial gradient glow behind hero: `radial-gradient(circle, rgba(108,142,245,0.12) 0%, transparent 70%)`, positioned above and centered
- Badge pill: `background: var(--accent-dim)`, `border: 1px solid rgba(108,142,245,0.3)`, `border-radius: 20px`
- Headline: `clamp(36px, 6vw, 64px)`, weight 800, `.highlight { color: var(--accent) }`
- Sub-paragraph: `color: var(--text-muted)`, max-width 560px
- CTA row: flex, gap 12px, centered — primary + outline buttons
- Stats row: flex, gap 40px, centered, `border-top: 1px solid var(--border)`, `margin-top: 56px`

### Code Block Presentation

- Background: `var(--bg-code)` = `#1e2435`
- Border: `1px solid var(--border)`
- Border-radius: `var(--radius)`
- Header bar with filename/label + copy button
- Language tabs where multiple languages shown — plain `<button>` elements, active tab highlighted with `var(--accent)`
- Copy button: clipboard icon, transitions to checkmark on click
- Monospace font: `var(--font-mono)`

### Animation

**Keep it minimal.** The existing site uses no animation library. Any additions must be:
- CSS transitions only (`transition: all 0.15s` for hover states)
- No JavaScript-driven animations on page load
- No scroll-triggered animations
- Hover states: color/border transitions only — no scale transforms

### Page Architecture Pattern

Every public page is a Next.js page component structured as:

```tsx
'use client'; // only if interactivity needed; omit for static pages

const css = `
  /* All page styles here — copy :root variables block + page-specific styles */
`;

export default function PageName() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* page content */}
    </>
  );
}
```

New pages (`/blog`, `/changelog`, `/pricing`, `/use-cases`) **must follow this exact pattern** — self-contained CSS, same `:root` variables, same nav/footer markup as the landing page.

---

## 📧 Email Strategy

> **Email is a conversion engine, not an afterthought. Usage-triggered emails convert at 3-8% vs <2% for generic campaigns.**

### Email Stack

**Phase 1 (now — launch day):** Configure Supabase SMTP settings to use **Resend** credentials. All auth emails (magic links, confirmations) send through Resend instead of Supabase defaults. Customize templates in Supabase Dashboard. **Cost: $0/month** (Resend free tier: 3,000 emails/month).

**Phase 2 (post-100 users):** Migrate to Supabase's "Send Email Hook" — Edge Function intercepts auth events, renders emails using **React Email** components, sends via Resend API. Full design control. Upgrade to Resend Pro ($20/month) when volume requires it.

### Essential Emails (Priority Order)

**P0 — Before any user signs up:**
1. **Magic link / email confirmation** (via Supabase Auth + Resend SMTP)
2. **Welcome email with API key:** Sent immediately after first login. Contains: API key in monospace code block, 5-line curl command, link to quickstart docs, single CTA: "Make your first API call." No product tours. No "welcome to the family." API key front-and-center, copy-paste-run.
3. **Password reset** (via Supabase Auth)

**P1 — Before accepting payment:**
4. **Usage approaching limit (70%):** Visual progress bar + plan comparison table.
5. **Usage at limit (100%):** "Your API will return 429 errors. Upgrade to Starter: [Upgrade now →]"
6. **Payment confirmation/receipt:** Clean branded invoice.
7. **Failed payment/dunning:** 3-email sequence. Recovers 20-40% of failed payments.

**P2 — First month after launch:**
8. **Onboarding nudge** (48h after signup, if no API call): 3-line code sample.
9. **First extraction celebration:** "Your first document extracted successfully. Here's what to try next."
10. **Weekly usage report:** Big numbers (calls, documents, success rate), trend arrows, usage bar, one "power tip." This is the highest-ROI email for conversion.

### Subject Lines
- "Your DocuExtract API key is ready — make your first call"
- "You've hit 70 of 100 free API calls this month"
- "Your first document extracted successfully 🎉"
- "This week: 247 documents processed, 99.2% accuracy"
- "3 lines of code to extract invoice data"

**Timing:** Tuesday-Thursday, 10am-12pm local time. Behavior-triggered, not calendar-based. Max 1-2 emails/week.

---

## 📺 Screen Roadmap (Build Priority Order)

> **This is the definitive screen build order. Build Tier 1 first, then Tier 2, then Tier 3.**

### Tier 1 — Highest Conversion Impact (Build First)

**1. Landing Page (`/`)**
- **Purpose:** Convert visitor to playground user or signup
- **Content:** Hero with "Send a document, get JSON back" headline + live API demo. Bento grid (code snippet, stats, use cases, social proof). Pricing summary. Final CTA.
- **Design:** Aurora gradient hero, animated bento grid, code snippet with response animation, number-counting stats on scroll
- **Success metric:** Visitor → Playground click rate 25%+; Visitor → Signup rate 10%
- **Critical:** Hero must show PDF → JSON transformation within 3 seconds of page load

**2. Playground (`/playground`)**
- **Purpose:** Deliver the aha moment without signup — "try before you buy"
- **Content:** Drag-and-drop upload zone + pre-loaded sample documents (invoice, receipt, resume). Side-by-side view: uploaded document (left) → extracted JSON (right) with confidence scores. 5 free demo extractions, no auth required. Language-tabbed code snippet showing how to replicate via API.
- **Design:** Split-pane layout, real-time extraction animation, smooth transition to signup
- **Success metric:** Playground visitor → Signup rate 30%+

**3. Dashboard (`/dashboard`)**
- **Purpose:** Onboard new users to first API call; retain active users
- **Content:** Getting Started widget (3 auto-completing steps: copy key → first extraction → review results). Usage overview cards. Recent extractions table. Quick-access API key with copy button.
- **Design:** Collapsible left sidebar, actionable empty states, pre-populated code with user's actual API key
- **Success metric:** Signup → First API call rate 60% within 24h

### Tier 2 — Build Second

**4. Documentation (`/docs`)**
- **Purpose:** Enable successful integration; reduce support load
- **Content:** Quickstart (3-minute guide), API reference, SDKs, authentication, document type guides, error handling, webhooks, rate limits
- **Design:** Three-column layout (nav / content / code), language-tabbed code samples, search
- **Success metric:** >10 unique page views correlates with conversion

**5. Pricing Page (`/pricing`)**
- **Purpose:** Convert free users to paid; communicate value clearly
- **Content:** Four tiers in comparison table. Current plan highlighted. Feature comparison matrix. FAQ. Usage calculator.
- **Design:** Clean table, highlight recommended plan (Pro at $99/mo), monthly/annual toggle
- **Success metric:** Pricing → Checkout conversion rate 15-25%
- **Placement:** Visible in nav bar on EVERY page. Never gate pricing behind signup.

**6. Login/Signup (`/login`)**
- **Purpose:** Minimum friction account creation
- **Content:** GitHub OAuth (primary, one-click), Google OAuth, magic link. No password.
- **Design:** Single-column centered form, dark background, social proof counter
- **Success metric:** Form → Account created rate 85%+

### Tier 3 — Build for Growth

**7. Use Cases (`/use-cases`)**
- **Purpose:** SEO capture + qualification for specific segments
- **Content:** Invoice extraction, receipt processing, resume parsing — before/after split-view with real extraction examples
- **Success metric:** Organic traffic from "[document type] extraction API" keywords

**8. Blog (`/blog`)**
- **Purpose:** SEO engine + build-in-public content hub
- **Content:** Tutorials, architecture posts, accuracy benchmarks, monthly revenue updates
- **SEO targets:** "document extraction API," "OCR API," "invoice parsing API," "PDF to JSON"

**9. Changelog (`/changelog`)**
- **Purpose:** Retain users; demonstrate momentum
- **Content:** Bi-weekly updates with personality, timeline layout, email subscribe
- **Success metric:** Changelog email open rate 30-45% (highest-performing dev email type)

### Dashboard Sidebar Navigation

```
[DocuExtract logo]

── Quick Start (rocket icon)     ← Only visible until first extraction
── Overview (home icon)          ← Dashboard home with usage charts
── Extractions (document icon)   ← History of all extractions
── Playground (play icon)        ← Interactive testing environment
── API Keys (key icon)           ← Manage keys, rotate, create restricted keys

── DEVELOPER
   ├── Documentation (book icon)  ← Links to /docs
   ├── Webhooks (arrow icon)      ← Configure webhook endpoints
   └── Logs (terminal icon)       ← Real-time API request/response logs

── ACCOUNT
   ├── Usage (chart icon)         ← Current period usage vs. limits
   ├── Billing (credit card icon) ← Plan, invoices, payment method
   └── Settings (gear icon)       ← Profile, team, preferences
```

Collapsible to icons on small screens. Keyboard shortcut `[` or `Cmd+B` to toggle. Usage bar in sidebar always visible — turns amber at 80%, red at 95%.

### Dashboard Empty States

**Never use decorative illustrations. Every empty state is actionable.**
- **Empty Overview:** Getting Started checklist + code snippet + "Try with sample document" button
- **Empty Extractions:** Monospace curl command with copy button + "Upload a document" CTA
- **Empty Logs:** "No API calls yet. Make your first request:" + curl command

### Upgrade Prompts

**Never interrupt workflow with upgrade modals.** Instead:
- Usage bar in sidebar (amber at 80%, red at 95%)
- Contextual inline banners when rate limits are hit
- Clean plan comparison in Settings → Billing
- Never show upgrade popups during extraction workflows

---

## 🏗️ Architecture

### Single-Project Deployment

DocuExtract is a **single Next.js 14 App Router application** deployed as **one Vercel project**.

| Attribute | Value |
|-----------|-------|
| **Framework** | Next.js 14+ (App Router) |
| **Deployment** | Single Vercel project |
| **Root Directory** | Repo root |
| **Domain** | `docuextract.dev` |
| **UI Routes** | `/`, `/playground`, `/docs`, `/pricing`, `/use-cases`, `/blog`, `/changelog`, `/login`, `/dashboard/*` |
| **API Routes** | `/v1/extract`, `/v1/detect`, `/v1/usage`, `/v1/health`, `/v1/billing/*`, `/v1/webhooks/*` |

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **App Framework** | Next.js 14+ (App Router) on Vercel | Unified UI + API, React pages, route handlers, SSR |
| **Database** | Supabase (PostgreSQL + Auth + Storage) | Free tier generous, built-in auth, file storage |
| **AI Engine** | Claude API (Haiku 4.5 / Sonnet 4.6) | Best-in-class extraction, consistent JSON output |
| **Billing** | Stripe (Subscriptions + Metered Billing) | Industry standard, usage-based billing |
| **Email** | Resend (free tier: 3,000/month) + React Email | Best DX, Supabase SMTP integration, $0 cost |
| **Animations** | Framer Motion (Motion) | MIT licensed, 32KB, works with App Router |
| **Monitoring** | Sentry (free tier) — planned | Error tracking, performance monitoring |
| **Domain** | docuextract.dev (Cloudflare) | Purchased ✅ |

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
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL DEFAULT generate_api_key(),
  api_key_hash TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rate_limits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id),
  requests_this_minute INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  minute_reset_at TIMESTAMPTZ,
  month_reset_at TIMESTAMPTZ
);

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Applied Migrations (001-009):** All applied. See Notion Architecture & Technical Spec page for details.

### API Endpoints

```
BASE URL: https://docuextract.dev

Authentication: Bearer token (API key) in Authorization header

POST /v1/extract     — Main extraction endpoint
POST /v1/detect      — Detect document type without extraction
GET  /v1/usage       — Current usage stats (requires auth)
GET  /v1/health      — Health check (no auth required)
POST /v1/billing/checkout — Create Stripe Checkout session (requires auth)
POST /v1/billing/portal   — Create Stripe Billing Portal session (requires auth)
POST /v1/webhooks/stripe  — Stripe webhook handler (signature verified)
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
- Starter: `price_1TEmTpKtX9wthBvgToGOwsi1`
- Pro: `price_1TEmajKtX9wthBvgQ2Fq8Few`
- Scale: `price_1TEmmwKtX9wthBvgNCP9f71m`
- Overage: `price_1TEmf0KtX9wthBvg7kOfbAyc`

---

## 📁 Project Structure

Single Next.js application at the repo root. All dependencies in one `package.json`.

```
docuextract/
├── CLAUDE.md                        # THIS FILE — master context
├── README.md
├── package.json                     # Single package.json — all deps merged
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── vercel.json                      # { "framework": "nextjs" }
├── .env.local                       # Environment variables (NEVER commit)
├── .env.example
├── openapi.yaml                     # OpenAPI 3.0 spec (for RapidAPI)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout. NO AUTH. <html>, <body>, global CSS, metadata.
│   │   ├── page.tsx                 # Landing page (public).
│   │   ├── playground/page.tsx      # Interactive playground (public).
│   │   ├── docs/page.tsx            # API documentation (public).
│   │   ├── pricing/page.tsx         # Pricing page (public). ← NEW
│   │   ├── use-cases/page.tsx       # Use cases page (public). ← NEW
│   │   ├── blog/                    # Blog (public). ← NEW
│   │   │   ├── page.tsx             # Blog index
│   │   │   └── [slug]/page.tsx      # Individual blog posts
│   │   ├── changelog/page.tsx       # Changelog (public). ← NEW
│   │   │
│   │   ├── auth/callback/route.ts   # Supabase Auth callback (GET).
│   │   │
│   │   ├── (auth)/                  # Route group. Auth boundary.
│   │   │   ├── layout.tsx           # Auth layout. Checks session.
│   │   │   ├── login/page.tsx       # Login/signup page.
│   │   │   └── dashboard/
│   │   │       ├── page.tsx         # Dashboard home (protected).
│   │   │       ├── keys/page.tsx    # API key management (protected).
│   │   │       ├── usage/page.tsx   # Usage analytics (protected).
│   │   │       └── billing/page.tsx # Billing management (protected).
│   │   │
│   │   └── v1/                      # API route handlers (server-only)
│   │       ├── extract/route.ts
│   │       ├── detect/route.ts
│   │       ├── usage/route.ts
│   │       ├── health/route.ts
│   │       ├── billing/checkout/route.ts
│   │       ├── billing/portal/route.ts
│   │       └── webhooks/stripe/route.ts
│   │
│   ├── lib/                         # Server-only shared logic (import 'server-only' in every file)
│   │   ├── auth.ts
│   │   ├── billing.ts
│   │   ├── claude.ts
│   │   ├── extraction/ (engine.ts, prompts.ts, schemas.ts, postprocess.ts)
│   │   ├── documents/ (input.ts, detect.ts, validate.ts)
│   │   ├── ratelimit.ts
│   │   ├── usage.ts
│   │   ├── errors.ts
│   │   └── types.ts
│   │
│   └── components/                  # Client-side React components
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── UsageChart.tsx
│       ├── PlaygroundForm.tsx
│       ├── BentoGrid.tsx            ← NEW
│       ├── CodeBlock.tsx            ← NEW (language tabs, copy button, syntax theme)
│       ├── PricingTable.tsx         ← NEW
│       └── ...
│
├── emails/                          # React Email templates ← NEW (Phase 2 email)
│   ├── welcome.tsx
│   ├── usage-alert.tsx
│   ├── usage-report.tsx
│   └── ...
│
├── supabase/migrations/             # SQL migrations 001-009 (all applied)
├── sdk/ (javascript/, python/)
├── scripts/
└── tests/fixtures/                  # 14 sample documents
```

### Key Architectural Patterns

**Root Layout (`src/app/layout.tsx`) — NO Auth**
- `<html>`, `<body>`, global CSS, metadata only. NEVER contains auth wrappers.

**Auth Route Group (`src/app/(auth)/layout.tsx`) — Dashboard Only**
- Wraps ONLY dashboard routes in Supabase Auth. `(auth)` does NOT add a URL segment.

**Auth Callback Route (`/auth/callback/route.ts`)**
- Exchanges `code` for session, redirects to `/dashboard`.

**API Route Handlers (`src/app/v1/*/route.ts`) — Server-Only**
- Export `GET`, `POST` functions. Import from `src/lib/`. Never bundled into client.

**Server-Only Enforcement (`src/lib/`)**
- Every file starts with `import 'server-only'`. Build fails if client component imports.

---

## 🔑 Environment Variables

Single `.env.local` at repo root.

```env
# Supabase — server-side
SUPABASE_URL=https://jdvogyzrawcwxlrambpd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Supabase — client-side
NEXT_PUBLIC_SUPABASE_URL=https://jdvogyzrawcwxlrambpd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Claude API — server-side only
ANTHROPIC_API_KEY=sk-ant-...

# Stripe — server-side only
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_1TEmTpKtX9wthBvgToGOwsi1
STRIPE_PRICE_PRO=price_1TEmajKtX9wthBvgQ2Fq8Few
STRIPE_PRICE_SCALE=price_1TEmmwKtX9wthBvgNCP9f71m
STRIPE_PRICE_OVERAGE=price_1TEmf0KtX9wthBvg7kOfbAyc

# Stripe — client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend — server-side only (Phase 2 email)
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=https://docuextract.dev

# Vercel
VERCEL_TOKEN=vcp_...
```

**CRITICAL:** Never prefix `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, or `RESEND_API_KEY` with `NEXT_PUBLIC_`.

---

## 🧪 Testing Strategy

- **Unit tests**: Each lib/ module has corresponding test file
- **E2E billing test**: `scripts/test-billing-e2e.ts`
- **Manual testing**: Playground for real document extraction
- **Test documents**: 14 samples in tests/fixtures/

---

## 📏 Code Standards

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 14+ App Router
- **Runtime**: Node.js 20+
- **Formatting**: Prettier (default config)
- **CSS**: Tailwind CSS (utility-first, dark-mode-first)
- **Animations**: Framer Motion (`motion` package)
- **Error handling**: All API route handlers use src/lib/errors.ts
- **Server isolation**: Every file in `src/lib/` starts with `import 'server-only'`
- **Comments**: Explain WHY, not WHAT.

---

## 🚨 Critical Rules for Claude Code

1. **NEVER commit .env files or API keys.**
2. **NEVER skip input validation.** Every route handler validates all inputs.
3. **ALWAYS handle Claude API errors gracefully.** Retry once on malformed output.
4. **ALWAYS log usage to Supabase** on every extraction call. Fire-and-forget.
5. **ALWAYS report overage usage to Stripe** when user exceeds plan limit.
6. **ALWAYS return standardized error responses** using src/lib/errors.ts.
7. **NEVER expose Supabase service role key** in client-side code.
8. **Keep route handlers lean** — import only what's needed.
9. **Use Haiku 4.5 as default model** — Sonnet only when user requests "accurate".
10. **All money values in cents** internally (Stripe convention).
11. **Root layout must NEVER contain auth wrappers.** Auth goes ONLY in `(auth)/layout.tsx`.
12. **Never add NEXT_PUBLIC_ prefix to secret keys.** Add `import 'server-only'` to ALL src/lib/ files.
13. **Present implementation plans to Kiano** before large architectural changes.
14. **Follow the Visual Design System** in this file for all UI work — inline CSS pattern, CSS custom properties, color tokens. New public pages must match the existing landing page style exactly (same `:root` variables, no Tailwind, no animation libraries).
15. **Follow the Brand Voice guidelines** — casual but premium. Lead with what the product does. Use specific numbers. Imperative CTAs.
16. **Follow the Screen Roadmap** build order — Tier 1 screens first (Landing, Playground, Dashboard), then Tier 2, then Tier 3.

---

## 🔌 Platform Access (MCP Tools)

| Platform | What You Can Do |
|----------|----------------|
| **Notion** | Read/write tasks, update statuses, log issues |
| **Supabase** | Run SQL, manage tables, deploy migrations |
| **Stripe** | Create products/prices, manage subscriptions, configure webhooks |
| **Vercel** | Deploy the single project, configure env vars, check status, read logs |
| **GitHub** | Read repo contents, manage files |

**Only flag for Kiano when:** signup/payment required, physical-world tasks.

---

## 📋 Notion Command Center

**🔗 https://www.notion.so/DocuExtract-HQ-Command-Center-32d995287c1281d19ed3e8cd95a36138**

| Page | Purpose |
|------|---------|
| **Claude Code Tasks** | YOUR task queue with specs and acceptance criteria |
| **Claude Code — Issues & Suggestions** | YOUR feedback channel |
| **Kiano Tasks** | Tasks for Kiano — do NOT work on these |
| **Architecture & Technical Spec** | Technical reference |
| **Research & Market Intelligence** | Market research and competitor data |
| **Daily Progress Log** | Log what you completed each session |

### Your Workflow
1. Read this CLAUDE.md
2. Check "Claude Code Tasks" for Queued/In Progress tasks
3. Pick highest priority Queued task with no unresolved dependencies
4. Set status to "In Progress"
5. Build following this file's architecture AND design system
6. Set status to "Done" with completion notes
7. Log issues/questions in Issues & Suggestions
8. Update the Daily Progress Log
9. Move to next task

---

## 🗺️ Build Phases & Status

### Phase 1: Foundation ✅ COMPLETE
### Phase 2: Core Engine ✅ COMPLETE
### Phase 3: Billing ✅ COMPLETE
### Phase 4: Developer Experience ✅ COMPLETE
### Phase 5: Distribution & Launch 🔄 IN PROGRESS

**Completed in Phase 5:**
- ✅ Single Next.js app migration (commit 63ab5e6, 20 routes)
- ✅ Post-migration security audit (all 5 checks passed, 14/14 lib files have server-only)
- ✅ Internal links verification (zero old URL references)
- ✅ Docs content audit (7 error code inaccuracies fixed)
- ✅ Domain purchased: docuextract.dev (Cloudflare)

**Remaining in Phase 5 (current work):**
- Deploy unified app to Vercel + configure docuextract.dev domain
- Update CLAUDE.md and code references with docuextract.dev
- Optimize API route handler runtimes (cold start performance)
- Generate OpenAPI 3.0 spec for RapidAPI
- Set up Sentry error tracking

### Phase 6: Premium DX & Growth 🔜 NEXT

> **This phase transforms DocuExtract from a functional tool into a market-leading platform.** All work follows the Strategic Blueprint and the Visual Design System defined in this file.

**New Pages (follow existing design system — inline CSS, same color variables, same nav/footer):**
- `/pricing` — Four-tier comparison table, FAQ, usage calculator
- `/use-cases` — Invoice, receipt, resume extraction with before/after demos
- `/blog` — Blog index + individual post pages, SEO-targeted technical tutorials
- `/changelog` — Timeline layout, personality in writing

**Email Integration:**
- Configure Resend SMTP in Supabase (Phase 1: $0)
- Build welcome email with API key
- Build usage alert emails (70%, 100% thresholds)
- Build weekly usage report email

**Distribution:**
- List API on RapidAPI marketplace
- Write 3 SEO blog posts (invoice extraction, document parsing comparison, receipt processing)
- Prepare Product Hunt and Hacker News launch materials
- Build-in-public Twitter presence

---

## 📊 Key URLs & Resources

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/TheOGSatoshiNakamoto/docuextract |
| App (Vercel) | https://docuextract.dev |
| Supabase Project | https://jdvogyzrawcwxlrambpd.supabase.co |
| Stripe Dashboard (Test) | https://dashboard.stripe.com/test |
| Notion HQ | https://www.notion.so/DocuExtract-HQ-Command-Center-32d995287c1281d19ed3e8cd95a36138 |
