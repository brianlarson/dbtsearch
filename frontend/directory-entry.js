import './directory-entry.css';

const availabilityInput = document.getElementById('availability-input');
const filtersForm = document.getElementById('directory-filters');

if (availabilityInput && filtersForm) {
  availabilityInput.addEventListener('change', () => {
    filtersForm.requestSubmit();
  });
}
