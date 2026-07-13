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
  const flashWelcome = document.getElementById('portal-flash-welcome');
  const unsavedBadge = document.getElementById('portal-unsaved-badge');
  const statusLine = document.getElementById('portal-status-line');
  const welcomeAlert = document.getElementById('portal-welcome-alert');
  const saveAlert = document.getElementById('portal-save-alert');
  const dismissWelcome = document.getElementById('portal-dismiss-welcome');
  const dismissSave = document.getElementById('portal-dismiss-save');
  const saveBtn = document.getElementById('portal-save-btn');
  const previewBtn = document.getElementById('portal-preview-btn');
  const nameInput = form.querySelector('#portal-name');

  let sessionOpenedAt = Date.now();

  function buildPreviewUrl(name) {
    const base = previewBtn?.dataset.directoryBase || '/directory';
    const params = new URLSearchParams();
    const trimmed = (name ?? '').trim();
    if (trimmed) {
      params.set('q', trimmed);
    }
    params.set('availability', '0');
    return `${base}?${params.toString()}`;
  }

  function updatePreviewUrl() {
    if (!previewBtn) {
      return;
    }
    previewBtn.href = buildPreviewUrl(nameInput?.value ?? '');
  }

  function serializeForm() {
    const out = {
      name: form.querySelector('#portal-name')?.value ?? '',
      phone: form.querySelector('#portal-phone')?.value ?? '',
      email: form.querySelector('#portal-email')?.value ?? '',
      website: form.querySelector('#portal-website')?.value ?? '',
      locations: {},
    };
    form.querySelectorAll('[data-portal-location]').forEach((card) => {
      const id = card.getAttribute('data-portal-location');
      if (!id) return;
      const availability = card.querySelector(`#portal-availability-${id}`);
      const dbtaCertified = card.querySelector(`#portal-dbta-${id}`);
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
        dbtaCertified: dbtaCertified?.checked ?? false,
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

  function showWelcomeAlert() {
    if (!welcomeAlert) return;
    welcomeAlert.classList.remove('hidden');
    welcomeAlert.removeAttribute('hidden');
    welcomeAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showSaveAlert() {
    if (!saveAlert) return;
    saveAlert.classList.remove('hidden');
    saveAlert.removeAttribute('hidden');
    saveAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const BADGE_SAVED_CLASSES = ['border-primary/40', 'bg-primary/10', 'text-sky-300'];
  const BADGE_UNSAVED_CLASSES = ['border-amber-500/40', 'bg-amber-950/50', 'text-amber-200'];

  function setDirty(dirty) {
    if (unsavedBadge) {
      const remove = dirty ? BADGE_SAVED_CLASSES : BADGE_UNSAVED_CLASSES;
      const add = dirty ? BADGE_UNSAVED_CLASSES : BADGE_SAVED_CLASSES;
      remove.forEach((cls) => unsavedBadge.classList.remove(cls));
      add.forEach((cls) => unsavedBadge.classList.add(cls));
      unsavedBadge.textContent = dirty ? 'Unsaved Changes' : 'All Changes Saved';
    }
    if (saveBtn) {
      saveBtn.disabled = !dirty;
    }
    if (previewBtn) {
      previewBtn.setAttribute('aria-disabled', dirty ? 'true' : 'false');
      previewBtn.classList.toggle('pointer-events-none', dirty);
      previewBtn.classList.toggle('opacity-70', dirty);
      previewBtn.classList.toggle('cursor-not-allowed', dirty);
      previewBtn.title = dirty ? 'Save your changes before previewing the directory' : '';
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
      if (event.target === nameInput) {
        updatePreviewUrl();
      }
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

  if (dismissWelcome) {
    dismissWelcome.addEventListener('click', () => {
      welcomeAlert?.classList.add('hidden');
      welcomeAlert?.setAttribute('hidden', '');
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
      savedSignature = serializeForm();
      setDirty(false);
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

  previewBtn?.addEventListener('click', (event) => {
    if (previewBtn.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
    }
  });

  updatePreviewUrl();

  if (flashWelcome) {
    savedSignature = serializeForm();
    setDirty(false);
    updateStatus(null);
    showWelcomeAlert();
  } else if (flashNotice) {
    savedSignature = serializeForm();
    setDirty(false);
    updateStatus(Date.now());
    showSaveAlert();
  } else {
    updateStatus(null);
    checkDirty();
  }
}

function initPortalPage() {
  initPortalForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortalPage);
} else {
  initPortalPage();
}
