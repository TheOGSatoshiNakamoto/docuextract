'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  /** Map of language label → code string, e.g. { curl: '...', Python: '...' } */
  code: Record<string, string>;
  showLineNumbers?: boolean;
  filename?: string;
  /** Show macOS window chrome (three dots) instead of filename */
  showChrome?: boolean;
}

const LANG_MAP: Record<string, string> = {
  curl: 'bash',
  bash: 'bash',
  Python: 'python',
  python: 'python',
  'Node.js': 'typescript',
  nodejs: 'typescript',
  TypeScript: 'typescript',
  javascript: 'javascript',
  JavaScript: 'javascript',
  Go: 'go',
  go: 'go',
  JSON: 'json',
  json: 'json',
};

// Custom DocuExtract theme matching the design system
const THEME = {
  name: 'docuextract',
  type: 'dark' as const,
  colors: {
    'editor.background': '#0F172A',
    'editor.foreground': '#F1F5F9',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#475569' } },
    { scope: ['string', 'string.quoted'], settings: { foreground: '#F59E0B' } },
    { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#06B6D4' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#10B981' } },
    { scope: ['variable', 'variable.other'], settings: { foreground: '#F1F5F9' } },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#818CF8' } },
    { scope: ['entity.name.type', 'support.type'], settings: { foreground: '#06B6D4' } },
    { scope: ['meta.object-literal.key'], settings: { foreground: '#94A3B8' } },
    { scope: ['punctuation'], settings: { foreground: '#64748B' } },
  ],
};

export default function CodeBlock({
  code,
  showLineNumbers = false,
  filename,
  showChrome = false,
}: CodeBlockProps) {
  const languages = Object.keys(code);
  const [activeTab, setActiveTab] = useState(languages[0]);
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<Record<string, string>>({});

  // Render syntax-highlighted HTML for all tabs
  useEffect(() => {
    const render = async () => {
      const results: Record<string, string> = {};
      for (const lang of languages) {
        try {
          results[lang] = await codeToHtml(code[lang], {
            lang: LANG_MAP[lang] ?? 'plaintext',
            theme: THEME,
          });
        } catch {
          // Fallback: plain pre
          results[lang] = `<pre style="background:#0F172A;color:#F1F5F9;margin:0">${code[lang]
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>`;
        }
      }
      setHtml(results);
    };
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(code[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasMultipleTabs = languages.length > 1;

  return (
    <div
      className="rounded-xl overflow-hidden text-sm font-mono"
      style={{ border: '1px solid rgba(6, 182, 212, 0.2)', background: '#0F172A' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {showChrome && (
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
          )}
          {filename && !showChrome && (
            <span className="text-slate-400 text-xs">{filename}</span>
          )}
          {hasMultipleTabs && (
            <div className="flex gap-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                    activeTab === lang
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          whileTap={{ scale: 0.9 }}
          title="Copy code"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.svg
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="clipboard"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code content */}
      <div className="relative overflow-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`p-4 ${showLineNumbers ? 'show-line-numbers' : ''}`}
          >
            {html[activeTab] ? (
              <div
                dangerouslySetInnerHTML={{ __html: html[activeTab] }}
                className="[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!text-sm"
              />
            ) : (
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                {code[activeTab]}
              </pre>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
