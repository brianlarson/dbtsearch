/**
 * Single-open FAQ accordion. Native buttons handle keyboard; CSS animates height.
 */
export function initFaqAccordion() {
  const root = document.querySelector('[data-faq-accordion]');
  if (!root) {
    return;
  }

  const items = [...root.querySelectorAll('[data-faq-item]')];

  function setOpen(item, open) {
    const trigger = item.querySelector('[data-faq-trigger]');
    const panel = item.querySelector('[data-faq-panel]');
    if (!trigger || !panel) {
      return;
    }

    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      panel.removeAttribute('inert');
    } else {
      panel.setAttribute('inert', '');
    }
  }

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      items.forEach((other) => setOpen(other, false));
      if (!isOpen) {
        setOpen(item, true);
      }
    });
  });
}
