/**
 * Shared docs content — single source of truth for both /docs and /dashboard/docs.
 * Both pages import from here and wrap in their own layout chrome.
 * Edit docs content HERE, not in the individual page files.
 */

export interface DocsContext {
  /** Where to link for "get your API key" */
  apiKeysHref: string;
  /** Label for the API keys link */
  apiKeysLabel: string;
  /** Whether to show pricing subscribe buttons and footer */
  showPricingLinks: boolean;
}

export const publicContext: DocsContext = {
  apiKeysHref: '/dashboard',
  apiKeysLabel: 'your dashboard',
  showPricingLinks: true,
};

export const dashboardContext: DocsContext = {
  apiKeysHref: '/dashboard/keys',
  apiKeysLabel: 'API Keys',
  showPricingLinks: false,
};

// Static pre-rendered HTML blocks for syntax-highlighted code samples.
// These are hardcoded strings — no user input, safe for innerHTML.
export const preBlocks: Record<string, string> = {
  authHttp: `<span class="hdr">Authorization: Bearer dk_live_xxxxxxxxxxxxxxxxxxxxxxxx</span>`,
  qsCurl: `<span class="fn">curl</span> <span class="url">https://docuextract.dev/v1/extract</span> \\\n  <span class="hdr">-H</span> <span class="str">"Authorization: Bearer dk_live_YOUR_KEY"</span> \\\n  <span class="hdr">-H</span> <span class="str">"Content-Type: application/json"</span> \\\n  <span class="hdr">-d</span> <span class="str">&#39;{\n    "document": "https://example.com/invoice.pdf",\n    "type": "invoice"\n  }&#39;</span>`,
  qsJs: `<span class="kw">const</span> response = <span class="kw">await</span> <span class="fn">fetch</span>(<span class="str">'https://docuextract.dev/v1/extract'</span>, {\n  method: <span class="str">'POST'</span>,\n  headers: {\n    <span class="str">'Authorization'</span>: <span class="str">'Bearer dk_live_YOUR_KEY'</span>,\n    <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span>,\n  },\n  body: <span class="fn">JSON.stringify</span>({\n    document: <span class="str">'https://example.com/invoice.pdf'</span>,\n    type: <span class="str">'invoice'</span>,\n  }),\n});\n\n<span class="kw">const</span> result = <span class="kw">await</span> response.<span class="fn">json</span>();\nconsole.<span class="fn">log</span>(result.data);\n<span class="cmt">// { vendor_name: "Acme Corp", total_amount: 1250.00, ... }</span>`,
  qsPy: `<span class="kw">import</span> requests\n\nresponse = requests.<span class="fn">post</span>(\n    <span class="str">'https://docuextract.dev/v1/extract'</span>,\n    headers={\n        <span class="str">'Authorization'</span>: <span class="str">'Bearer dk_live_YOUR_KEY'</span>,\n        <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span>,\n    },\n    json={\n        <span class="str">'document'</span>: <span class="str">'https://example.com/invoice.pdf'</span>,\n        <span class="str">'type'</span>: <span class="str">'invoice'</span>,\n    }\n)\n\nresult = response.<span class="fn">json</span>()\n<span class="fn">print</span>(result[<span class="str">'data'</span>])\n<span class="cmt"># {'vendor_name': 'Acme Corp', 'total_amount': 1250.0, ...}</span>`,
  qsResponse: `{\n  <span class="key">"data"</span>: {\n    <span class="key">"vendor_name"</span>: <span class="str">"Acme Corp"</span>,\n    <span class="key">"invoice_number"</span>: <span class="str">"INV-2024-0847"</span>,\n    <span class="key">"invoice_date"</span>: <span class="str">"2024-03-15"</span>,\n    <span class="key">"due_date"</span>: <span class="str">"2024-04-15"</span>,\n    <span class="key">"subtotal"</span>: <span class="num">1000.00</span>,\n    <span class="key">"tax_amount"</span>: <span class="num">250.00</span>,\n    <span class="key">"total_amount"</span>: <span class="num">1250.00</span>,\n    <span class="key">"currency"</span>: <span class="str">"USD"</span>,\n    <span class="key">"line_items"</span>: [\n      { <span class="key">"description"</span>: <span class="str">"Consulting services"</span>, <span class="key">"quantity"</span>: <span class="num">10</span>, <span class="key">"unit_price"</span>: <span class="num">100.00</span>, <span class="key">"total"</span>: <span class="num">1000.00</span> }\n    ]\n  },\n  <span class="key">"metadata"</span>: {\n    <span class="key">"type"</span>: <span class="str">"invoice"</span>,\n    <span class="key">"confidence"</span>: <span class="num">0.96</span>,\n    <span class="key">"model"</span>: <span class="str">"claude-haiku-4-5-20251001"</span>,\n    <span class="key">"processing_time_ms"</span>: <span class="num">1847</span>,\n    <span class="key">"page_count"</span>: <span class="num">1</span>\n  }\n}`,
  extractResponse: `{\n  <span class="key">"data"</span>: { <span class="cmt">/* extracted fields */</span> },\n  <span class="key">"metadata"</span>: {\n    <span class="key">"type"</span>: <span class="str">"invoice"</span>,\n    <span class="key">"confidence"</span>: <span class="num">0.96</span>,\n    <span class="key">"model"</span>: <span class="str">"claude-haiku-4-5-20251001"</span>,\n    <span class="key">"processing_time_ms"</span>: <span class="num">1847</span>,\n    <span class="key">"page_count"</span>: <span class="num">1</span>\n  }\n}`,
  detectResponse: `{\n  <span class="key">"type"</span>: <span class="str">"invoice"</span>,\n  <span class="key">"confidence"</span>: <span class="num">0.98</span>\n}`,
  usageResponse: `{\n  <span class="key">"used"</span>: <span class="num">847</span>,\n  <span class="key">"limit"</span>: <span class="num">5000</span>,\n  <span class="key">"plan"</span>: <span class="str">"pro"</span>,\n  <span class="key">"period_end"</span>: <span class="str">"2024-04-24"</span>,\n  <span class="key">"breakdown"</span>: [\n    { <span class="key">"date"</span>: <span class="str">"2024-03-24"</span>, <span class="key">"count"</span>: <span class="num">42</span> }\n  ]\n}`,
  healthResponse: `{ <span class="key">"status"</span>: <span class="str">"ok"</span>, <span class="key">"version"</span>: <span class="str">"1.0.0"</span> }`,
  checkoutResponse: `{ <span class="key">"url"</span>: <span class="str">"https://checkout.stripe.com/c/pay/cs_live_..."</span> }`,
  portalResponse: `{ <span class="key">"url"</span>: <span class="str">"https://billing.stripe.com/p/session/..."</span> }`,
  errorResponse: `{\n  <span class="key">"error"</span>: {\n    <span class="key">"code"</span>: <span class="str">"unauthorized"</span>,\n    <span class="key">"message"</span>: <span class="str">"Invalid or missing API key"</span>\n  }\n}`,
};

