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
let activeCleanup: (() => void) | null = null;

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

function closeConfirm(): void {
  const { modal } = getElements();
  if (!modal) return;
  modal.classList.remove('flex');
  modal.classList.add('hidden');
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
  if (activeCleanup) {
    activeCleanup();
  }

  return new Promise(resolve => {
    activeResolve = resolve;

    if (msgEl)   msgEl.textContent   = message;
    if (titleEl) titleEl.textContent = options.title   ?? 'Confirm Action';
    if (okBtn)   okBtn.textContent   = options.okLabel ?? 'Confirm';

    const cleanUpListeners = () => {
      okBtn?.removeEventListener('click', onOk);
      cancelBtn?.removeEventListener('click', onCancel);
      backdrop?.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeyDown, { capture: true });
    };

    activeCleanup = () => {
      cleanUpListeners();
      resolve(false);
      activeResolve = null;
      activeCleanup = null;
    };

    const onOk = () => {
      cleanUpListeners();
      closeConfirm();
      resolve(true);
      activeResolve = null;
      activeCleanup = null;
    };

    const onCancel = () => {
      cleanUpListeners();
      closeConfirm();
      resolve(false);
      activeResolve = null;
      activeCleanup = null;
    };

    const onBackdrop = () => {
      cleanUpListeners();
      closeConfirm();
      resolve(false);
      activeResolve = null;
      activeCleanup = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        e.stopPropagation();
        cleanUpListeners();
        closeConfirm();
        resolve(false);
        activeResolve = null;
        activeCleanup = null;
      }
    };

    okBtn?.addEventListener('click', onOk);
    cancelBtn?.addEventListener('click', onCancel);
    backdrop?.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeyDown, { capture: true });

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Focus the Cancel button by default — safer UX (explicit opt-in to destructive action)
    cancelBtn?.focus();
  });
}
