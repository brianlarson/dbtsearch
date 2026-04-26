# Roadmap

Current MVP roadmap for DBTsearch directory + provider portal.

---

## Current Snapshot

- **Directory:** Availability-only filter + results count, sticky filter bar, sort by `updatedAt` desc, back-to-top control.
- **Provider cards:** Logos are lazy loaded (`loading="lazy"`, `decoding="async"`).
- **Provider portal UI:** Edit flow is focused and sticky; provider users can currently edit:
  - provider name, phone, email, website
  - location name (Craft `location` `entry.title`)
  - location availability
- **Portal save behavior:** Still session/local preview behavior; backend persistence is next.

---

## MVP Scope (Locked)

### Provider user editable whitelist

1. Provider name
2. Provider phone
3. Provider email
4. Provider website
5. Location name (internal Craft title reference)
6. Location availability (on/off)

### Provider user non-editable (for MVP)

- Location address fields (street, city, state, zip)
- Location contact fields (phone/email/website)
- Any admin-only source id / relation wiring fields

---

## Next Steps (Implementation Order)

1. **Add real portal save endpoint in Craft**
   - Session-authenticated endpoint for provider users.
   - Enforce scope via existing `provideraccess` rules.
   - Accept and validate only the MVP whitelist fields.

2. **Wire portal save to backend**
   - Replace session-only save with POST to Craft action endpoint.
   - Add pending/saving/saved/error states in the sticky actions area.
   - Keep unsaved-changes protection (`beforeunload` + route leave guard).

3. **Craft field mapping confirmation**
   - `locations[].name` maps to location `title`.
   - `locations[].availability` maps to location availability field.
   - Provider contact fields map to provider entry custom fields.

4. **Audit and tests**
   - Verify provider users cannot write out-of-scope entries.
   - Verify non-whitelisted payload keys are ignored/rejected.
   - Smoke test portal flow on mobile + desktop sticky behavior.

---

## Post-MVP Backlog

- **Provider logo & logo tile (portal + Craft)**
  - Let provider users change their listing logo: Craft Assets field on the provider entry, volume/permissions scoped to provider users (or CP-only uploads in a first phase); optional lighter “logo URL” field if upload API is deferred.
  - **Dark vs light logo background:** Lightswitch (or equivalent) on the provider entry so the directory can force the white or dark tile; when set, override the client-side luminance heuristic on cards.
  - Extend the self-edit allowlist and portal UI once real save is live; GraphQL must expose logo + preference for the public directory query.

- Optional provider-facing location display name field distinct from `title`.
- Address/contact editing workflow with moderation (if needed).
- Optional pagination/virtualization if provider count grows enough to impact UX/perf.
- Improve save success copy once backend sync is live.

---

## Notes

- Duplicate location titles are acceptable in Craft.
- We currently prefer no pagination for MVP unless perf requires it.
- Track delivery work in small PRs from `feat/next`.
