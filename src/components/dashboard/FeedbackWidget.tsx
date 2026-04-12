'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

interface FeedbackWidgetProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function FeedbackWidget({ open, onClose, onOpen }: FeedbackWidgetProps) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [isMac, setIsMac] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  // Detect OS for keyboard shortcut labels
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  // Auto-focus textarea when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset state when popover closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setMessage('');
        setStatus('idle');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || status === 'submitting') return;
    setStatus('submitting');
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { error } = await supabase.from('feedback').insert({
        user_id: session.user.id,
        page: pathname,
        message: message.trim(),
      });
      if (error) throw error;
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }, [message, status, pathname, onClose]);

  // Keep submit ref current to avoid stale closures in keyboard listeners
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // 'F' key to toggle (not when typing in input/textarea/contenteditable)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'f' && e.key !== 'F') return;
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) return;
      e.preventDefault();
      if (open) {
        onClose();
      } else {
        onOpen();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onOpen]);

  // Escape to close + Cmd/Ctrl+Enter to submit (only when open)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        submitRef.current();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => (open ? onClose() : onOpen())}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg text-xs font-headline ${open ? 'bg-surface-container-high text-on-surface-variant' : ''}`}
      >
        <span className="hidden sm:inline">Feedback</span>
        <kbd className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono bg-surface-container-high text-on-surface-variant/40 rounded border border-outline-variant/20 ml-0.5">
          F
        </kbd>
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* Invisible backdrop for click-outside-to-close */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <div className="absolute top-full right-0 mt-[7px] z-50 w-80 bg-surface-container border border-outline-variant/20 rounded-xl shadow-2xl p-4">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Have an idea to improve this page? Share it with our team."
              rows={4}
              className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 resize-none outline-none focus:border-primary/40 transition-colors font-body"
            />

            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-on-surface-variant/40 font-body">
                Need help?{' '}
                <a href="/dashboard/docs" className="text-primary hover:underline">
                  See docs
                </a>
              </p>

              <div className="flex items-center gap-2">
                {status === 'success' ? (
                  <span className="text-xs text-green-400 font-body flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Thanks!
                  </span>
                ) : status === 'error' ? (
                  <span className="text-[11px] text-error font-body">
                    Failed. Try again.
                  </span>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || status === 'submitting'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-white text-xs font-semibold rounded-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-headline"
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send'}
                    <span className="inline-flex items-center gap-0.5">
                      <kbd className="inline-flex items-center justify-center h-4 px-1 text-[9px] font-mono bg-white/10 text-white/60 rounded border border-white/15">
                        {isMac ? '⌘' : 'Ctrl'}
                      </kbd>
                      <kbd className="inline-flex items-center justify-center h-4 px-1 text-[9px] font-mono bg-white/10 text-white/60 rounded border border-white/15">
                        ↵
                      </kbd>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
