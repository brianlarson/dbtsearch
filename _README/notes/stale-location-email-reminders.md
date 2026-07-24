# Stale-location email reminders

**Status:** Planned — revisit later  
**Captured:** July 14, 2026  
**Recommended approach:** Extend existing `portal` module (no new plugin)

---

## Feature

Provider users can **opt in** to email reminders if **any** of their locations haven’t been updated in **X days**.

---

## Ownership & freshness

```
User (group: provider)
  └─ field `provider` → Providers entry
        └─ field `locations` → Location entries
              └─ `availabilityUpdatedAt` (freshness signal)
```

- Staleness uses **`availabilityUpdatedAt`**, not Craft `dateUpdated`.
- Empty or older than X days = stale.
- Remind if **any** location on the user’s linked provider is stale.
- Today, confirming availability without flipping the toggle does **not** refresh `availabilityUpdatedAt`. A later “Confirm still accurate” action that stamps the field without changing the value may be desirable.

---

## Recommended design

| Piece | Approach |
|-------|----------|
| Opt-in | User Lightswitch e.g. `staleLocationReminders` (default **off**) |
| Cooldown | Optional Date field `staleReminderLastSentAt` |
| Threshold X | Env/config constant (e.g. `STALE_LOCATION_DAYS=30`) |
| Schedule | Cloudways daily cron → `php craft portal/reminders/stale-locations` → queue jobs |
| Mail | Craft mailer (already Resend in `project.yaml`) |
| Recipient | Craft **user** email (login), not public `provider.email` |
| Manage UX | Notifications section on `/manage` with checkbox |

### Why not plugins

- Formie / Feed Me don’t fit this job.
- A scheduler plugin is optional at most (CP cron management); not required if Cloudways cron calls the console command.

### Approaches ranked

1. **Portal module + queue** — recommended  
2. Console-only sync send — lite alternative  
3. Plugin-heavy — not recommended  

---

## Key files

- `modules/portal/services/ProviderPortalService.php`
- `modules/portal/Module.php` (needs console namespace for the command)
- `templates/manage/index.twig`
- `config/project/fields/availabilityUpdatedAt--….yaml`
- User field layout for the opt-in field(s)
- Resend already configured in `config/project/project.yaml`

---

## Implementation sequence

1. Add opt-in user field(s) (`staleLocationReminders`, optionally `staleReminderLastSentAt`)
2. Manage UI — Notifications checkbox on `/manage`
3. Console command + queue job + email template
4. Cloudways daily cron

---

## Revisit checklist

- [ ] Scaffold user field(s) + project config
- [ ] Wire `/manage` Notifications section
- [ ] Register portal console command + queue job
- [ ] Choose / document `STALE_LOCATION_DAYS`
- [ ] Add Cloudways cron
- [ ] (Later) “Confirm still accurate” stamp for `availabilityUpdatedAt`
