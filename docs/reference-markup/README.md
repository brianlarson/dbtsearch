# Reference markup (legacy React app)

Captured HTML for Bootstrap/Finder parity. Asset paths use `../../public/` so CSS and images load when you open a file from disk or serve the repo root.

| File | Route |
|------|--------|
| home.html | `/` |
| providers.html | `/providers` |
| about.html | `/about` |
| faqs.html | `/faqs` |
| contact.html | `/contact` |
| register.html | `/register` |
| login.html | `/login` |
| logout.html | `/logout` |
| 404.html | `/this-route-should-not-exist-404` |
| admin.html | `/admin` (requires capture with API + credentials) |
| admin-edit.html | admin → Edit provider (requires API + credentials) |

Generate or refresh:

```bash
npm run capture:markup
```

See `docs/CAPTURE-MARKUP.md`.
