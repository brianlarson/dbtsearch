<?php
/**
 * Reset availability on locations whose provider listing is unclaimed.
 *
 * Clears `availability` (false) and `availabilityUpdatedAt` (null) so the
 * directory does not surface openings / “Last updated” for listings no one
 * has claimed via the portal.
 *
 * Usage (from project root, with Craft env loaded):
 *   php scripts/reset-unclaimed-location-availability.php --dry-run
 *   php scripts/reset-unclaimed-location-availability.php
 *
 * Options:
 *   --dry-run   Report only; do not save
 *   --keep-false-timestamps
 *               Only clear availabilityUpdatedAt when availability is true
 *               (default: clear timestamp whenever resetting, including already-false)
 */

use craft\elements\Entry;
use modules\portal\Module;
use modules\portal\services\ProviderOnboardingService;

if (!class_exists(Craft::class, false)) {
    require __DIR__ . '/../bootstrap.php';
    /** @var craft\console\Application $app */
    $app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';
    $app->init();
}

$dryRun = in_array('--dry-run', $argv ?? [], true);
$keepFalseTimestamps = in_array('--keep-false-timestamps', $argv ?? [], true);

/** @var Module $portalModule */
$portalModule = Craft::$app->getModule('portal');
if (!$portalModule) {
    fwrite(STDERR, "Portal module is not registered.\n");
    exit(1);
}

/** @var ProviderOnboardingService $onboarding */
$onboarding = $portalModule->get('providerOnboarding');
$claimedIds = $onboarding->getClaimedProviderIds();
$claimedSet = array_fill_keys($claimedIds, true);

echo $dryRun ? "DRY RUN — no changes will be saved.\n" : "APPLYING changes.\n";
echo 'Claimed provider IDs (' . count($claimedIds) . '): ' . (count($claimedIds) ? implode(', ', $claimedIds) : '(none)') . "\n";

$locations = Entry::find()
    ->section('locations')
    ->status(null)
    ->all();

$scanned = 0;
$skippedClaimed = 0;
$skippedNoProvider = 0;
$wouldChange = 0;
$saved = 0;
$errors = 0;

foreach ($locations as $location) {
    if (!$location instanceof Entry) {
        continue;
    }
    $scanned++;

    $provider = null;
    try {
        $provider = $location->getFieldValue('provider')?->one();
    } catch (Throwable) {
        $provider = null;
    }

    if (!$provider instanceof Entry) {
        $skippedNoProvider++;
        continue;
    }

    if (isset($claimedSet[(int)$provider->id])) {
        $skippedClaimed++;
        continue;
    }

    $availability = (bool)($location->getFieldValue('availability') ?? false);
    $updatedAt = $location->getFieldValue('availabilityUpdatedAt');
    $hasTimestamp = $updatedAt !== null && $updatedAt !== '';

    $needsAvailabilityClear = $availability;
    $needsTimestampClear = $hasTimestamp && (!$keepFalseTimestamps || $availability);

    if (!$needsAvailabilityClear && !$needsTimestampClear) {
        continue;
    }

    $wouldChange++;
    $title = $location->title ?: ('#' . $location->id);
    $providerTitle = $provider->title ?: ('#' . $provider->id);
    echo sprintf(
        "- location #%d (%s) via unclaimed provider #%d (%s): availability=%s timestamp=%s\n",
        (int)$location->id,
        $title,
        (int)$provider->id,
        $providerTitle,
        $availability ? 'true' : 'false',
        $hasTimestamp ? 'set' : 'empty'
    );

    if ($dryRun) {
        continue;
    }

    $fieldValues = [];
    if ($needsAvailabilityClear) {
        $fieldValues['availability'] = false;
    }
    if ($needsTimestampClear) {
        $fieldValues['availabilityUpdatedAt'] = null;
    }

    $location->setFieldValues($fieldValues);

    if (!Craft::$app->getElements()->saveElement($location)) {
        $errors++;
        fwrite(STDERR, '  FAILED: ' . implode('; ', $location->getErrorSummary(true)) . "\n");
        continue;
    }

    $saved++;
}

echo "\nSummary\n";
echo "  scanned locations: {$scanned}\n";
echo "  skipped (claimed provider): {$skippedClaimed}\n";
echo "  skipped (no provider link): {$skippedNoProvider}\n";
echo "  needing reset: {$wouldChange}\n";
if (!$dryRun) {
    echo "  saved: {$saved}\n";
    echo "  errors: {$errors}\n";
}

exit($errors > 0 ? 1 : 0);
