'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Highlighter } from 'shiki';

// Module-level cache so the highlighter is only created once per session
let hlCache: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!hlCache) {
    hlCache = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-dark'],
        langs: ['bash', 'javascript', 'typescript', 'python', 'go', 'json', 'shell'],
      })
    );
  }
  return hlCache;
}

// Map display tab labels → Shiki language IDs
const SHIKI_LANG: Record<string, string> = {
  curl: 'bash',
  shell: 'bash',
  'Node.js': 'javascript',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Go: 'go',
  JSON: 'json',
};

export interface CodeBlockProps {
  /** Keys are the tab label (e.g. "curl", "Node.js"), values are the raw code strings */
  code: Record<string, string>;
  showLineNumbers?: boolean;
  filename?: string;
  /** Show macOS traffic-light dots in the header */
  showChrome?: boolean;
}

export default function CodeBlock({
  code,
  showLineNumbers = false,
  filename,
  showChrome = false,
}: CodeBlockProps) {
  const langs = Object.keys(code);
  const [activeLang, setActiveLang] = useState(langs[0]);
  const [highlighted, setHighlighted] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getHighlighter().then((h) => {
      const result: Record<string, string> = {};
      for (const [label, src] of Object.entries(code)) {
        const shikiLang = SHIKI_LANG[label] ?? label.toLowerCase();
        try {
          let html = h.codeToHtml(src.trim(), { lang: shikiLang, theme: 'github-dark' });
          // Make the shiki <pre> background transparent so our container controls it
          html = html.replace(/background-color:#[0-9a-fA-F]{6}/gi, 'background-color:transparent');
          result[label] = html;
        } catch {
          // Fallback: plain pre/code
          result[label] = `<pre style="margin:0;padding:16px 20px;overflow:auto"><code style="font-size:13px;line-height:1.6;color:#e2e8f0">${escapeHtml(src.trim())}</code></pre>`;
        }
      }
      setHighlighted(result);
    });
  // Only run once on mount — code prop changes are not expected
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code[activeLang] ?? '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentHtml = highlighted[activeLang];
  const currentRaw = code[activeLang] ?? '';

  return (
    <div
      style={{
        background: '#1e2435',
        border: '1px solid rgba(108,142,245,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
        fontFamily: "'SF Mono','Fira Code',Consolas,monospace",
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderBottom: '1px solid #2a3147',
          minHeight: 40,
        }}
      >
        {showChrome && (
          <div style={{ display: 'flex', gap: 6, marginRight: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'block' }} />
          </div>
        )}

        {filename && (
          <span style={{ color: '#8892a4', fontSize: 12 }}>{filename}</span>
        )}

        {/* Language tabs */}
        {langs.length > 1 && (
          <div style={{ display: 'flex', gap: 2, marginLeft: filename ? 'auto' : 0 }}>
            {langs.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 5,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  background: activeLang === lang ? 'rgba(108,142,245,0.15)' : 'transparent',
                  color: activeLang === lang ? '#6c8ef5' : '#8892a4',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ borderColor: '#6c8ef5', color: '#6c8ef5' }}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid #2a3147',
            borderRadius: 5,
            padding: '3px 10px',
            cursor: 'pointer',
            color: '#8892a4',
            fontSize: 11,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'inherit',
            minWidth: 52,
            justifyContent: 'center',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                style={{ color: '#4ade80' }}
              >
                ✓ Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Code body ── */}
      <div style={{ overflow: 'auto' }}>
        {currentHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: currentHtml }}
            style={{ fontSize: 13, lineHeight: 1.6 }}
          />
        ) : (
          <pre
            style={{
              margin: 0,
              padding: '16px 20px',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#e2e8f0',
              overflow: 'auto',
              background: 'transparent',
            }}
          >
            <code>{currentRaw}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
