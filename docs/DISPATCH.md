# Dispatch (email campaigns)

DBT Search uses **[Dispatch](https://github.com/justinholtweb/craft-dispatch)** (`justinholtweb/craft-dispatch`) for list mail.

Local DDEV sends go to **Mailpit** (`ddev mailpit`). `config/app.php` routes mail to SMTP `127.0.0.1:1025` when `IS_DDEV_PROJECT` is set, so Resend in project config is not used inside DDEV (this repo’s `.env` may still say `CRAFT_ENVIRONMENT=production`). Staging and production keep Craft’s Resend adapter.

Free edition limits (enforced in the plugin): **1 mailing list** and **100 emails/month**. This project stays on Free until a Lite upgrade.

## Vendor patch: list edit Twig (5.0.4)

`justinholtweb/craft-dispatch` 5.0.4 ships `src/templates/lists/edit.twig` with a single-quoted string that contains `you'll`. Twig treats the apostrophe as the end of the string and throws `Unexpected character "'"` (often reported on line 52, where `'active subscribers'` is parsed). Latest Packagist release is still 5.0.4, so this repo applies `patches/craft-dispatch-lists-edit-apostrophe.patch` via `cweagans/composer-patches` (double-quote the instructions string). Re-check upstream before bumping Dispatch; drop the patch once a release includes the fix.

## Local test send (testers only)

Do **not** import `data/dispatch/launch-signups-import.csv` until you are ready for the real launch send.

1. Confirm Dispatch is enabled: Craft CP → **Dispatch** (or `https://dbtsearch.ddev.site/admin/dispatch/campaigns`). Admin users can access it; grant `dispatch:accessPlugin` (and campaign/list/subscriber permissions) if the nav item is missing for a non-admin.
2. Settings in `config/dispatch.php` (overrides CP): from **DBT Search** `<system@dbtsearch.org>`, reply-to `admin@dbtsearch.com`, batch size `25`, Craft transport.
3. Keep a queue worker running while sending:
   ```bash
   ddev craft queue/listen
   ```
   One-shot drain: `ddev craft queue/run`.
4. Mailing list (Free = this one list only):
   - Name: Launch announcements
   - Handle: `launchAnnouncements`
5. Subscribers on that list for tests: `brian@brianlarson.com`, `support@tinytreecounseling.com`, `kristin.bunge@tinytreecounseling.com`.
6. Campaign:
   - Title: Launch announcement (test)
   - Subject: `DBT Search is live — find Minnesota DBT availability`
   - List: Launch announcements
   - Template path: `_emails/dispatch/launch-announcement`
   - Body: optional extra HTML; the Twig template already has greeting, directory/register CTAs, footer, and `unsubscribeUrl`.
7. Send the campaign (CP **Send Campaign**, or `Plugin::getInstance()->campaigns->send($id)`).
8. Open Mailpit (`ddev mailpit`) and check logo, buttons, unsubscribe link, From, and Reply-To.

The branded layout is `templates/_emails/dispatch/launch-announcement.twig`. Logo PNG: `web/images/dbtsearch-logo.png` (dark background; email clients handle PNG better than SVG).

## Full launch (later)

1. Import `data/dispatch/launch-signups-import.csv` onto **the same** `launchAnnouncements` list (Free cannot add a second list). Columns: `email`, `firstName`, `lastName`; `notes` is organization and is ignored by the importer.
2. The source Formie export (`data/launch-signups.csv`) has 16 submissions and **14 unique emails** (Caila Kritzeck and Haley Raifsnider appear twice). The import CSV keeps the newest row per email. (A 15-unique count would include the header or a duplicate.)
3. Duplicate or reuse the launch campaign, attach `launchAnnouncements`, send.
4. Watch the 100/month Free cap (14 launch + 3 testers is well under; a second blast the same month still counts).

## Availability reminders (Lite)

Free cannot add a second list or Craft User sync.

Upgrade to **Lite** ($49) when you want:

- A second list (for example `providerReminders`) separate from launch announcements
- Sync of the **Provider** user group
- A campaign using the same branded layout with a `/manage` CTA

Targeting stale listings can use `availabilityUpdatedAt` on Locations (`config/project/fields/availabilityUpdatedAt--c3a8f1e2-9b4d-4e6a-8f2c-1d5e7a9b0c3d.yaml`) via a future console command or Pro segments. That automation is not built yet.

## Programmatic API (if CP is unavailable)

```php
use justinholtweb\dispatch\Plugin;
use justinholtweb\dispatch\elements\MailingList;
use justinholtweb\dispatch\elements\Subscriber;
use justinholtweb\dispatch\elements\Campaign;

$dispatch = Plugin::getInstance();

$list = new MailingList();
$list->name = 'Launch announcements';
$list->handle = 'launchAnnouncements';
$list->title = $list->name;
$dispatch->lists->create($list);

$subscriber = new Subscriber();
$subscriber->email = 'brian@brianlarson.com';
$subscriber->firstName = 'Brian';
$subscriber->lastName = 'Larson';
$subscriber->status = 'active';
$dispatch->subscribers->create($subscriber);
$dispatch->subscribers->subscribe($subscriber->id, $list->id);

$campaign = new Campaign();
$campaign->title = 'Launch announcement (test)';
$campaign->subject = 'DBT Search is live — find Minnesota DBT availability';
$campaign->templatePath = '_emails/dispatch/launch-announcement';
$campaign->mailingListId = $list->id;
$campaign->body = '';
$dispatch->campaigns->create($campaign);
$dispatch->campaigns->send($campaign->id);
```

CSV import (queue): `$dispatch->subscribers->importCsv($path, $listId)` with headers `email` plus optional `firstName`/`first_name` and `lastName`/`last_name`.
