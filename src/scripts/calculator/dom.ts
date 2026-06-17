// ─────────────────────────────────────────────────────────
// DOM HELPERS — pure UI utilities with no business logic
// ─────────────────────────────────────────────────────────

import { appState } from './state';
import { REGION_SETTINGS } from './constants';

export function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function formatNumber(val: number, decimals = 0): string {
  return new Intl.NumberFormat(navigator.language || 'en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatCurrency(amount: number): string {
  const { locale } = REGION_SETTINGS[appState.currentCurrency];
  const decimals = appState.currentCurrency === 'INR' ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: appState.currentCurrency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

/** Smoothly animate a numeric counter element from its current value to `target`. */
export function animateCounter(id: string, target: number, decimals: number): void {
  const el = document.getElementById(id);
  if (!el) return;
  const startText = el.textContent?.replace(/[^0-9.]/g, '') || '0';
  const start = parseFloat(startText) || 0;
  const DURATION_MS = 350;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / DURATION_MS, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNumber(start + (target - start) * ease, decimals);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
