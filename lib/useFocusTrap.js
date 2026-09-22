'use client';

import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal behaviour for the mobile menu: focus moves into the dialog, Tab cannot
 * leave it, Escape closes it, and focus returns to the control that opened it.
 * Covers WCAG 2.1.2 (focus escaping a modal), 2.4.3 (Focus Order) and 2.1.1.
 */
export function useFocusTrap(ref, active, onClose) {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const opener = document.activeElement;
    const list = () =>
      Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Focus the first control rather than the container: screen readers then
    // announce the dialog name and the control together.
    (list()[0] ?? node).focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = list();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus?.();
    };
  }, [ref, active, onClose]);
}