export const tocItems = [
  { group: 'Getting Started', items: [
    { href: '#introduction', label: 'Introduction' },
    { href: '#quickstart', label: 'Quick Start' },
    { href: '#authentication', label: 'Authentication' },
  ]},
  { group: 'Endpoints', items: [
    { href: '#extract', label: '/v1/extract', method: 'POST' as const },
    { href: '#detect', label: '/v1/detect', method: 'POST' as const },
    { href: '#usage', label: '/v1/usage', method: 'GET' as const },
    { href: '#health', label: '/v1/health', method: 'GET' as const },
  ]},
  { group: 'Billing', items: [
    { href: '#checkout', label: '/v1/billing/checkout', method: 'POST' as const },
    { href: '#portal', label: '/v1/billing/portal', method: 'POST' as const },
  ]},
  { group: 'Webhooks', items: [
    { href: '#webhooks-overview', label: 'Overview' },
    { href: '#webhook-events', label: 'Event Types' },
    { href: '#webhook-payload', label: 'Payload Format' },
    { href: '#webhook-signatures', label: 'Signature Verification' },
    { href: '#webhook-retry', label: 'Retry Policy' },
    { href: '#webhook-best-practices', label: 'Best Practices' },
  ]},
  { group: 'Reference', items: [
    { href: '#document-types', label: 'Document Types' },
    { href: '#errors', label: 'Error Codes' },
    { href: '/pricing', label: 'Pricing', external: true },
  ]},
];

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared doc sections component — rendered identically in both /docs and /dashboard/docs.
 * Context-specific links (API keys, pricing) are parameterized via ctx.
 */
