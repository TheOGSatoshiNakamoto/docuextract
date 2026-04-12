import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { legalCss } from '@/content/legal-styles';

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: legalCss }} />
      <PublicNav />
      <div className="legal-layout">
        <aside className="legal-toc">
          <div className="legal-toc-title">Contents</div>
          <a href="#collect">What We Collect</a>
          <a href="#not-collect">What We Do NOT Collect</a>
          <a href="#how-we-use">How We Use Your Data</a>
          <a href="#third-parties">Third-Party Processors</a>
          <a href="#cookies">Cookies</a>
          <a href="#retention">Data Retention</a>
          <a href="#rights">Your Rights</a>
          <a href="#children">Children&rsquo;s Privacy</a>
          <a href="#international">International Data Transfers</a>
          <a href="#changes">Changes to This Policy</a>
          <a href="#contact">Contact</a>
        </aside>
        <div className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="updated">Last updated: April 12, 2026</p>

          <p>
            DocuExtract is a document extraction API operated by DocuExtract (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;).
            This policy explains what data we collect, what we explicitly do not collect, and how we handle everything in between.
            We believe privacy policies should be readable by humans, not just lawyers.
          </p>

          <h2 id="collect">1. What We Collect</h2>
          <p>When you create an account or use the API, we collect:</p>
          <ul>
            <li><strong>Account information:</strong> your email address and authentication provider (GitHub, Google, or magic link). We do not collect passwords &mdash; authentication is handled via OAuth or one-time magic links.</li>
            <li><strong>API usage logs:</strong> timestamps, document types processed, AI model used, processing time, token counts, and confidence scores. We use this data to enforce rate limits, generate your usage reports, and improve extraction accuracy.</li>
            <li><strong>Payment information:</strong> managed entirely by Stripe. We store your Stripe customer ID and subscription status in our database, but we never see, transmit, or store your card number, CVC, or billing address.</li>
          </ul>

          <h2 id="not-collect">2. What We Do NOT Collect</h2>
          <p>
            <strong>We do not store your documents. Ever.</strong>
          </p>
          <p>
            Documents sent to the <code>/v1/extract</code> endpoint are processed entirely in memory by the Claude AI model and immediately discarded once the structured JSON response is returned.
            We never retain, cache, log, or write document content to disk. Your invoices, receipts, contracts, and forms pass through our system &mdash; they do not stay.
          </p>
          <p>
            This is a deliberate architectural decision, not an afterthought. We designed DocuExtract so that document non-storage is enforced at the infrastructure level, not by policy alone.
            There is no &ldquo;document storage&rdquo; table in our database. There is no file bucket for uploaded content. The data literally has nowhere to persist.
          </p>
          <p>
            Anthropic (the Claude API provider) also does not train on or retain API inputs. See their <a href="https://www.anthropic.com/policies/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a> for details.
          </p>

          <h2 id="how-we-use">3. How We Use Your Data</h2>
          <p>We use the data we collect for the following purposes:</p>
          <ul>
            <li><strong>Authentication:</strong> verify your identity and authorize API requests.</li>
            <li><strong>Rate limiting:</strong> enforce per-minute and per-month request limits based on your plan.</li>
            <li><strong>Billing:</strong> track usage for metered billing, process payments, and manage subscriptions through Stripe.</li>
            <li><strong>Transactional emails:</strong> send usage alerts, weekly reports, payment confirmations, and account notifications. You can unsubscribe from non-essential emails at any time.</li>
            <li><strong>Service improvement:</strong> analyze aggregated, anonymized usage patterns (e.g., average processing times, popular document types) to improve extraction accuracy and API performance. We never use individual document content for this purpose because we do not have it.</li>
          </ul>

          <h2 id="third-parties">4. Third-Party Processors</h2>
          <p>We rely on a small number of trusted infrastructure providers to operate DocuExtract:</p>
          <ul>
            <li><strong>Supabase</strong> (US) &mdash; PostgreSQL database, authentication, and session management.</li>
            <li><strong>Anthropic</strong> (US) &mdash; Claude AI models for document extraction. Documents are sent to the Claude API for processing and are not retained by Anthropic.</li>
            <li><strong>Stripe</strong> (US) &mdash; Payment processing, subscription management, and invoicing. Stripe is PCI DSS Level 1 certified.</li>
            <li><strong>Vercel</strong> (US) &mdash; Application hosting, serverless function execution, and edge network delivery.</li>
            <li><strong>Resend</strong> (US) &mdash; Transactional email delivery (usage alerts, welcome emails, receipts).</li>
          </ul>
          <p>We do not sell, rent, or share your data with any third party for advertising or marketing purposes.</p>

          <h2 id="cookies">5. Cookies</h2>
          <p>
            We use <strong>essential cookies only</strong> &mdash; specifically, authentication session tokens managed by Supabase.
            These cookies are required for the dashboard and API key management to function.
          </p>
          <p>
            We do not use tracking cookies, analytics cookies, or third-party advertising cookies.
            There are no cookie banners because there is nothing optional to consent to.
          </p>

          <h2 id="retention">6. Data Retention</h2>
          <ul>
            <li><strong>Account data</strong> (email, API keys, plan info): retained for the lifetime of your account. Deleted permanently when you delete your account.</li>
            <li><strong>API usage logs</strong> (timestamps, document types, processing metrics): retained for 90 days, then automatically purged. Aggregated statistics may be retained longer in anonymized form.</li>
            <li><strong>Payment records:</strong> retained by Stripe according to their data retention policy and applicable financial regulations.</li>
            <li><strong>Document content:</strong> not applicable &mdash; never stored in the first place.</li>
          </ul>

          <h2 id="rights">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your personal data &mdash; view your account info, usage history, and billing details from the <a href="/dashboard">dashboard</a>.</li>
            <li><strong>Correct</strong> inaccurate data &mdash; update your email or account details in <a href="/dashboard/settings">Settings</a>.</li>
            <li><strong>Delete</strong> your account &mdash; permanently remove your account, API keys, and usage history from <a href="/dashboard/settings">Settings</a>. Document content is never stored, so there is nothing additional to delete.</li>
            <li><strong>Export</strong> your data &mdash; request a machine-readable export of your account and usage data by emailing <a href="mailto:privacy@docuextract.dev">privacy@docuextract.dev</a>.</li>
          </ul>
          <p>We respond to all data requests within 30 days.</p>

          <h2 id="children">8. Children&rsquo;s Privacy</h2>
          <p>
            DocuExtract is a developer tool designed for professional and business use.
            We do not knowingly collect personal information from anyone under the age of 13.
            If you believe a child under 13 has created an account, please contact us at{' '}
            <a href="mailto:privacy@docuextract.dev">privacy@docuextract.dev</a> and we will promptly delete the account.
          </p>

          <h2 id="international">9. International Data Transfers</h2>
          <p>
            DocuExtract and all of our third-party processors are based in the United States.
            If you access the service from outside the US, your data (account information and usage logs &mdash; never document content) will be transferred to and processed in the United States.
          </p>
          <p>
            By using DocuExtract, you consent to this transfer. We apply the same security and privacy protections regardless of where you are located.
          </p>

          <h2 id="changes">10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy as the service evolves.
            If we make material changes &mdash; especially anything affecting how we handle your data &mdash; we will notify registered users by email before the changes take effect.
          </p>
          <p>
            Minor clarifications or formatting updates will be reflected in the &ldquo;Last updated&rdquo; date at the top of this page without separate notification.
          </p>

          <h2 id="contact">11. Contact</h2>
          <p>
            Questions about this policy or your data? Reach us at{' '}
            <a href="mailto:privacy@docuextract.dev">privacy@docuextract.dev</a>.
            We aim to respond within 2 business days.
          </p>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
