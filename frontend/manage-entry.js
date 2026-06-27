/**
 * Provider portal (/manage) — dirty-state UX with optional Craft save.
 */
const STORAGE_KEY = 'dbtsearch_portal_draft';

function initPortalForm() {
  const form = document.getElementById('portal-form');
  if (!form) {
    return;
  }

  const craftSave = form.dataset.craftSave === '1';
  const initialJson = document.getElementById('portal-initial-data');
  const flashNotice = document.getElementById('portal-flash-notice');
  const unsavedBadge = document.getElementById('portal-unsaved-badge');
  const statusLine = document.getElementById('portal-status-line');
  const saveAlert = document.getElementById('portal-save-alert');
  const dismissSave = document.getElementById('portal-dismiss-save');
  const saveBtn = document.getElementById('portal-save-btn');

  let sessionOpenedAt = Date.now();

  function serializeForm() {
    const out = {
      name: form.querySelector('#portal-name')?.value ?? '',
      dbtaCertified: form.querySelector('#portal-dbta')?.checked ?? false,
      phone: form.querySelector('#portal-phone')?.value ?? '',
      email: form.querySelector('#portal-email')?.value ?? '',
      website: form.querySelector('#portal-website')?.value ?? '',
      locations: {},
    };
    form.querySelectorAll('[data-portal-location]').forEach((card) => {
      const id = card.getAttribute('data-portal-location');
      if (!id) return;
      const availability = card.querySelector(`#portal-availability-${id}`);
      out.locations[id] = {
        name: card.querySelector(`#portal-loc-name-${id}`)?.value ?? '',
        address: card.querySelector(`#portal-loc-address-${id}`)?.value ?? '',
        city: card.querySelector(`#portal-loc-city-${id}`)?.value ?? '',
        state: card.querySelector(`#portal-loc-state-${id}`)?.value ?? '',
        zip: card.querySelector(`#portal-loc-zip-${id}`)?.value ?? '',
        phone: card.querySelector(`#portal-loc-phone-${id}`)?.value ?? '',
        email: card.querySelector(`#portal-loc-email-${id}`)?.value ?? '',
        website: card.querySelector(`#portal-loc-website-${id}`)?.value ?? '',
        availability: availability?.checked ?? false,
      };
    });
    return JSON.stringify(out);
  }

  let savedSignature = serializeForm();

  function formatTime(ms) {
    return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  function formatSavedLabel(isoString) {
    const parsed = Date.parse(isoString);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return formatTime(parsed);
  }

  function updateStatus(savedAt) {
    if (!statusLine) return;
    if (savedAt) {
      statusLine.textContent = craftSave
        ? `Last saved · ${formatTime(savedAt)}`
        : `Last saved locally · ${formatTime(savedAt)}`;
    } else {
      const lastSavedIso = form.dataset.lastSaved;
      const serverSaved = lastSavedIso ? formatSavedLabel(lastSavedIso) : null;
      if (craftSave && serverSaved) {
        statusLine.textContent = `Last saved · ${serverSaved}`;
      } else {
        statusLine.textContent = craftSave
          ? 'No saves yet this session'
          : `No session save yet · preview opened ${formatTime(sessionOpenedAt)}`;
      }
    }
  }

  function showSaveAlert() {
    if (!saveAlert) return;
    saveAlert.classList.remove('hidden');
    saveAlert.removeAttribute('hidden');
    saveAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setDirty(dirty) {
    if (unsavedBadge) {
      unsavedBadge.classList.toggle('hidden', !dirty);
    }
    if (saveBtn) {
      saveBtn.disabled = !dirty;
    }
  }

  function checkDirty() {
    setDirty(serializeForm() !== savedSignature);
  }

  function isPortalField(target) {
    return target instanceof Element && target.matches('.portal-field');
  }

  form.addEventListener('input', (event) => {
    if (isPortalField(event.target)) {
      checkDirty();
    }
  });

  form.addEventListener('change', (event) => {
    if (isPortalField(event.target)) {
      checkDirty();
    }
  });

  document.querySelectorAll('.portal-details-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const panel = targetId ? document.getElementById(targetId) : null;
      if (!panel) return;
      const nowHidden = panel.classList.toggle('hidden');
      if (nowHidden) {
        panel.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Edit details';
      } else {
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Hide details';
      }
    });
  });

  const practiceToggle = document.getElementById('portal-practice-details-toggle');
  const practicePanel = document.getElementById('portal-practice-details');
  if (practiceToggle && practicePanel) {
    practiceToggle.addEventListener('click', () => {
      const nowHidden = practicePanel.classList.toggle('hidden');
      if (nowHidden) {
        practicePanel.setAttribute('hidden', '');
        practiceToggle.setAttribute('aria-expanded', 'false');
        practiceToggle.textContent = 'Edit details';
      } else {
        practicePanel.removeAttribute('hidden');
        practiceToggle.setAttribute('aria-expanded', 'true');
        practiceToggle.textContent = 'Hide details';
      }
    });
  }

  if (dismissSave) {
    dismissSave.addEventListener('click', () => {
      saveAlert?.classList.add('hidden');
      saveAlert?.setAttribute('hidden', '');
    });
  }

  form.addEventListener('submit', (e) => {
    if (craftSave) {
      return;
    }

    e.preventDefault();
    const payload = serializeForm();
    try {
      sessionStorage.setItem(STORAGE_KEY, payload);
    } catch {
      /* ignore */
    }
    savedSignature = payload;
    setDirty(false);
    updateStatus(Date.now());
    showSaveAlert();
  });

  window.addEventListener('beforeunload', (e) => {
    if (serializeForm() !== savedSignature) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  if (initialJson) {
    try {
      JSON.parse(initialJson.textContent || '{}');
    } catch {
      /* ignore malformed seed JSON */
    }
  }

  if (flashNotice) {
    savedSignature = serializeForm();
    setDirty(false);
    updateStatus(Date.now());
    showSaveAlert();
  } else {
    updateStatus(null);
    checkDirty();
  }
}

function initPortalUserMenu() {
  const root = document.getElementById('portal-user-menu');
  const trigger = document.getElementById('portal-user-menu-trigger');
  const panel = document.getElementById('portal-user-menu-panel');
  if (!root || !trigger || !panel) return;

  function setOpen(open) {
    panel.classList.toggle('hidden', !open);
    if (open) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(trigger.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      trigger.focus();
    }
  });
}

function initPortalPage() {
  initPortalForm();
  initPortalUserMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortalPage);
} else {
  initPortalPage();
}
