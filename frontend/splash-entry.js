import './splash-entry.css';
import { initCookieConsent } from './src/cookieConsent.js';

function initSplashEntry() {
  initCookieConsent();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplashEntry);
} else {
  initSplashEntry();
}
