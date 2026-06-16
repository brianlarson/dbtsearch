import './directory-entry.css';

const BACK_TO_TOP_THRESHOLD = 500;

function initBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) {
    return;
  }

  let ticking = false;

  function updateVisibility() {
    const show = window.scrollY >= BACK_TO_TOP_THRESHOLD;
    button.classList.toggle('is-visible', show);
    button.setAttribute('aria-hidden', show ? 'false' : 'true');
    button.tabIndex = show ? 0 : -1;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    },
    { passive: true },
  );

  button.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  updateVisibility();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}

function initDirectoryFilterSticky() {
  const sentinel = document.getElementById('directory-filter-sentinel');
  const filter = document.querySelector('.directory-filter-sticky');
  if (!sentinel || !filter) {
    return;
  }

  const setStuck = (stuck) => {
    filter.classList.toggle('is-stuck', stuck);
    document.body.classList.toggle('directory-filter-stuck', stuck);
  };

  const observer = new IntersectionObserver(
    ([entry]) => setStuck(!entry.isIntersecting),
    { threshold: 0 },
  );

  observer.observe(sentinel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDirectoryFilterSticky);
} else {
  initDirectoryFilterSticky();
}

const AVAILABILITY_COOKIE = 'directory_availability';
const AVAILABILITY_COOKIE_MAX_AGE = 60 * 60;

function setAvailabilityCookie(value) {
  document.cookie = `${AVAILABILITY_COOKIE}=${value}; path=/; max-age=${AVAILABILITY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

document.addEventListener('change', (event) => {
  if (event.target.id !== 'availability-input') {
    return;
  }

  setAvailabilityCookie(event.target.checked ? '1' : '0');
});

const MD_MEDIA_QUERY = window.matchMedia('(min-width: 768px)');

function equalizeDirectoryCardHeights() {
  const list = document.getElementById('directory-results-list');
  if (!list) {
    return;
  }

  const articles = list.querySelectorAll('article');
  articles.forEach((article) => {
    article.style.minHeight = '';
  });

  if (!MD_MEDIA_QUERY.matches || articles.length < 2) {
    return;
  }

  let maxHeight = 0;
  articles.forEach((article) => {
    maxHeight = Math.max(maxHeight, article.getBoundingClientRect().height);
  });

  if (maxHeight <= 0) {
    return;
  }

  articles.forEach((article) => {
    article.style.minHeight = `${Math.ceil(maxHeight)}px`;
  });
}

function scheduleEqualizeDirectoryCardHeights() {
  requestAnimationFrame(() => {
    requestAnimationFrame(equalizeDirectoryCardHeights);
  });
}

function initDirectoryCardHeights() {
  scheduleEqualizeDirectoryCardHeights();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scheduleEqualizeDirectoryCardHeights, 100);
  });

  document.body.addEventListener('htmx:afterSwap', (event) => {
    const target = event.detail?.target;
    if (!target) {
      return;
    }

    if (
      target.id === 'directory-results' ||
      target.querySelector?.('#directory-results-list') ||
      target.closest?.('#directory-sprig')
    ) {
      scheduleEqualizeDirectoryCardHeights();
    }
  });

  if (typeof MD_MEDIA_QUERY.addEventListener === 'function') {
    MD_MEDIA_QUERY.addEventListener('change', scheduleEqualizeDirectoryCardHeights);
  } else {
    MD_MEDIA_QUERY.addListener(scheduleEqualizeDirectoryCardHeights);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDirectoryCardHeights);
} else {
  initDirectoryCardHeights();
}
