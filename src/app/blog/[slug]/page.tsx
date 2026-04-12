import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

// ── Markdown parsing ─────────────────────────────────────────────────────────

interface PostData {
  title: string;
  description: string;
  slug: string;
  date: string;
  keywords: string[];
  readingTime: string;
  html: string;
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

/** Simple markdown to HTML converter — handles the subset we use in blog posts */
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (fenced)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trimEnd();
      return `<pre class="code-block" data-lang="${lang}"><code>${escaped}</code></pre>`;
    })
    // Inline code (escape HTML inside backticks)
    .replace(/`([^`]+)`/g, (_m, code) => {
      const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<code class="inline-code">${esc}</code>`;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Paragraphs: wrap non-tag lines
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<[a-z]/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return DOMPurify.sanitize(html);
}

function getPost(slug: string): PostData | null {
  const blogDir = path.join(process.cwd(), 'blog');
  const files = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter((f) => f.endsWith('.md')) : [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const postSlug = (meta.slug as string) || file.replace('.md', '');
    if (postSlug === slug) {
      return {
        title: (meta.title as string) || '',
        description: (meta.description as string) || '',
        slug: postSlug,
        date: (meta.date as string) || '',
        keywords: Array.isArray(meta.keywords) ? (meta.keywords as string[]) : [],
        readingTime: estimateReadingTime(body),
        html: markdownToHtml(body),
      };
    }
  }
  return null;
}

export function generateStaticParams() {
  const blogDir = path.join(process.cwd(), 'blog');
  if (!fs.existsSync(blogDir)) return [];
  return fs.readdirSync(blogDir)
    .filter((f) => f.endsWith('.md') && f !== 'launch-materials.md')
    .map((f) => {
      const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
      const { meta } = parseFrontmatter(raw);
      return { slug: (meta.slug as string) || f.replace('.md', '') };
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Blog | DocuExtract' };
  return { title: `${post.title} | DocuExtract` };
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
  --max-w: 720px; --radius: 10px;
}
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 16px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.article-header { max-width: var(--max-w); margin: 0 auto; padding: 60px 24px 40px; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; margin-bottom: 24px; transition: color 0.15s; }
.back-link:hover { color: var(--text); text-decoration: none; }
.article-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.article-header h1 { font-size: clamp(28px, 5vw, 40px); font-weight: 800; letter-spacing: -1px; line-height: 1.2; margin-bottom: 12px; }
.article-desc { font-size: 17px; color: var(--text-muted); line-height: 1.6; }
.article-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px; }
.article-tag { font-size: 11px; padding: 2px 8px; background: var(--accent-dim); border: 1px solid rgba(108,142,245,0.2); color: var(--accent); border-radius: 12px; }

.article-body { max-width: var(--max-w); margin: 0 auto; padding: 0 24px 60px; }
.article-body h1 { display: none; }
.article-body h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.3px; margin: 40px 0 16px; padding-top: 20px; border-top: 1px solid var(--border); }
.article-body h3 { font-size: 18px; font-weight: 700; margin: 28px 0 12px; }
.article-body p { margin-bottom: 16px; color: var(--text); line-height: 1.8; }
.article-body ul { margin: 0 0 16px 20px; }
.article-body li { margin-bottom: 6px; color: var(--text); line-height: 1.7; }
.article-body strong { color: #fff; }
.article-body hr { border: none; border-top: 1px solid var(--border); margin: 32px 0; }
.article-body blockquote { border-left: 3px solid var(--accent); padding: 12px 16px; background: var(--bg-card); border-radius: 0 8px 8px 0; margin: 16px 0; color: var(--text-muted); font-style: italic; }
.article-body img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
.article-body .code-block { background: var(--bg-code); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; overflow-x: auto; margin: 16px 0; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; position: relative; }
.article-body .code-block code { background: none; padding: 0; font-size: inherit; color: var(--text); }
.article-body .code-block[data-lang]::before { content: attr(data-lang); position: absolute; top: 8px; right: 12px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-sans); }
.article-body .inline-code { background: var(--bg-code); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; }

.article-cta { max-width: var(--max-w); margin: 0 auto 60px; padding: 0 24px; }
.cta-card { background: linear-gradient(135deg, rgba(108,142,245,0.08), rgba(192,132,252,0.05)); border: 1px solid rgba(108,142,245,0.2); border-radius: 12px; padding: 28px; text-align: center; }
.cta-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.cta-card p { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 7px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; }

@media (max-width: 600px) {
  .article-header { padding-top: 40px; }
}
`;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <PublicNav />

      <article>
        <div className="article-header">
          <a href="/blog" className="back-link">← Back to Blog</a>
          <div className="article-meta">
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <h1>{post.title}</h1>
          <p className="article-desc">{post.description}</p>
          {post.keywords.length > 0 && (
            <div className="article-tags">
              {post.keywords.map((kw) => (
                <span key={kw} className="article-tag">{kw}</span>
              ))}
            </div>
          )}
        </div>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <div className="article-cta">
        <div className="cta-card">
          <h3>Try DocuExtract for free</h3>
          <p>50 extractions/month. No credit card. Extract data from any document in seconds.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <a href="/playground" className="btn btn-primary">Try the playground →</a>
          </div>
        </div>
      </div>

      <PublicFooter />
    </>
  );
}
