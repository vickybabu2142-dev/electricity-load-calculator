// ─────────────────────────────────────────────────────────
// CONFIRM — Promise-based styled modal replacing window.confirm().
//
// Usage:
//   import { showConfirm } from '@/scripts/calculator/confirm';
//   const ok = await showConfirm('Reset all appliances to defaults?');
//   if (ok) { ... }
//
// Returns true  → user clicked the action button (OK/Reset)
// Returns false → user clicked Cancel, pressed Escape, or clicked backdrop
// ─────────────────────────────────────────────────────────

let activeResolve: ((value: boolean) => void) | null = null;

function getElements() {
  return {
    modal:     document.getElementById('confirm-modal'),
    message:   document.getElementById('confirm-message'),
    title:     document.getElementById('confirm-title'),
    okBtn:     document.getElementById('confirm-ok-btn'),
    cancelBtn: document.getElementById('confirm-cancel-btn'),
    backdrop:  document.getElementById('confirm-backdrop'),
  };
}

function closeConfirm(result: boolean): void {
  const { modal } = getElements();
  if (!modal) return;
  modal.classList.remove('flex');
  modal.classList.add('hidden');
  activeResolve?.(result);
  activeResolve = null;
}

export interface ConfirmOptions {
  title?: string;
  okLabel?: string;
}

export function showConfirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  const { modal, message: msgEl, title: titleEl, okBtn, cancelBtn, backdrop } = getElements();
  if (!modal) {
    // Graceful fallback if modal HTML not in page
    return Promise.resolve(window.confirm(message));
  }

  // Cancel any previous unresolved confirm
  if (activeResolve) activeResolve(false);

  return new Promise(resolve => {
    activeResolve = resolve;

    if (msgEl)   msgEl.textContent   = message;
    if (titleEl) titleEl.textContent = options.title   ?? 'Confirm Action';
    if (okBtn)   okBtn.textContent   = options.okLabel ?? 'Confirm';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Focus the Cancel button by default — safer UX (explicit opt-in to destructive action)
    cancelBtn?.focus();
  });
}

// ── One-time event wiring (runs on first import) ──────────
(function wireConfirmModal() {
  const { okBtn, cancelBtn, backdrop } = getElements();
  okBtn?.addEventListener('click',     () => closeConfirm(true));
  cancelBtn?.addEventListener('click', () => closeConfirm(false));
  backdrop?.addEventListener('click',  () => closeConfirm(false));

  document.addEventListener('keydown', (e) => {
    const { modal } = getElements();
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      e.stopPropagation();
      closeConfirm(false);
    }
  }, { capture: true });
})();
