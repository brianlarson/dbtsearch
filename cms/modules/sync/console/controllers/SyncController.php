<?php

namespace modules\sync\console\controllers;

use Craft;
use craft\console\Controller;
use craft\elements\Entry;
use craft\fields\data\LinkData;
use craft\helpers\Console;
use GuzzleHttp\Client;
use modules\sync\support\EmailHarvester;
use yii\console\ExitCode;

class SyncController extends Controller
{
    /**
     * @var bool When true, destructive/normalize commands only print what would change. Use `--dry-run=0` to apply.
     */
    public bool $dryRun = true;

    /**
     * @inheritdoc
     */
    public function options($actionID): array
    {
        $options = parent::options($actionID);
        if (in_array($actionID, [
            'normalize-location-titles',
            'clear-invalid-provider-emails',
            'fix-duplicate-provider-owners',
        ], true)) {
            $options[] = 'dryRun';
        }

        return $options;
    }

    /**
     * For providers that share the same title (case-insensitive), pick one canonical provider and
     * re-point all locations from the others onto it. Does not delete surplus provider entries.
     *
     * Run `diagnose-providers-import` first. Default is dry-run; use `--dry-run=0` to apply, then
     * `provider-locations`. Delete empty duplicate provider rows in the CP afterward if desired.
     */
    public function actionFixDuplicateProviderOwners(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $byTitle = [];
        foreach ($providers as $p) {
            $key = mb_strtolower(trim((string) $p->title));
            if ($key === '') {
                $key = '__empty_title__';
            }
            $byTitle[$key][] = $p;
        }

        $moved = 0;
        $failed = 0;
        $groups = 0;

        foreach ($byTitle as $titleKey => $group) {
            if (count($group) < 2) {
                continue;
            }
            $groups++;

            usort($group, function (Entry $a, Entry $b): int {
                $sa = trim((string) $a->getFieldValue('sourceProviderId')) !== '';
                $sb = trim((string) $b->getFieldValue('sourceProviderId')) !== '';
                if ($sa !== $sb) {
                    return $sb <=> $sa;
                }
                $ca = $this->countLocationsForProvider($a);
                $cb = $this->countLocationsForProvider($b);
                if ($ca !== $cb) {
                    return $cb <=> $ca;
                }

                return $a->id <=> $b->id;
            });

            /** @var Entry $keeper */
            $keeper = $group[0];
            $losers = array_slice($group, 1);

            $this->stdout(
                "Canonical: id={$keeper->id} \"{$keeper->title}\" (sourceProviderId="
                . (trim((string) $keeper->getFieldValue('sourceProviderId')) !== '' ? 'set' : 'empty')
                . ", locations={$this->countLocationsForProvider($keeper)})\n",
                Console::FG_GREEN
            );

            foreach ($losers as $loser) {
                $loserId = $loser->id;
                $locations = Entry::find()
                    ->section('locations')
                    ->relatedTo([
                        'targetElement' => $loser,
                        'field' => 'provider',
                    ])
                    ->all();

                if ($locations === []) {
                    $this->stdout("  skip loser id={$loserId} (no locations)\n");
                    continue;
                }

                foreach ($locations as $loc) {
                    if ($this->dryRun) {
                        $this->stdout(
                            "  DRY RUN: location id={$loc->id} \"{$loc->title}\"  {$loserId} → {$keeper->id}\n"
                        );
                        $moved++;
                        continue;
                    }

                    $loc->setFieldValue('provider', [$keeper->id]);
                    if (!Craft::$app->getElements()->saveElement($loc)) {
                        $this->stderr(
                            'Could not save location ' . $loc->id . ': '
                            . json_encode($loc->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                            Console::FG_RED
                        );
                        $failed++;
                        continue;
                    }
                    $this->stdout("  moved location id={$loc->id}  {$loserId} → {$keeper->id}\n");
                    $moved++;
                }
            }
            $this->stdout("\n");
        }

        if ($groups === 0) {
            $this->stdout("No duplicate provider titles found.\n");
            return ExitCode::OK;
        }

        $this->stdout(sprintf(
            "Done: %d location link(s) %s, %d error(s).\n",
            $moved,
            $this->dryRun ? 'would change' : 'updated',
            $failed
        ));
        $this->stdout("Next: php craft sync/sync/provider-locations\n", Console::FG_CYAN);
        $this->stdout("Then delete surplus provider entries with zero locations in the CP if needed.\n", Console::FG_CYAN);

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    /**
     * Reports likely import issues: duplicate provider titles and locations missing a provider.
     *
     * Use after Feed Me runs when the CP shows duplicate org names or empty location cards.
     */
    public function actionDiagnoseProvidersImport(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $byTitle = [];
        foreach ($providers as $p) {
            $key = mb_strtolower(trim((string) $p->title));
            if ($key === '') {
                $key = '__empty_title__';
            }
            $byTitle[$key][] = $p;
        }

        $dupes = 0;
        foreach ($byTitle as $titleKey => $group) {
            if (count($group) < 2) {
                continue;
            }
            $dupes++;
            $this->stdout("Duplicate title (×" . count($group) . "): " . $group[0]->title . "\n", Console::FG_YELLOW);
            foreach ($group as $p) {
                $sid = trim((string) $p->getFieldValue('sourceProviderId'));
                $locCount = $this->countLocationsForProvider($p);
                $this->stdout(sprintf(
                    "  id=%d  sourceProviderId=%s  locations(via provider field)=%d\n",
                    $p->id,
                    $sid !== '' ? $sid : '(empty)',
                    $locCount
                ));
            }
            $this->stdout("\n");
        }

        if ($dupes === 0) {
            $this->stdout("No duplicate provider titles found (by case-insensitive title).\n");
        } else {
            $this->stdout(
                "Fix: php craft sync/sync/fix-duplicate-provider-owners (dry-run first), then --dry-run=0,\n" .
                "  php craft sync/sync/provider-locations\n" .
                "Then delete empty duplicate provider rows in the CP if any remain.\n",
                Console::FG_CYAN
            );
        }

        $missingProvider = 0;
        foreach (Entry::find()->section('locations')->all() as $loc) {
            $rel = $loc->getFieldValue('provider');
            if ($rel === null || $rel === [] || $rel === '') {
                $missingProvider++;
            }
        }

        if ($missingProvider > 0) {
            $this->stdout(
                "\nLocations with empty Provider Owner field: {$missingProvider}\n",
                Console::FG_YELLOW
            );
        }

        return ExitCode::OK;
    }

    /**
     * Converts Location titles from full-address format to street-only format.
     *
     * By default this command runs in dry-run mode; pass `--dry-run=0` to save changes.
     */
    public function actionNormalizeLocationTitles(): int
    {
        $locations = Entry::find()->section('locations')->all();

        if ($locations === []) {
            $this->stdout("No location entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $changed = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($locations as $location) {
            $currentTitle = trim((string) $location->title);
            $city = trim((string) $location->getFieldValue('city'));
            $state = trim((string) $location->getFieldValue('state'));
            $zip = trim((string) $location->getFieldValue('zip'));

            $streetTitle = $this->deriveStreetAddress($currentTitle, $city, $state, $zip);

            if ($streetTitle === '' || $streetTitle === $currentTitle) {
                $skipped++;
                continue;
            }

            if ($this->dryRun) {
                $this->stdout("DRY RUN: {$currentTitle}  =>  {$streetTitle}\n");
                $changed++;
                continue;
            }

            $location->title = $streetTitle;
            if (!Craft::$app->getElements()->saveElement($location)) {
                $this->stderr(
                    'Could not save location ' . $location->id . ' (' . $currentTitle . '): '
                    . json_encode($location->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                    Console::FG_RED
                );
                $failed++;
                continue;
            }

            $this->stdout("UPDATED: {$currentTitle}  =>  {$streetTitle}\n");
            $changed++;
        }

        $this->stdout(sprintf(
            "\nDone: %d changed, %d skipped, %d error(s). Mode: %s.\n",
            $changed,
            $skipped,
            $failed,
            $this->dryRun ? 'dry-run' : 'write'
        ));

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    /**
     * Clears provider email when it is not a valid RFC address (placeholders, scraper junk, etc.).
     *
     * Does not scrape websites. By default dry-run; pass `--dry-run=0` to save.
     */
    public function actionClearInvalidProviderEmails(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $cleared = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($providers as $provider) {
            $email = trim((string) $provider->getFieldValue('email'));
            if ($this->providerEmailIsAcceptable($email)) {
                $skipped++;
                continue;
            }

            if ($this->dryRun) {
                $this->stdout("DRY RUN: {$provider->title} — clear email (was: " . ($email !== '' ? $email : '(empty)') . ")\n");
                $cleared++;
                continue;
            }

            $provider->setFieldValue('email', null);
            if (!Craft::$app->getElements()->saveElement($provider)) {
                $this->stderr(
                    'Could not save provider ' . $provider->id . ' (' . $provider->title . '): '
                    . json_encode($provider->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                    Console::FG_RED
                );
                $failed++;
                continue;
            }
            $this->stdout("CLEARED: {$provider->title}\n");
            $cleared++;
        }

        $this->stdout(sprintf(
            "\nDone: %d cleared, %d skipped (valid), %d error(s). Mode: %s.\n",
            $cleared,
            $skipped,
            $failed,
            $this->dryRun ? 'dry-run' : 'write'
        ));

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    /**
     * Sets each provider’s Locations field from Location entries whose Provider field points at that provider.
     *
     * Safe to re-run after each bulk import (new states, Feed Me runs, etc.). Day-to-day edits in
     * the control panel can stay manual; run this again if you only fixed relations on locations.
     */
    public function actionProviderLocations(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $saved = 0;
        $failed = 0;

        foreach ($providers as $provider) {
            $email = trim((string) $provider->getFieldValue('email'));
            if (!$this->providerEmailIsAcceptable($email)) {
                $provider->setFieldValue('email', null);
            }

            $locationIds = Entry::find()
                ->section('locations')
                ->relatedTo([
                    'targetElement' => $provider,
                    'field' => 'provider',
                ])
                ->orderBy('title')
                ->ids();

            $provider->setFieldValue('locations', $locationIds);

            if (!Craft::$app->getElements()->saveElement($provider)) {
                $this->stderr(
                    'Could not save provider ' . $provider->id . ' (' . $provider->title . '): '
                    . json_encode($provider->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                    Console::FG_RED
                );
                $failed++;
                continue;
            }

            $saved++;
            $this->stdout(sprintf(
                "%s → %d location(s)\n",
                $provider->title,
                count($locationIds)
            ));
        }

        $this->stdout(sprintf(
            "\nFinished: %d provider(s) saved, %d error(s).\n",
            $saved,
            $failed
        ));

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    /**
     * Clears placeholder/invalid provider emails, then tries to discover a contact address from the Website URL
     * (homepage, contact-style links, common /contact paths).
     */
    public function actionRepairProviderEmails(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $client = new Client([
            'timeout' => 12,
            'connect_timeout' => 8,
            'allow_redirects' => ['max' => 5],
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
                'Accept-Language' => 'en-US,en;q=0.9',
            ],
            'verify' => true,
        ]);
        $harvester = new EmailHarvester($client);

        $saved = 0;
        $failed = 0;
        $skippedOk = 0;

        foreach ($providers as $provider) {
            $current = trim((string) $provider->getFieldValue('email'));

            if ($this->providerEmailIsAcceptable($current)) {
                $skippedOk++;
                continue;
            }

            $provider->setFieldValue('email', null);

            $website = $provider->getFieldValue('website');
            $url = ($website instanceof LinkData && $website->getUrl() !== '') ? $website->getUrl() : null;

            $found = null;
            if ($url !== null) {
                $this->stdout("{$provider->title} ← {$url}\n");
                $found = $harvester->findBestEmail($url);
                if ($found !== null) {
                    $provider->setFieldValue('email', $found);
                    $this->stdout("  → {$found}\n", Console::FG_GREEN);
                } else {
                    $this->stdout("  → (no email found)\n", Console::FG_YELLOW);
                }
            } else {
                $this->stdout("{$provider->title} — no website URL; email cleared.\n", Console::FG_YELLOW);
            }

            if (!Craft::$app->getElements()->saveElement($provider)) {
                $this->stderr(
                    'Could not save provider ' . $provider->id . ' (' . $provider->title . '): '
                    . json_encode($provider->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                    Console::FG_RED
                );
                $failed++;
                continue;
            }
            $saved++;
        }

        $this->stdout(sprintf(
            "\nDone: %d saved, %d skipped (already valid email), %d error(s).\n",
            $saved,
            $skippedOk,
            $failed
        ));

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    private function countLocationsForProvider(Entry $provider): int
    {
        return (int) Entry::find()
            ->section('locations')
            ->relatedTo([
                'targetElement' => $provider,
                'field' => 'provider',
            ])
            ->count();
    }

    private function providerEmailIsAcceptable(string $email): bool
    {
        if ($email === '') {
            return false;
        }

        $lower = strtolower($email);
        $placeholders = ['not found', 'by email', 'n/a', 'na', 'unknown', 'none', 'tbd', '—', '-', 'email', 'no email'];
        if (in_array($lower, $placeholders, true)) {
            return false;
        }

        return filter_var($lower, FILTER_VALIDATE_EMAIL) !== false;
    }

    private function deriveStreetAddress(string $title, string $city, string $state, string $zip): string
    {
        $street = trim($title);

        if ($street === '') {
            return '';
        }

        if ($city !== '' && $state !== '' && $zip !== '') {
            $cityEscaped = preg_quote($city, '/');
            $stateEscaped = preg_quote($state, '/');
            $zipEscaped = preg_quote($zip, '/');

            $patterns = [
                '/,\s*' . $cityEscaped . '\s*,\s*' . $stateEscaped . '\s+' . $zipEscaped . '$/iu',
                '/,\s*' . $cityEscaped . '\s*,\s*' . $stateEscaped . '$/iu',
            ];

            foreach ($patterns as $pattern) {
                $candidate = preg_replace($pattern, '', $street);
                if (is_string($candidate) && trim($candidate) !== $street) {
                    return rtrim(trim($candidate), ',');
                }
            }
        }

        $fallback = preg_replace('/,\s*[^,]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?$/u', '', $street);
        if (is_string($fallback) && trim($fallback) !== $street) {
            return rtrim(trim($fallback), ',');
        }

        return $street;
    }
}
