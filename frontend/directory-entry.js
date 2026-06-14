import './directory-entry.css';

const AVAILABILITY_COOKIE = 'directory_availability';
const AVAILABILITY_COOKIE_MAX_AGE = 60 * 60;

const availabilityInput = document.getElementById('availability-input');
const availabilityParam = document.getElementById('availability-param');
const filtersForm = document.getElementById('directory-filters');

function setAvailabilityCookie(value) {
  document.cookie = `${AVAILABILITY_COOKIE}=${value}; path=/; max-age=${AVAILABILITY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function refreshDirectorySprig() {
  const sprigEl = document.getElementById('directory-sprig');
  if (sprigEl && window.htmx) {
    window.htmx.trigger(sprigEl, 'refresh');
  } else if (filtersForm) {
    filtersForm.requestSubmit();
  }
}

if (availabilityInput && availabilityParam) {
  availabilityInput.addEventListener('change', () => {
    const value = availabilityInput.checked ? '1' : '0';
    availabilityParam.value = value;
    setAvailabilityCookie(value);
    refreshDirectorySprig();
  });
}