export function DocsSections({ ctx }: { ctx: DocsContext }) {
  return (
    <>
      <section id="introduction">
        <h1>DocuExtract API</h1>
        <p>Send a document, get JSON back. No templates. No training. Works in 5 minutes.</p>
        <p>DocuExtract converts unstructured documents — invoices, receipts, contracts, resumes, bank statements — into clean, validated JSON using Claude AI. You send a document (image, PDF, or URL), specify what you want extracted, and receive structured data in seconds.</p>
        <div className="callout callout-info"><strong>Base URL</strong><code>https://docuextract.dev/v1</code></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Feature</th><th>Detail</th></tr></thead>
            <tbody>
              <tr><td>Authentication</td><td>Bearer token (API key)</td></tr>
              <tr><td>Request format</td><td>JSON (<code>Content-Type: application/json</code>)</td></tr>
              <tr><td>Response format</td><td>JSON</td></tr>
              <tr><td>Max file size</td><td>10 MB</td></tr>
              <tr><td>Supported formats</td><td>PDF, PNG, JPG, WEBP (base64 or URL)</td></tr>
              <tr><td>Default model</td><td>Claude Haiku 4.5 (fast)</td></tr>
              <tr><td>Accurate model</td><td>Claude Sonnet 4.6 (complex documents)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr />

      <section id="quickstart">
        <h2>Quick Start</h2>
        <p>Extract structured data from a document in 3 steps.</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h3>Get your API key</h3>
              <p>Go to <a href={ctx.apiKeysHref}>{ctx.apiKeysLabel}</a> to get your free API key. It looks like <code>dk_live_xxxxxxxxxxxxxxxx</code>.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h3>Make your first extraction</h3>
              <p>Send a document URL (or base64) to <code>/v1/extract</code>:</p>
              <div className="tabs">
                <div className="tab-list">
                  <button className="tab-btn active" onClick={(e) => (window as any).switchTab(e.currentTarget, 'qs-curl')}>curl</button>
                  <button className="tab-btn" onClick={(e) => (window as any).switchTab(e.currentTarget, 'qs-js')}>JavaScript</button>
                  <button className="tab-btn" onClick={(e) => (window as any).switchTab(e.currentTarget, 'qs-py')}>Python</button>
                </div>
                <div id="qs-curl" className="tab-panel active">
                  <div className="code-block"><div className="code-header"><span className="code-lang">bash</span><button className="copy-btn" onClick={(e) => (window as any).copyCode(e.currentTarget)}>Copy</button></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.qsCurl }} /></div>
                </div>
                <div id="qs-js" className="tab-panel">
                  <div className="code-block"><div className="code-header"><span className="code-lang">javascript</span><button className="copy-btn" onClick={(e) => (window as any).copyCode(e.currentTarget)}>Copy</button></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.qsJs }} /></div>
                </div>
                <div id="qs-py" className="tab-panel">
                  <div className="code-block"><div className="code-header"><span className="code-lang">python</span><button className="copy-btn" onClick={(e) => (window as any).copyCode(e.currentTarget)}>Copy</button></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.qsPy }} /></div>
                </div>
              </div>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h3>Use the structured data</h3>
              <p>The response contains the extracted fields, confidence score, and processing metadata:</p>
              <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.qsResponse }} /></div>
            </div>
          </div>
        </div>
      </section>

      <hr />

      <section id="authentication">
        <h2>Authentication</h2>
        <p>All API endpoints (except <code>GET /v1/health</code>) require authentication via a Bearer token in the <code>Authorization</code> header.</p>
        <div className="code-block"><div className="code-header"><span className="code-lang">http</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.authHttp }} /></div>
        <h3>API Key Format</h3>
        <p>API keys start with <code>dk_live_</code> followed by 32 random characters. Keys are generated when you sign up and can be regenerated from your <a href={ctx.apiKeysHref}>{ctx.apiKeysLabel} page</a>.</p>
        <div className="callout callout-warn"><strong>Keep your API key secret</strong>Never expose your API key in client-side code or public repositories. Use environment variables to store it securely.</div>
        <h3>Rate Limit Headers</h3>
        <p>Every authenticated response includes rate limit information:</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Header</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>X-RateLimit-Limit-Minute</code></td><td>Maximum requests per minute for your plan</td></tr>
              <tr><td><code>X-RateLimit-Remaining-Minute</code></td><td>Remaining requests this minute</td></tr>
              <tr><td><code>X-RateLimit-Limit-Month</code></td><td>Maximum extractions per month for your plan</td></tr>
              <tr><td><code>X-RateLimit-Remaining-Month</code></td><td>Remaining extractions this month</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr />

      <section id="extract">
        <h2>POST /v1/extract</h2>
        <p>Extract structured data from a document. This is the core endpoint.</p>
        <div className="endpoint-badge"><span className="badge-method badge-post">POST</span><span className="badge-path">https://docuextract.dev/v1/extract</span></div>
        <h3>Request Body</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>document</code></td><td>string</td><td>Yes</td><td>Document as base64-encoded string or a publicly accessible URL</td></tr>
              <tr><td><code>type</code></td><td>string</td><td>No</td><td>Document type hint. One of: <code>invoice</code>, <code>receipt</code>, <code>bank_statement</code>, <code>resume</code>, <code>contract</code>, <code>form</code>, <code>id_document</code>. Auto-detected if omitted.</td></tr>
              <tr><td><code>model</code></td><td>string</td><td>No</td><td><code>&quot;fast&quot;</code> (default) or <code>&quot;accurate&quot;</code>. Fast uses Claude Haiku; accurate uses Claude Sonnet for complex/multi-page documents.</td></tr>
              <tr><td><code>schema</code></td><td>object</td><td>No</td><td>Custom JSON schema describing the fields to extract. When provided, the extraction is guided by your schema.</td></tr>
            </tbody>
          </table>
        </div>
        <h3>Response</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.extractResponse }} /></div>
      </section>

      <hr />

      <section id="detect">
        <h2>POST /v1/detect</h2>
        <p>Detect the type of a document without extracting its data.</p>
        <div className="endpoint-badge"><span className="badge-method badge-post">POST</span><span className="badge-path">https://docuextract.dev/v1/detect</span></div>
        <h3>Response</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.detectResponse }} /></div>
      </section>

      <hr />

      <section id="usage">
        <h2>GET /v1/usage</h2>
        <p>Retrieve your current usage statistics for the billing period.</p>
        <div className="endpoint-badge"><span className="badge-method badge-get">GET</span><span className="badge-path">https://docuextract.dev/v1/usage</span></div>
        <h3>Response</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.usageResponse }} /></div>
      </section>

      <hr />

      <section id="health">
        <h2>GET /v1/health</h2>
        <p>Health check endpoint. No authentication required.</p>
        <div className="endpoint-badge"><span className="badge-method badge-get">GET</span><span className="badge-path">https://docuextract.dev/v1/health</span></div>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.healthResponse }} /></div>
      </section>

      <hr />

      <section id="checkout">
        <h2>POST /v1/billing/checkout</h2>
        <p>Create a Stripe Checkout session to subscribe to a paid plan. Returns a URL to redirect your user to for payment.</p>
        <div className="endpoint-badge"><span className="badge-method badge-post">POST</span><span className="badge-path">https://docuextract.dev/v1/billing/checkout</span></div>
        <h3>Request Body</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>plan</code></td><td>string</td><td>Yes</td><td>Plan to subscribe to. One of: <code>starter</code>, <code>pro</code>, <code>scale</code></td></tr>
            </tbody>
          </table>
        </div>
        <h3>Response</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.checkoutResponse }} /></div>
        <p>Redirect the user to this URL. After payment, Stripe redirects back to your dashboard.</p>
      </section>

      <hr />

      <section id="portal">
        <h2>POST /v1/billing/portal</h2>
        <p>Create a Stripe Billing Portal session for subscription management.</p>
        <div className="endpoint-badge"><span className="badge-method badge-post">POST</span><span className="badge-path">https://docuextract.dev/v1/billing/portal</span></div>
        <div className="callout callout-info">Requires an active Stripe subscription. Free plan users will receive a 400 error.</div>
        <h3>Response</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.portalResponse }} /></div>
      </section>

      <hr />

      {/* ── Webhooks ─────────────────────────────────────────────────────────── */}

      <section id="webhooks-overview">
        <h2>Webhooks</h2>
        <p>Webhooks send real-time HTTP POST notifications to your server when events occur in DocuExtract — extractions complete, usage limits approach, or billing events happen.</p>
        <p>Instead of polling the API, register an HTTPS endpoint and we&apos;ll push events to you. Each delivery is signed with HMAC-SHA256 so you can verify authenticity.</p>
        <h3>How it works</h3>
        <ol>
          <li>Register a webhook endpoint in your <a href="/dashboard/webhooks">Dashboard → Webhooks</a></li>
          <li>Select which events to subscribe to</li>
          <li>Copy the signing secret (shown once)</li>
          <li>We POST a JSON payload to your URL when subscribed events occur</li>
          <li>Verify the signature and process the event</li>
        </ol>
        <p>Webhooks use <strong>hybrid payloads</strong>: the webhook body contains a summary (event type, extraction ID, confidence, document type). To get the full extracted data, call <code>GET /v1/extractions/{'{'}{'{'}extraction_id{'}'}{'}'}</code> using the <code>ext_</code> ID from the payload.</p>
      </section>

      <hr />

      <section id="webhook-events">
        <h2>Event Types</h2>
        <p>DocuExtract supports 9 event types across three categories. Event access is gated by plan.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Event</th><th>Category</th><th>Description</th><th>Plans</th></tr></thead>
            <tbody>
              <tr><td><code>extraction.completed</code></td><td>Core</td><td>Extraction finished successfully</td><td>All</td></tr>
              <tr><td><code>extraction.failed</code></td><td>Core</td><td>Extraction encountered an error</td><td>All</td></tr>
              <tr><td><code>usage.limit.approaching</code></td><td>Usage</td><td>Usage crossed 80% of monthly limit</td><td>Starter+</td></tr>
              <tr><td><code>usage.limit.reached</code></td><td>Usage</td><td>Monthly extraction limit exhausted</td><td>Starter+</td></tr>
              <tr><td><code>subscription.created</code></td><td>Billing</td><td>New subscription created</td><td>Pro+</td></tr>
              <tr><td><code>subscription.updated</code></td><td>Billing</td><td>Subscription plan changed</td><td>Pro+</td></tr>
              <tr><td><code>subscription.cancelled</code></td><td>Billing</td><td>Subscription cancelled</td><td>Pro+</td></tr>
              <tr><td><code>invoice.payment_succeeded</code></td><td>Billing</td><td>Invoice payment processed</td><td>Pro+</td></tr>
              <tr><td><code>invoice.payment_failed</code></td><td>Billing</td><td>Invoice payment failed</td><td>Pro+</td></tr>
            </tbody>
          </table>
        </div>
        <h3>Endpoint limits by plan</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Plan</th><th>Endpoints</th><th>Available Events</th></tr></thead>
            <tbody>
              <tr><td>Free</td><td>1</td><td>Core events only</td></tr>
              <tr><td>Starter</td><td>3</td><td>Core + Usage</td></tr>
              <tr><td>Pro</td><td>5</td><td>All events</td></tr>
              <tr><td>Scale</td><td>10</td><td>All events</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr />

      <section id="webhook-payload">
        <h2>Payload Format</h2>
        <p>Every webhook delivery sends a JSON payload in the following envelope format:</p>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre>{`{
  "id": "evt_a1b2c3d4e5f67890",
  "event": "extraction.completed",
  "created": 1775059200,
  "data": {
    "extractionId": "ext_9z8y7x42",
    "status": "success",
    "confidence": 0.9942,
    "documentType": "invoice"
  }
}`}</pre></div>
        <h3>Headers</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Header</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>X-DocuExtract-Signature</code></td><td>HMAC-SHA256 signature: <code>sha256=&lt;hex&gt;</code></td></tr>
              <tr><td><code>X-DocuExtract-Event</code></td><td>Event type (e.g. <code>extraction.completed</code>)</td></tr>
              <tr><td><code>X-DocuExtract-Delivery</code></td><td>Unique delivery ID (UUID) for idempotency</td></tr>
              <tr><td><code>Content-Type</code></td><td><code>application/json</code></td></tr>
              <tr><td><code>User-Agent</code></td><td><code>DocuExtract-Webhooks/1.0</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr />

      <section id="webhook-signatures">
        <h2>Signature Verification</h2>
        <p>Every webhook delivery includes an <code>X-DocuExtract-Signature</code> header containing an HMAC-SHA256 signature of the request body using your endpoint&apos;s signing secret. Always verify this signature before processing events.</p>
        <h3>Node.js</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">javascript</span></div><pre>{`const crypto = require('crypto');

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signatureHeader)
  );
}

