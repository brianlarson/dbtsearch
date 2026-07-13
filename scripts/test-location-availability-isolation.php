<?php
/**
 * Verify per-location availabilityUpdatedAt isolation on manage-style saves.
 *
 * Usage: ddev exec php scripts/test-location-availability-isolation.php [providerSearch] [locationId]
 */

require __DIR__ . '/../bootstrap.php';
/** @var craft\console\Application $app */
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';
$app->init();

use craft\elements\Entry;
use modules\portal\Module;

$search = $argv[1] ?? 'Sagent';
$forceLocationId = isset($argv[2]) ? (int)$argv[2] : null;

$provider = Entry::find()
    ->section('providers')
    ->status(null)
    ->search($search)
    ->one()
    ?? Entry::find()
        ->section('providers')
        ->status(null)
        ->title('*' . $search . '*')
        ->one();

if (!$provider instanceof Entry) {
    fwrite(STDERR, "Provider not found for search: {$search}\n");
    exit(1);
}

$locations = $provider->getFieldValue('locations')->all();
if (count($locations) < 2) {
    fwrite(STDERR, "Need at least 2 locations; found " . count($locations) . "\n");
    exit(1);
}

$target = null;
foreach ($locations as $loc) {
    if ($forceLocationId && (int)$loc->id === $forceLocationId) {
        $target = $loc;
        break;
    }
}
if (!$target) {
    $target = $locations[0];
}

$snapshot = static function (array $locs): array {
    $out = [];
    foreach ($locs as $loc) {
        $fresh = Entry::find()->section('locations')->id($loc->id)->status(null)->one();
        $stamp = $fresh->getFieldValue('availabilityUpdatedAt');
        $out[(int)$fresh->id] = [
            'title' => $fresh->title,
            'availability' => (bool)$fresh->getFieldValue('availability'),
            'availabilityUpdatedAt' => $stamp ? $stamp->format('c') : null,
            'dateUpdated' => $fresh->dateUpdated ? $fresh->dateUpdated->format('c') : null,
        ];
    }
    ksort($out);
    return $out;
};

$before = $snapshot($locations);

echo "Provider: {$provider->id} {$provider->title}\n";
echo "Target location: {$target->id} {$target->title}\n";
echo "BEFORE\n";
foreach ($before as $id => $row) {
    echo sprintf(
        "  %d avail=%s stamp=%s dateUpdated=%s\n",
        $id,
        $row['availability'] ? '1' : '0',
        $row['availabilityUpdatedAt'] ?? 'NULL',
        $row['dateUpdated'] ?? 'NULL'
    );
}

/** @var Module $module */
$module = Craft::$app->getModule('portal');
$portal = $module->get('providerPortal');

$locationsPayload = [];
foreach ($locations as $loc) {
    $id = (int)$loc->id;
    $currentAvail = (bool)$before[$id]['availability'];
    $locationsPayload[$id] = [
        'availability' => $id === (int)$target->id ? !$currentAvail : $currentAvail,
        'dbtaCertified' => (bool)$loc->getFieldValue('dbtaCertified'),
    ];
}

$ref = new ReflectionClass($portal);
$method = $ref->getMethod('saveLocations');
$method->setAccessible(true);
$errors = $method->invoke($portal, $provider, $locationsPayload, false);

if ($errors !== []) {
    fwrite(STDERR, "saveLocations errors: " . implode('; ', $errors) . "\n");
    exit(1);
}

$after = $snapshot($locations);

echo "AFTER (toggled availability on {$target->id} only)\n";
foreach ($after as $id => $row) {
    $changed = $before[$id] !== $row ? ' CHANGED' : '';
    echo sprintf(
        "  %d avail=%s stamp=%s dateUpdated=%s%s\n",
        $id,
        $row['availability'] ? '1' : '0',
        $row['availabilityUpdatedAt'] ?? 'NULL',
        $row['dateUpdated'] ?? 'NULL',
        $changed
    );
}

$targetId = (int)$target->id;
$failures = [];

if ($before[$targetId]['availability'] === $after[$targetId]['availability']) {
    $failures[] = 'Target availability did not toggle.';
}
if ($after[$targetId]['availabilityUpdatedAt'] === null) {
    $failures[] = 'Target availabilityUpdatedAt was not stamped.';
}
if ($before[$targetId]['availabilityUpdatedAt'] === $after[$targetId]['availabilityUpdatedAt']) {
    $failures[] = 'Target availabilityUpdatedAt did not change.';
}

foreach ($after as $id => $row) {
    if ($id === $targetId) {
        continue;
    }
    if ($row['availabilityUpdatedAt'] !== $before[$id]['availabilityUpdatedAt']) {
        $failures[] = "Sibling {$id} availabilityUpdatedAt changed unexpectedly.";
    }
    if ($row['dateUpdated'] !== $before[$id]['dateUpdated']) {
        $failures[] = "Sibling {$id} dateUpdated changed unexpectedly (should have been skipped).";
    }
    if ($row['availability'] !== $before[$id]['availability']) {
        $failures[] = "Sibling {$id} availability changed unexpectedly.";
    }
}

// Directory sort key isolation: only availabilityUpdatedAt (no dateUpdated fallback)
$sortKey = static function (array $row): int {
    if ($row['availabilityUpdatedAt'] === null) {
        return 0;
    }
    return (int)(new DateTimeImmutable($row['availabilityUpdatedAt']))->format('U');
};

$targetSort = $sortKey($after[$targetId]);
foreach ($after as $id => $row) {
    if ($id === $targetId) {
        continue;
    }
    $siblingSort = $sortKey($row);
    if ($siblingSort >= $targetSort && $targetSort > 0) {
        // Sibling with null stamp sorts as 0; only fail if sibling stamp moved up with target
        if ($row['availabilityUpdatedAt'] !== null && $siblingSort >= $targetSort) {
            $failures[] = "Sibling {$id} sort key ({$siblingSort}) floated with or above target ({$targetSort}).";
        }
    }
}

if ($failures !== []) {
    echo "FAIL\n";
    foreach ($failures as $f) {
        echo "  - {$f}\n";
    }
    // Restore target availability for local safety
    $restorePayload = [];
    foreach ($locations as $loc) {
        $id = (int)$loc->id;
        $restorePayload[$id] = [
            'availability' => $before[$id]['availability'],
            'dbtaCertified' => (bool)$loc->getFieldValue('dbtaCertified'),
        ];
    }
    $method->invoke($portal, $provider, $restorePayload, false);
    exit(1);
}

echo "PASS: only location {$targetId} stamp/dateUpdated moved; siblings unchanged.\n";

// Restore original availability so the test is non-destructive
$restorePayload = [];
foreach ($locations as $loc) {
    $id = (int)$loc->id;
    $restorePayload[$id] = [
        'availability' => $before[$id]['availability'],
        'dbtaCertified' => (bool)$loc->getFieldValue('dbtaCertified'),
    ];
}
$method->invoke($portal, $provider, $restorePayload, false);

$restored = $snapshot($locations);
$restoredAvail = $restored[$targetId]['availability'];
$originalAvail = $before[$targetId]['availability'];
echo "Restored target availability to " . ($restoredAvail ? '1' : '0') . " (was " . ($originalAvail ? '1' : '0') . ").\n";
echo "Note: target availabilityUpdatedAt remains at latest toggle timestamp (by design).\n";
