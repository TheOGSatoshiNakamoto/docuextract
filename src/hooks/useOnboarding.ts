/**
 * Single source of truth for onboarding state.
 *
 * Previously scattered across 4 files (Sidebar, dashboard/page, QuickStartFlow,
 * QuickStartCard) using 3 localStorage keys and a custom event. Now centralized
 * here — one place to read, write, and check completion.
 *
 * Usage:
 *   const { isComplete, steps, completeStep, skip } = useOnboarding();
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  dismissed: 'gs-dismissed',
  keyCopied: 'gs-key-copied',
  viewedExtractions: 'gs-viewed-extractions',
} as const;

const EVENT_NAME = 'docuextract:onboarding-update';

export interface OnboardingState {
  /** Whether onboarding is fully complete (all steps done or skipped) */
  isComplete: boolean;
  /** null = still loading from localStorage */
  isLoading: boolean;
  /** Individual step completion */
  steps: {
    keyCopied: boolean;
    firstExtraction: boolean;
    viewedExtractions: boolean;
  };
  /** Mark a specific step as done */
  completeStep: (step: 'keyCopied' | 'viewedExtractions') => void;
  /** Skip the entire onboarding flow */
  skip: () => void;
  /** Mark complete (called when all steps naturally finish) */
  markComplete: () => void;
}

function readState() {
  try {
    return {
      dismissed: localStorage.getItem(STORAGE_KEYS.dismissed) === 'true',
      keyCopied: localStorage.getItem(STORAGE_KEYS.keyCopied) === 'true',
      viewedExtractions: localStorage.getItem(STORAGE_KEYS.viewedExtractions) === 'true',
    };
  } catch {
    return { dismissed: false, keyCopied: false, viewedExtractions: false };
  }
}

function broadcastUpdate() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useOnboarding(hasExtractions = false): OnboardingState {
  const [dismissed, setDismissed] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [viewedExtractions, setViewedExtractions] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Read initial state from localStorage
  useEffect(() => {
    const state = readState();
    setDismissed(state.dismissed);
    setKeyCopied(state.keyCopied);
    setViewedExtractions(state.viewedExtractions);
    setLoaded(true);
  }, []);

  // Listen for updates from other components in the same tab
  useEffect(() => {
    function onUpdate() {
      const state = readState();
      setDismissed(state.dismissed);
      setKeyCopied(state.keyCopied);
      setViewedExtractions(state.viewedExtractions);
    }
    window.addEventListener(EVENT_NAME, onUpdate);
    return () => window.removeEventListener(EVENT_NAME, onUpdate);
  }, []);

  const isComplete = dismissed || (keyCopied && hasExtractions && viewedExtractions);

  const completeStep = useCallback((step: 'keyCopied' | 'viewedExtractions') => {
    try {
      if (step === 'keyCopied') {
        localStorage.setItem(STORAGE_KEYS.keyCopied, 'true');
        setKeyCopied(true);
      } else if (step === 'viewedExtractions') {
        localStorage.setItem(STORAGE_KEYS.viewedExtractions, 'true');
        setViewedExtractions(true);
      }
    } catch { /* SSR */ }
    broadcastUpdate();
  }, []);

  const skip = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEYS.dismissed, 'true'); } catch { /* SSR */ }
    setDismissed(true);
    broadcastUpdate();
  }, []);

  const markComplete = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEYS.dismissed, 'true'); } catch { /* SSR */ }
    setDismissed(true);
    broadcastUpdate();
  }, []);

  return {
    isComplete,
    isLoading: !loaded,
    steps: { keyCopied, firstExtraction: hasExtractions, viewedExtractions },
    completeStep,
    skip,
    markComplete,
  };
}

/**
 * Lightweight version for components that only need to know if onboarding
 * is complete (e.g., Sidebar). Doesn't need hasExtractions.
 */
export function useOnboardingStatus(): { isComplete: boolean } {
  const [isComplete, setIsComplete] = useState(true); // default true to avoid flash

  useEffect(() => {
    function check() {
      try {
        setIsComplete(localStorage.getItem(STORAGE_KEYS.dismissed) === 'true');
      } catch {
        setIsComplete(false);
      }
    }
    check();
    window.addEventListener(EVENT_NAME, check);
    return () => window.removeEventListener(EVENT_NAME, check);
  }, []);

  return { isComplete };
}
