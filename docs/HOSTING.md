# Hosting plan (restack)

Craft Cloud is not in the plan (no small-tier pricing). This doc outlines a lightweight Craft + Nuxt hosting approach.

---

## Recommendation: Cloudways

**Cloudways** is the primary recommendation: you already use it at work, it supports Craft CMS, and entry tiers are manageable for a small directory site.

- **What you get:** Managed PHP + MySQL on DigitalOcean, Vultr, Linode, AWS, or GCP. No Craft Cloud price floor; start with a small droplet (e.g. ~$14–20/mo depending on provider and size).
- **Craft:** One-click or manual Craft install; they have [Craft-specific guidance](https://www.cloudways.com/en/craft-cms-hosting.php). Use a single app server for Craft (PHP 8.2+, MySQL 8).
- **Nuxt:** Either on the same server (Node app behind the same reverse proxy) or split: Craft on Cloudways, Nuxt as static/SSR on Vercel/Netlify hitting Craft’s API.

---

## Keeping the Craft install lightweight

A “very lightweight” Craft install keeps cost and complexity down:

- **Minimal plugins** — Only what you need for the directory (e.g. no heavy headless/GraphQL unless you need it).
- **Single environment** — Production only, or production + one staging; avoid extra Craft Cloud–style environments until you need them.
- **Standard stack** — PHP 8.2+, MySQL 8, Composer for dependencies. No extra services for a simple directory.
- **Content model** — Simple entry types and fields for providers; avoid large asset volumes or complex relations until the product demands it.
- **Caching** — Use Craft’s template and query caching so a small server can handle the traffic.

That fits well on a single Cloudways server (Craft + optional Node for Nuxt on same box) or Craft on Cloudways + Nuxt elsewhere.

---

## Other options (if you want alternatives)

- **Small VPS (e.g. DigitalOcean / Vultr / Linode direct):** Cheaper than Cloudways but you manage PHP, MySQL, and updates. Good if you want full control and minimal cost.
- **Budget managed PHP hosts (e.g. Purely.website, ~£5/mo):** Very low cost; confirm Craft 5 + MySQL 8 and PHP 8.2+ support and backup/restore before committing.
- **Craft Cloud:** Revisit only if you later need their scaling, CDN, and Craft-specific tooling; no small-guy plan today.

---

## Summary

| Layer   | Recommendation        | Notes                                      |
|--------|------------------------|--------------------------------------------|
| **Craft** | Cloudways (DO/Vultr/Linode) | Managed PHP + MySQL; you’re already familiar. |
| **Nuxt**  | Same server or Vercel/Netlify | Same box as Craft, or static/SSR + Craft API.  |
| **DB**    | MySQL 8 on Cloudways  | Matches DDEV and Craft’s recommendation.   |

Keep Craft minimal (few plugins, simple schema, caching), and the restack stays cheap and easy to host.
