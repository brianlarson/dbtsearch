# Legacy page markup (TT-14)

Rendered HTML of each legacy route for Bootstrap → Tailwind + Vue reference.

**Capture:** On `main`, set `VITE_CAPTURE_MARKUP=true`, run `npm run client`, then in another terminal run `npm run capture-markup`. If the client runs on a different port (e.g. 5175), run `npm run capture-markup -- http://localhost:5175`. The script waits for the SPA to render before saving each page.

**View in browser:** With the client running (`npm run client`), open the captured pages at the same origin so `/public` assets load correctly, e.g. `http://localhost:5173/docs/reference-markup/home.html`, `http://localhost:5173/docs/reference-markup/providers.html`, `about.html`, `faqs.html`, `contact.html`, `register.html`, `login.html`, `admin.html`, `404.html`. Use 5175 (or your dev port) if the client runs there.
