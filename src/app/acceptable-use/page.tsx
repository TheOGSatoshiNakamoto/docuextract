import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { legalCss } from '@/content/legal-styles';

export default function AcceptableUsePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: legalCss }} />
      <PublicNav />
      <div className="legal-layout">
        <aside className="legal-toc">
          <div className="legal-toc-title">Contents</div>
          <a href="#permitted">Permitted Use</a>
          <a href="#prohibited">Prohibited Uses</a>
          <a href="#rate-limits">Rate Limiting &amp; Fair Use</a>
          <a href="#consequences">Consequences of Violation</a>
          <a href="#reporting">Reporting Abuse</a>
          <a href="#contact">Contact</a>
        </aside>
        <div className="legal-content">
          <h1>Acceptable Use Policy</h1>
          <p className="updated">Last updated: April 12, 2026</p>

          <h2 id="permitted">Permitted Use</h2>
          <p>
            DocuExtract is a document extraction API. It is designed for one thing: converting
            unstructured documents into structured JSON data. You are welcome to use the API for
            any lawful purpose that falls within this scope, including:
          </p>
          <ul>
            <li>Extracting structured data from invoices, receipts, contracts, forms, and resumes</li>
            <li>Integrating document parsing into your own applications, workflows, or automation pipelines</li>
            <li>Processing documents on behalf of your end users, provided you have their consent</li>
            <li>Testing and evaluating the API using the playground or your own development environment</li>
          </ul>
          <p>
            If your use case involves documents and structured data, you are almost certainly in the right place.
          </p>

          <h2 id="prohibited">Prohibited Uses</h2>
          <p>
            We keep this list short and specific. These restrictions exist to protect the
            service, our infrastructure, and every developer who depends on it.
          </p>
          <ul>
            <li>
              <strong>Illegal content.</strong> Do not process documents that contain illegal
              material or that you do not have the legal right to access. This includes forged,
              stolen, or fraudulently obtained documents.
            </li>
            <li>
              <strong>Reverse engineering.</strong> Do not attempt to reverse-engineer, decompile,
              or extract the underlying models, prompts, or algorithms behind the API. The API
              response is yours; the system that generates it is ours.
            </li>
            <li>
              <strong>API key sharing.</strong> Your API key is tied to your account and your
              usage limits. Do not share it with other individuals or organizations. If multiple
              people need access, each should have their own account.
            </li>
            <li>
              <strong>Rate limit abuse.</strong> Do not deliberately circumvent rate limits by
              rotating API keys, distributing requests across multiple free accounts, or using
              automated tools to bypass throttling. Rate limits exist to keep the service fast
              and fair for everyone.
            </li>
            <li>
              <strong>Privacy violations.</strong> Do not use the API to extract personal data
              from documents without proper authorization from the data subject, or in violation
              of applicable privacy laws (GDPR, CCPA, etc.).
            </li>
            <li>
              <strong>Spam and fraud.</strong> Do not use extracted data to send unsolicited
              communications, commit identity fraud, or facilitate financial crimes.
            </li>
            <li>
              <strong>Service disruption.</strong> Do not intentionally overload, probe, or
              stress-test the API beyond your plan&apos;s limits without prior written approval.
            </li>
          </ul>

          <h2 id="rate-limits">Rate Limiting &amp; Fair Use</h2>
          <p>
            Every plan includes rate limits — both per-minute and per-month. These are not
            arbitrary restrictions. They ensure that one user&apos;s traffic spike does not degrade
            performance for everyone else.
          </p>
          <p>
            If you hit your rate limit, the API returns a <code>429</code> status code with a
            <code>Retry-After</code> header. Back off and retry — do not hammer the endpoint.
            Persistent <code>429</code> abuse may result in temporary suspension.
          </p>
          <p>
            If your workload regularly exceeds your current plan&apos;s limits, that is a sign
            to upgrade. See our <a href="/pricing">pricing page</a> for details on each tier&apos;s
            allocations and overage rates.
          </p>

          <h2 id="consequences">Consequences of Violation</h2>
          <p>
            We believe in proportional responses. Not every violation warrants the same action.
            Here is how we handle things:
          </p>
          <ol>
            <li>
              <strong>Warning.</strong> For first-time or minor violations (accidental rate limit
              abuse, key sharing by mistake), we will email you a clear explanation of the issue
              and what to fix.
            </li>
            <li>
              <strong>Temporary suspension.</strong> For repeated violations or moderate severity
              issues, we may temporarily suspend API access. You will receive an email explaining
              the suspension and how to resolve it.
            </li>
            <li>
              <strong>Account termination.</strong> For serious or willful violations (processing
              illegal documents, deliberate fraud, persistent abuse after warnings), we will
              permanently terminate the account. Remaining prepaid balance is forfeited.
            </li>
          </ol>
          <p>
            In all cases, we will attempt to contact you before or immediately after taking
            action. We are not interested in surprising anyone — we want to fix problems, not
            create new ones.
          </p>

          <h2 id="reporting">Reporting Abuse</h2>
          <p>
            If you believe someone is misusing the DocuExtract API — or if you have received
            unwanted communications based on data extracted through our service — please let us
            know.
          </p>
          <p>
            Email <a href="mailto:abuse@docuextract.dev">abuse@docuextract.dev</a> with as much
            detail as you can provide. We review every report and will respond within 48 hours.
          </p>

          <h2 id="contact">Contact</h2>
          <p>
            Questions about this policy? Not sure if your use case is permitted? Reach out
            before you build — we are happy to clarify.
          </p>
          <p>
            Email: <a href="mailto:legal@docuextract.dev">legal@docuextract.dev</a>
          </p>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
