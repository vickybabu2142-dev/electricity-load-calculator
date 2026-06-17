// ─────────────────────────────────────────────────────────
// APP STATE — single mutable object + persistence helpers
// Fixes: Task 4 (subsidy double-parse) — subsidyUnits is now
// part of the state object and read from localStorage once.
// ─────────────────────────────────────────────────────────

import type { Appliance } from '@/types';
import { DEFAULT_APPLIANCES } from '@/data/appliances';
import { STORAGE_KEY, REGION_SETTINGS } from './constants';

// ── Mutable App State ─────────────────────────────────────
export const appState = {
  appliances: structuredClone(DEFAULT_APPLIANCES).filter((a: Appliance) => !a.hidden) as Appliance[],
  tariff: 0,
  currentCurrency: 'INR',
  currentCurrencySymbol: '₹',
  maxCapacityKW: 5,
  customIdCounter: 1000,
  activePresetId: null as string | null,
  /** FIX (Task 4): subsidyUnits is now part of state — no more double localStorage.getItem() */
  subsidyUnits: 0,
};

// ── Helpers ───────────────────────────────────────────────
export function getAppliance(id: string): Appliance | undefined {
  return appState.appliances.find(a => a.id === id);
}

export function saveState(): void {
  const {
    appliances, tariff, currentCurrency, currentCurrencySymbol,
    maxCapacityKW, customIdCounter, subsidyUnits
  } = appState;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      appliances, tariff, currentCurrency, currentCurrencySymbol,
      maxCapacityKW, customIdCounter, subsidyUnits
    }));
  } catch {
    // QuotaExceededError or SecurityError in private browsing — ignore silently
  }
}

export function loadState(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;
  try {
    const state = JSON.parse(saved);
    if (!Array.isArray(state.appliances) || state.appliances.length === 0) return false;

    appState.appliances = state.appliances;
    if (typeof state.tariff === 'number' && state.tariff > 0) appState.tariff = state.tariff;
    if (typeof state.currentCurrency === 'string' && REGION_SETTINGS[state.currentCurrency]) {
      appState.currentCurrency = state.currentCurrency;
    }
    if (typeof state.currentCurrencySymbol === 'string') appState.currentCurrencySymbol = state.currentCurrencySymbol;
    if (typeof state.maxCapacityKW === 'number' && state.maxCapacityKW > 0) appState.maxCapacityKW = state.maxCapacityKW;
    if (typeof state.customIdCounter === 'number') appState.customIdCounter = state.customIdCounter;
    // FIX (Task 4): read subsidyUnits directly from parsed state — no JSON.parse() call needed anywhere else
    if (typeof state.subsidyUnits === 'number') appState.subsidyUnits = state.subsidyUnits;
    return true;
  } catch {
    appState.appliances = structuredClone(DEFAULT_APPLIANCES).filter((a: Appliance) => !a.hidden);
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}
