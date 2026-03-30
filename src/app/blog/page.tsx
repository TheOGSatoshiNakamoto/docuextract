import fs from 'fs';
import path from 'path';

// ── Blog post metadata parsing ────────────────────────────────────────────────

interface PostMeta {
  title: string;
  description: string;
  slug: string;
  date: string;
  keywords: string[];
  readingTime: string;
}

function parseFrontmatter(content: string): { meta: Record<string, string | string[]>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) {
      const val = m[2].trim();
      if (val.startsWith('[')) {
        try { meta[m[1]] = JSON.parse(val.replace(/'/g, '"')); } catch { meta[m[1]] = val; }
      } else {
        meta[m[1]] = val.replace(/^"(.*)"$/, '$1');
      }
    }
  }
  return { meta, body: match[2] };
}

function estimateReadingTime(text: string): string {
  const words = text.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function getPosts(): PostMeta[] {
  const blogDir = path.join(process.cwd(), 'blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md') && f !== 'launch-materials.md');
  const posts: PostMeta[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    posts.push({
      title: (meta.title as string) || file.replace('.md', ''),
      description: (meta.description as string) || '',
      slug: (meta.slug as string) || file.replace('.md', ''),
      date: (meta.date as string) || '',
      keywords: Array.isArray(meta.keywords) ? (meta.keywords as string[]) : [],
      readingTime: estimateReadingTime(body),
    });
  }

  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-hover: #5a7ef0;
  --accent-dim: rgba(108,142,245,0.12); --green: #4ade80; --purple: #c084fc;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
  --max-w: 1100px; --radius: 10px;
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 16px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

nav { position: sticky; top: 0; z-index: 100; background: rgba(15,17,23,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
.nav-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; gap: 32px; }
.nav-logo { font-weight: 700; font-size: 18px; color: var(--text); letter-spacing: -0.3px; text-decoration: none; }
.nav-logo span { color: var(--accent); }
.nav-links { display: flex; gap: 24px; list-style: none; margin-left: auto; align-items: center; }
.nav-links a { color: var(--text-muted); font-size: 14px; transition: color 0.15s; text-decoration: none; }
.nav-links a:hover { color: var(--text); }
.nav-links a.active { color: var(--accent); }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; }

.hero { padding: 80px 24px 48px; text-align: center; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(108,142,245,0.08) 0%, transparent 70%); pointer-events: none; }
.section-label { font-size: 12px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
.hero h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 800; letter-spacing: -1.5px; margin-bottom: 14px; }
.hero h1 .hl { color: var(--accent); }
.hero p { font-size: 17px; color: var(--text-muted); max-width: 500px; margin: 0 auto; }

.posts-grid { max-width: var(--max-w); margin: 0 auto; padding: 0 24px 80px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.post-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 24px; display: flex; flex-direction: column; transition: border-color 0.15s; text-decoration: none; }
.post-card:hover { border-color: rgba(108,142,245,0.4); text-decoration: none; }
.post-date { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.post-reading { color: var(--text-muted); }
.post-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 10px; line-height: 1.3; letter-spacing: -0.3px; }
.post-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; flex: 1; margin-bottom: 16px; }
.post-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.post-tag { font-size: 11px; padding: 2px 8px; background: var(--accent-dim); border: 1px solid rgba(108,142,245,0.2); color: var(--accent); border-radius: 12px; }
.post-cta { font-size: 13px; color: var(--accent); font-weight: 500; margin-top: 12px; }

footer { border-top: 1px solid var(--border); padding: 40px 24px; }
.footer-inner { max-width: var(--max-w); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
.footer-logo { font-weight: 700; font-size: 16px; color: var(--text); }
.footer-logo span { color: var(--accent); }
.footer-links { display: flex; gap: 24px; }
.footer-links a { font-size: 13px; color: var(--text-muted); transition: color 0.15s; }
.footer-links a:hover { color: var(--text); text-decoration: none; }
.footer-copy { font-size: 13px; color: var(--text-muted); }

@media (max-width: 600px) {
  .nav-links li:not(:last-child):not(:nth-last-child(2)) { display: none; }
  .posts-grid { grid-template-columns: 1fr; }
}
`;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const posts = getPosts();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav>
        <div className="nav-inner">
          <a href="/" className="nav-logo">Docu<span>Extract</span></a>
          <ul className="nav-links">
            <li><a href="/docs">Docs</a></li>
            <li><a href="/playground">Playground</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/blog" className="active">Blog</a></li>
            <li><a href="/login" className="btn btn-primary" style={{ padding: '6px 14px' }}>Get API Key</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label">Blog</div>
          <h1>Build smarter with <span className="hl">DocuExtract</span></h1>
          <p>Tutorials, architecture deep-dives, and build-in-public updates from the team behind DocuExtract.</p>
        </div>
      </section>

      <div className="posts-grid">
        {posts.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="post-card">
            <div className="post-date">
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              <span className="post-reading">· {post.readingTime}</span>
            </div>
            <div className="post-title">{post.title}</div>
            <div className="post-desc">{post.description}</div>
            {post.keywords.length > 0 && (
              <div className="post-tags">
                {post.keywords.slice(0, 3).map((kw) => (
                  <span key={kw} className="post-tag">{kw}</span>
                ))}
              </div>
            )}
            <span className="post-cta">Read article →</span>
          </a>
        ))}
      </div>

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px 80px', color: 'var(--text-muted)' }}>
          No blog posts yet. Check back soon.
        </div>
      )}

      <footer>
        <div className="footer-inner">
          <span className="footer-logo">Docu<span>Extract</span></span>
          <div className="footer-links">
            <a href="/docs">Docs</a>
            <a href="/pricing">Pricing</a>
            <a href="/playground">Playground</a>
            <a href="/blog">Blog</a>
          </div>
          <span className="footer-copy">Built with Claude AI</span>
        </div>
      </footer>
    </>
  );
}
