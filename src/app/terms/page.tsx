import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { legalCss } from '@/content/legal-styles';

export default function TermsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: legalCss }} />
      <PublicNav />
      <div className="legal-layout">
        <aside className="legal-toc">
          <div className="legal-toc-title">Contents</div>
          <a href="#acceptance">Acceptance of Terms</a>
          <a href="#accounts">Accounts &amp; API Keys</a>
          <a href="#acceptable-use">Acceptable Use</a>
          <a href="#availability">Service Availability</a>
          <a href="#billing">Billing &amp; Payments</a>
          <a href="#data">Data Processing</a>
          <a href="#ip">Intellectual Property</a>
          <a href="#liability">Limitation of Liability</a>
          <a href="#termination">Termination</a>
          <a href="#law">Governing Law</a>
          <a href="#changes">Changes to Terms</a>
          <a href="#contact">Contact</a>
        </aside>
        <div className="legal-content">
          <h1>Terms of Service</h1>
          <p className="updated">Last updated: April 12, 2026</p>

          <section id="acceptance">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the DocuExtract API, website, playground, or
              any related services (collectively, the &ldquo;Service&rdquo;), you
              agree to be bound by these Terms of Service. If you are using the
              Service on behalf of an organization, you represent that you have
              authority to bind that organization to these terms.
            </p>
            <p>
              If you do not agree to these terms, do not use the Service. Your
              continued use of the Service after any changes to these terms
              constitutes acceptance of those changes.
            </p>
          </section>

          <section id="accounts">
            <h2>2. Account Registration &amp; API Keys</h2>
            <p>
              To use the Service beyond the free playground demo, you must create
              an account. You agree to provide accurate information and keep your
              account credentials secure.
            </p>
            <p>
              When you create an account, we generate an API key for you. You are
              responsible for:
            </p>
            <ul>
              <li>Keeping your API key confidential and storing it securely.</li>
              <li>All activity that occurs under your API key, whether or not you authorized it.</li>
              <li>Rotating your key immediately if you suspect it has been compromised.</li>
              <li>Not sharing your API key in public repositories, client-side code, or any publicly accessible location.</li>
            </ul>
            <p>
              We reserve the right to revoke API keys that are found to be
              compromised or in violation of these terms.
            </p>
          </section>

          <section id="acceptable-use">
            <h2>3. Acceptable Use</h2>
            <p>
              You agree to use the Service only for lawful purposes. You must not
              use the Service to process documents that contain illegal content,
              facilitate fraud, or violate the rights of others.
            </p>
            <p>
              For the full set of restrictions and expectations, please review our{' '}
              <a href="/acceptable-use">Acceptable Use Policy</a>, which is
              incorporated into these Terms by reference.
            </p>
          </section>

          <section id="availability">
            <h2>4. Service Availability</h2>
            <p>
              We strive to keep DocuExtract available and reliable, but we do not
              guarantee uninterrupted or error-free operation. We may perform
              maintenance, deploy updates, or experience outages that temporarily
              affect the Service.
            </p>
            <p>
              <strong>Free tier:</strong> Provided as-is with no uptime
              commitment. We may rate-limit, throttle, or temporarily suspend
              free-tier access at our discretion.
            </p>
            <p>
              <strong>Paid tiers:</strong> We make commercially reasonable efforts
              to maintain high availability. In the event of extended downtime, we
              will communicate through our status page and email.
            </p>
            <p>
              We are not liable for any damages resulting from service
              interruptions, including lost data, missed deadlines, or downstream
              failures in your application.
            </p>
          </section>

          <section id="billing">
            <h2>5. Billing &amp; Payments</h2>
            <p>
              Paid plans are billed monthly through Stripe. By subscribing to a
              paid plan, you authorize us to charge your payment method on a
              recurring basis.
            </p>
            <ul>
              <li>
                <strong>Auto-renewal:</strong> Subscriptions renew automatically
                at the end of each billing period unless you cancel before the
                renewal date.
              </li>
              <li>
                <strong>Overage charges:</strong> If your plan includes per-call
                overage billing, additional usage beyond your plan allocation will
                be charged at the overage rate listed on our{' '}
                <a href="/pricing">pricing page</a>.
              </li>
              <li>
                <strong>Cancellation:</strong> You can cancel your subscription at
                any time from your dashboard. Cancellation takes effect at the end
                of your current billing period &mdash; you retain access until
                then.
              </li>
              <li>
                <strong>Refunds:</strong> We do not offer prorated refunds for
                partial billing periods. If you believe you were charged in error,
                contact us within 14 days at{' '}
                <a href="mailto:legal@docuextract.dev">legal@docuextract.dev</a>.
              </li>
              <li>
                <strong>Price changes:</strong> We will notify you at least 30
                days before any price increase. Continued use after the effective
                date constitutes acceptance of the new pricing.
              </li>
            </ul>
          </section>

          <section id="data">
            <h2>6. Data Processing</h2>
            <p>
              <strong>
                DocuExtract does not store your documents or extracted data.
              </strong>{' '}
              Documents you submit are processed in memory, used solely for
              extraction, and discarded immediately after the response is
              returned. We do not retain copies of your documents or the
              structured data we extract from them.
            </p>
            <p>What we do store:</p>
            <ul>
              <li>
                <strong>Usage metadata:</strong> Timestamp, document type, model
                used, processing time, token counts, and confidence scores. This
                data does not include the content of your documents.
              </li>
              <li>
                <strong>Account information:</strong> Email address, hashed API
                key, plan details, and billing information managed by Stripe.
              </li>
            </ul>
            <p>
              You own your documents and the data extracted from them. We claim no
              rights over your input or output data. For more details on how we
              handle your information, see our{' '}
              <a href="/privacy">Privacy Policy</a>.
            </p>
          </section>

          <section id="ip">
            <h2>7. Intellectual Property</h2>
            <p>
              <strong>Your content:</strong> You retain all rights to the
              documents you submit and the structured data you receive. We do not
              claim ownership of your input or output.
            </p>
            <p>
              <strong>Our service:</strong> The DocuExtract API, website,
              documentation, brand assets, and underlying technology are owned by
              DocuExtract. These Terms do not grant you any rights to our
              intellectual property beyond the limited right to use the Service as
              described here.
            </p>
            <p>
              You may not reverse-engineer, decompile, or attempt to extract the
              source code of the Service, except to the extent that applicable law
              expressly permits it.
            </p>
          </section>

          <section id="liability">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, DocuExtract and its
              operators shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of profits, data, or business opportunities, arising from your
              use of the Service.
            </p>
            <p>
              Our total liability for any claim related to the Service is limited
              to the amount you paid us in the 12 months preceding the claim, or
              $100, whichever is greater.
            </p>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, whether express or
              implied, including warranties of merchantability, fitness for a
              particular purpose, and non-infringement. We do not guarantee the
              accuracy, completeness, or reliability of any extraction results.
            </p>
          </section>

          <section id="termination">
            <h2>9. Termination</h2>
            <p>
              <strong>By you:</strong> You can close your account at any time by
              contacting us or through your dashboard settings. Upon termination,
              your API key will be revoked and access to the Service will cease.
            </p>
            <p>
              <strong>By us:</strong> We may suspend or terminate your account
              immediately, without prior notice, if we reasonably believe you have
              violated these Terms, the{' '}
              <a href="/acceptable-use">Acceptable Use Policy</a>, or if your use
              of the Service poses a risk to other users or our infrastructure.
            </p>
            <p>
              Upon termination, sections that by their nature should survive
              (including Limitation of Liability, Intellectual Property, and
              Governing Law) will remain in effect.
            </p>
          </section>

          <section id="law">
            <h2>10. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the State of Delaware, United States, without regard to its
              conflict of law provisions. Any disputes arising from these Terms or
              the Service will be resolved in the state or federal courts located
              in Delaware.
            </p>
          </section>

          <section id="changes">
            <h2>11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. When we make material
              changes, we will notify you by email (sent to the address associated
              with your account) and update the &ldquo;Last updated&rdquo; date
              at the top of this page.
            </p>
            <p>
              Your continued use of the Service after the updated Terms take
              effect constitutes acceptance of those changes. If you disagree with
              the changes, you should stop using the Service and close your
              account.
            </p>
          </section>

          <section id="contact">
            <h2>12. Contact</h2>
            <p>
              If you have questions about these Terms, reach out to us at{' '}
              <a href="mailto:legal@docuextract.dev">legal@docuextract.dev</a>.
            </p>
          </section>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
