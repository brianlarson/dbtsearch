# Cookie consent & GDPR feasibility

**Status:** Soft bar shipped; full GDPR/CMP deferred  
**Captured:** July 16, 2026  
**Recommended approach:** Keep the soft essential-cookies bar; revisit a real CMP only if analytics / EU traffic warrant it

---

## What we have now

Ported from the archived Vue SPA (`CookieConsentBar.vue` + `cookieConsent.ts`):

- Fixed bottom **soft notice** (essential-cookies copy)
- **Accept** and **dismiss (×)** both write `localStorage` key `dbtsearch_cookie_consent` = `v1`
- Link to **About** (no Privacy Policy page exists yet)
- Not a consent management platform (CMP): no categories, no deny, no audit trail, does **not** gate scripts

Directory availability preference cookie (`directory_availability`) is unrelated and unchanged.

---

## What real GDPR-style consent would need

| Need | Notes |
|------|--------|
| Consent **before** non-essential cookies/scripts | e.g. load GA only after opt-in |
| Categories | Essential vs analytics (vs marketing if added) |
| Deny / withdraw | Equal prominence; easy revoke |
| Audit trail | Timestamp, version of policy/copy, optional user id |
| Privacy Policy | Dedicated page + link from banner and footer |
| Regional rules | EU/UK visitors; US state laws may add notice requirements |

This soft bar does **not** satisfy the above. It is UX continuity with the SPA, not legal compliance.

---

## Feasibility on current stack

| Piece | Today | GDPR lift |
|-------|--------|-----------|
| Craft Twig + Vite assets | Soft bar in site + splash layouts | Easy to extend markup/JS |
| Google Analytics (`_partials/google-analytics.twig`) | Loads on **production** for non-logged-in users, no consent gate | Main change: conditional gtag after accept; default deny |
| Resend / Craft mailer | Transactional email only | Unrelated to cookie consent |
| Formie (splash signup) | Form submissions | Consent for processing is separate from cookies; form copy/privacy link may still be needed |
| CMP vendor (Cookiebot, OneTrust, etc.) | None | Possible later; adds cost and script weight |

**Feasible** to build a lightweight DIY gate (defer GA until `dbtsearch_cookie_consent` / a richer key) without a vendor. A full CMP is overkill until traffic and non-essential tracking justify it.

---

## Recommendation

1. **Ship the soft bar now** (done) — matches SPA behavior and key for returning visitors.
2. **Defer CMP** until analytics usage or EU/UK audience makes blocking GA (and documenting categories) worthwhile.
3. **When revisiting:** add a Privacy Policy page; gate gtag on opt-in; consider deny + withdraw; keep essential cookies (session, CSRF, availability pref) outside that gate.

---

## Key files

- `templates/_partials/cookie-consent.twig`
- `frontend/src/cookieConsent.js`
- `frontend/src/cookie-consent.css`
- `templates/_layouts/site.twig` / `templates/splash/index.twig`
- `templates/_partials/google-analytics.twig` (future gate target)