// Express example
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-docuextract-signature'];
  if (!verifyWebhook(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.body);
  console.log('Received:', event.event, event.data);
  res.status(200).send('OK');
});`}</pre></div>
        <h3>Python</h3>
        <div className="code-block"><div className="code-header"><span className="code-lang">python</span></div><pre>{`import hmac
import hashlib
import json
from flask import Flask, request, abort

app = Flask(__name__)
WEBHOOK_SECRET = "whsec_your_signing_secret"

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.route("/webhook", methods=["POST"])
def handle_webhook():
    signature = request.headers.get("X-DocuExtract-Signature", "")
    if not verify_signature(request.data, signature, WEBHOOK_SECRET):
        abort(401)
    event = json.loads(request.data)
    print(f"Received: {event['event']}", event["data"])
    return "OK", 200`}</pre></div>
      </section>

      <hr />

      <section id="webhook-retry">
        <h2>Retry Policy</h2>
        <p>If your endpoint returns a non-2xx status code or times out, DocuExtract retries the delivery automatically:</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Attempt</th><th>Delay</th><th>Timeout</th></tr></thead>
            <tbody>
              <tr><td>1st (initial)</td><td>Immediate</td><td>10 seconds</td></tr>
              <tr><td>2nd retry</td><td>~30 seconds</td><td>10 seconds</td></tr>
              <tr><td>3rd retry</td><td>~5 minutes</td><td>10 seconds</td></tr>
              <tr><td>4th retry (final)</td><td>~30 minutes</td><td>10 seconds</td></tr>
            </tbody>
          </table>
        </div>
        <p>After 4 failed attempts, the delivery is marked as failed. You can view delivery history in your dashboard and use the &quot;Send Test&quot; button to verify connectivity.</p>
      </section>

      <hr />

      <section id="webhook-best-practices">
        <h2>Best Practices</h2>
        <ul>
          <li><strong>Respond quickly.</strong> Return a 2xx status within 5 seconds. If you need to do heavy processing, acknowledge the webhook first, then process asynchronously.</li>
          <li><strong>Verify signatures.</strong> Always validate the <code>X-DocuExtract-Signature</code> header before processing. Never skip this step.</li>
          <li><strong>Handle duplicates.</strong> Use the <code>X-DocuExtract-Delivery</code> header (unique UUID per delivery attempt) as an idempotency key. Store processed delivery IDs and skip duplicates.</li>
          <li><strong>Use HTTPS only.</strong> Webhook endpoints must use HTTPS. HTTP URLs are rejected at registration time.</li>
          <li><strong>Fetch full data separately.</strong> Webhook payloads contain summaries. For full extraction results, call <code>GET /v1/extractions/{'{'}id{'}'}</code> with the <code>extraction_id</code> from the payload.</li>
          <li><strong>Monitor delivery health.</strong> Check your webhook delivery logs in the dashboard to catch failures early. Use the &quot;Send Test&quot; button after deploying endpoint changes.</li>
        </ul>
      </section>

      <hr />

      <section id="document-types">
        <h2>Document Types</h2>
        <p>DocuExtract automatically detects document types, or you can specify one explicitly.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Description</th><th>Key Fields Extracted</th></tr></thead>
            <tbody>
              <tr><td><code>invoice</code></td><td>Vendor invoices and billing statements</td><td>vendor name, invoice number, dates, line items, totals, payment terms</td></tr>
              <tr><td><code>receipt</code></td><td>Purchase receipts from retail, restaurants, etc.</td><td>merchant name, date, items purchased, subtotal, tax, total, payment method</td></tr>
              <tr><td><code>bank_statement</code></td><td>Bank and credit card statements</td><td>account number, period, opening/closing balance, transactions</td></tr>
              <tr><td><code>resume</code></td><td>CVs and resumes</td><td>name, contact info, work experience, education, skills</td></tr>
              <tr><td><code>contract</code></td><td>Legal agreements and contracts</td><td>parties, effective date, termination date, key obligations, governing law</td></tr>
              <tr><td><code>form</code></td><td>Filled forms (applications, surveys, intake forms)</td><td>all labeled fields and their values</td></tr>
              <tr><td><code>id_document</code></td><td>ID cards, passports, driver&apos;s licenses</td><td>name, date of birth, expiry, document number, issuing authority</td></tr>
              <tr><td><code>unknown</code></td><td>Fallback for unrecognized types</td><td>best-effort extraction of all visible structured data</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr />

      <section id="errors">
        <h2>Error Codes</h2>
        <p>All errors return a JSON response with an <code>error</code> object containing <code>code</code> and <code>message</code> fields.</p>
        <div className="code-block"><div className="code-header"><span className="code-lang">json</span></div><pre dangerouslySetInnerHTML={{ __html: preBlocks.errorResponse }} /></div>
        <h3>4xx Client Errors</h3>
        <div className="error-card"><div className="error-code">401 — unauthorized</div><div className="error-desc">The API key is missing, malformed, or revoked.</div></div>
        <div className="error-card"><div className="error-code">400 — invalid_request</div><div className="error-desc">A required field is missing or a field value is invalid (includes inaccessible document URLs).</div></div>
        <div className="error-card"><div className="error-code">413 — file_too_large</div><div className="error-desc">The document exceeds the 10 MB size limit.</div></div>
        <div className="error-card"><div className="error-code">415 — unsupported_format</div><div className="error-desc">The file format is not supported. Use PDF, PNG, JPG, or WEBP.</div></div>
        <div className="error-card"><div className="error-code">422 — extraction_failed</div><div className="error-desc">The AI extraction failed after retrying. Try again. If it persists, the document may be corrupted or too complex.</div></div>
        <div className="error-card"><div className="error-code">429 — rate_limited</div><div className="error-desc">You&apos;ve exceeded your per-minute or per-month rate limit. Check the <code>Retry-After</code> header. Upgrade your plan for higher limits.</div></div>
        <h3>5xx Server Errors</h3>
        <div className="error-card"><div className="error-code">500 — internal_error</div><div className="error-desc">Unexpected server error. Please try again or contact support.</div></div>
      </section>

      <hr />

      <section id="pricing">
        <h2>Pricing</h2>
        <p>Simple, transparent pricing. No credit multipliers, no enterprise-gating.</p>
        <div className="pricing-grid">
          <div className="plan-card">
            <div className="plan-name">Free</div>
            <div className="plan-price">$0<span>/mo</span></div>
            <div className="plan-calls">50 extractions/mo</div>
            <ul className="plan-features"><li>5 req/min rate limit</li><li>Haiku model only</li><li>No credit card required</li></ul>
            {ctx.showPricingLinks && <a href="/login" className="plan-subscribe">Get started free →</a>}
          </div>
          <div className="plan-card featured">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-name">Starter</div>
            <div className="plan-price">$49<span>/mo</span></div>
            <div className="plan-calls">1,500 extractions/mo</div>
            <ul className="plan-features"><li>30 req/min rate limit</li><li>Haiku + Sonnet (3x cost)</li><li>Email support</li></ul>
            {ctx.showPricingLinks && <a href="/login?plan=starter&signup=1" className="plan-subscribe filled">Start free trial →</a>}
          </div>
          <div className="plan-card">
            <div className="plan-badge best-value">Best Value</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price">$99<span>/mo</span></div>
            <div className="plan-calls">5,000 extractions/mo</div>
            <ul className="plan-features"><li>60 req/min rate limit</li><li>Haiku + Sonnet (3x cost)</li><li>Priority support</li></ul>
            {ctx.showPricingLinks && <a href="/login?plan=pro&signup=1" className="plan-subscribe">Get started →</a>}
          </div>
          <div className="plan-card">
            <div className="plan-name">Scale</div>
            <div className="plan-price">$249<span>/mo</span></div>
            <div className="plan-calls">20,000 extractions/mo</div>
            <ul className="plan-features"><li>120 req/min rate limit</li><li>All models + Priority</li><li>SLA + dedicated support</li></ul>
            {ctx.showPricingLinks && <a href="/login?plan=scale&signup=1" className="plan-subscribe">Get started →</a>}
          </div>
        </div>
        <h3>Overage Pricing</h3>
        <p>When you exceed your monthly quota, additional extractions are billed at per-plan rates: <strong>$0.04/call</strong> (Starter), <strong>$0.025/call</strong> (Pro), <strong>$0.015/call</strong> (Scale). Free plan blocks requests at the limit.</p>
        <div className="callout callout-tip"><strong>Tip</strong>Monitor your usage with <code>GET /v1/usage</code> or check the <code>X-RateLimit-Remaining-Month</code> header.</div>
      </section>
    </>
  );
}

// Shared tab switching and code copy logic — static script, no user input.
export const docsScript = `
window.switchTab = function(btn, panelId) {
  var tabsEl = btn.closest('.tabs');
  tabsEl.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  tabsEl.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById(panelId).classList.add('active');
};
window.copyCode = async function(btn) {
  var pre = btn.closest('.code-block').querySelector('pre');
  try {
    await navigator.clipboard.writeText(pre.innerText);
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  } catch(e) {}
};
`;
