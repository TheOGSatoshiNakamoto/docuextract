const css = `
  :root {
    --bg: #0f1117;
    --bg-card: #161b27;
    --border: #2a3147;
    --text: #e2e8f0;
    --text-muted: #8892a4;
    --accent: #6c8ef5;
    --accent-hover: #5a7ef0;
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
    --max-w: 1100px;
    --radius: 10px;
  }

  body {
    font-family: var(--font-sans);
    background: var(--bg);
    color: var(--text);
    margin: 0;
  }

  .nf-wrap {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 24px;
  }

  .nf-code {
    font-size: 96px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -4px;
    line-height: 1;
    margin-bottom: 16px;
    opacity: 0.25;
  }

  .nf-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 12px;
  }

  .nf-desc {
    color: var(--text-muted);
    font-size: 16px;
    line-height: 1.6;
    max-width: 440px;
    margin-bottom: 32px;
  }

  .nf-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nf-links a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.15s;
  }

  .nf-primary {
    background: var(--accent);
    color: #fff;
  }
  .nf-primary:hover {
    background: var(--accent-hover);
    text-decoration: none;
  }

  .nf-outline {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
  }
  .nf-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
    text-decoration: none;
  }

  .nf-home {
    position: absolute;
    top: 24px;
    left: 24px;
  }

  .nf-home a {
    font-weight: 700;
    font-size: 18px;
    color: var(--text);
    text-decoration: none;
  }
  .nf-home a span { color: var(--accent); }
`;

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="nf-home">
        <a href="/">Docu<span>Extract</span></a>
      </div>
      <div className="nf-wrap">
        <div className="nf-code">404</div>
        <h1 className="nf-title">This page doesn't exist.</h1>
        <p className="nf-desc">
          But our API does. Send any document, get structured JSON back in seconds.
        </p>
        <div className="nf-links">
          <a href="/" className="nf-primary">Back to home</a>
          <a href="/playground" className="nf-outline">Try the playground</a>
          <a href="/docs" className="nf-outline">Read the docs</a>
        </div>
      </div>
    </>
  );
}
