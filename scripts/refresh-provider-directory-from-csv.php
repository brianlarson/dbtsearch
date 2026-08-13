<?php

/**
 * Refresh provider/location directory data from the enriched MN DBT spreadsheet.
 *
 * Source (preferred): data/mn_dbt_providers_final.csv
 * Companion workbook: data/MN_DBT_Providers_Refreshed_Contact_Directory.xlsx
 *
 * Updates existing providers (phone/email/website if empty; Contact Page from sheet)
 * and locations (DBT-A; source IDs; obvious ZIP fixes). Creates missing
 * providers/locations. Does not change availability or delete extra Craft records.
 *
 * Usage (DDEV):
 *   ddev exec php scripts/refresh-provider-directory-from-csv.php --dry-run
 *   ddev exec php scripts/refresh-provider-directory-from-csv.php
 */

declare(strict_types=1);

use craft\elements\Entry;
use craft\elements\User;

if (!class_exists(Craft::class, false)) {
    require __DIR__ . '/../bootstrap.php';
    /** @var craft\console\Application $app */
    $app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';
    $app->init();
}

require_once __DIR__ . '/lib/dhs-match.php';

$argv = $argv ?? [];
$dryRun = in_array('--dry-run', $argv, true);
$csvPath = dirname(__DIR__) . '/data/mn_dbt_providers_final.csv';

foreach ($argv as $arg) {
    if (str_starts_with($arg, '--csv=')) {
        $csvPath = substr($arg, 6);
    }
}

if (!is_file($csvPath)) {
    fwrite(STDERR, "CSV not found: {$csvPath}\n");
    exit(1);
}

function isBlankCell(?string $value): bool
{
    $value = trim((string)$value);
    if ($value === '') {
        return true;
    }

    $normalized = strtolower($value);
    return in_array($normalized, ['not found', 'unknown', 'n/a', 'na', 'none', 'null', '-'], true);
}

function formatPhone(?string $phone): string
{
    $digits = preg_replace('/\D/', '', (string)$phone) ?? '';
    if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
        $digits = substr($digits, 1);
    }
    if (strlen($digits) === 10) {
        return '(' . substr($digits, 0, 3) . ') ' . substr($digits, 3, 3) . '-' . substr($digits, 6);
    }

    return trim((string)$phone);
}

function pickPhone(array $row): string
{
    foreach (['Phone (Website)', 'Phone (DHS)'] as $key) {
        $raw = trim((string)($row[$key] ?? ''));
        if (isBlankCell($raw)) {
            continue;
        }
        $formatted = formatPhone($raw);
        if (normPhone($formatted) !== '') {
            return $formatted;
        }
    }

    return '';
}

function pickEmail(?string $raw): string
{
    if (isBlankCell($raw)) {
        return '';
    }

    preg_match_all('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', (string)$raw, $matches);
    $emails = [];
    foreach ($matches[0] ?? [] as $email) {
        $email = strtolower(trim($email));
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $emails[$email] = $email;
        }
    }

    $emails = array_values($emails);
    if ($emails === []) {
        return '';
    }

    $preferred = ['info@', 'intake@', 'office@', 'contact@', 'hello@', 'admin@'];
    foreach ($emails as $email) {
        foreach ($preferred as $prefix) {
            if (str_starts_with($email, $prefix)) {
                return $email;
            }
        }
    }

    return $emails[0];
}

function pickUrl(?string $raw): string
{
    $raw = trim((string)$raw);
    if (isBlankCell($raw)) {
        return '';
    }

    if (!preg_match('#^https?://#i', $raw)) {
        $raw = 'https://' . ltrim($raw, '/');
    }

    $parts = parse_url($raw);
    if (empty($parts['host'])) {
        return '';
    }

    return $raw;
}

function yesNoToBool(?string $value): ?bool
{
    $normalized = strtolower(trim((string)$value));
    if (in_array($normalized, ['yes', 'true', '1'], true)) {
        return true;
    }
    if (in_array($normalized, ['no', 'false', '0'], true)) {
        return false;
    }

    return null;
}

function parseAddressParts(string $full, string $city, string $state, string $zip): array
{
    $full = trim($full);
    $extractedState = strtoupper(trim($state)) ?: 'MN';
    $extractedZip = trim($zip);

    if (preg_match('/,\s*([A-Z]{2})\s*,\s*(\d{5})(?:-\d{4})?\s*$/', $full, $m)) {
        $extractedState = $m[1];
        $extractedZip = $m[2];
    } elseif (preg_match('/,\s*([A-Z]{2})\s+(\d{5})(?:-\d{4})?\s*$/', $full, $m)) {
        $extractedState = $m[1];
        $extractedZip = $m[2];
    }

    $streetNumber = extractStreetNumber($full);
    if ($extractedZip !== '' && ($zip === '' || $zip === $streetNumber || !preg_match('/^\d{5}$/', $zip))) {
        $zip = $extractedZip;
    } elseif (preg_match('/^\d{5}$/', $extractedZip)) {
        $zip = $extractedZip;
    }

    $street = $full;
    $cityPattern = preg_quote(trim($city), '/');
    $street = preg_replace('/,\s*' . $cityPattern . '\s*,\s*' . preg_quote($extractedState, '/') . '\s*,\s*' . preg_quote($zip, '/') . '\s*$/i', '', $street) ?? $street;
    $street = preg_replace('/,\s*' . $cityPattern . '\s*,\s*' . preg_quote($extractedState, '/') . '\s+' . preg_quote($zip, '/') . '\s*$/i', '', $street) ?? $street;
    $street = trim($street, " ,");

    return [
        'street' => $street !== '' ? $street : $full,
        'city' => trim($city),
        'state' => $extractedState,
        'zip' => $zip,
        'full' => $full,
    ];
}

function sourceProviderId(string $name): string
{
    return hash('sha256', strtolower(trim($name)));
}

function sourceLocationId(string $name, string $fullAddress, string $city, string $state, string $zip): string
{
    return hash('sha256', implode("\x1F", [
        trim($name),
        trim($fullAddress),
        trim($city),
        trim($state),
        trim($zip),
    ]));
}

function linkUrl(Entry $provider, string $handle): string
{
    try {
        $value = $provider->getFieldValue($handle);
    } catch (Throwable) {
        return '';
    }

    if (is_object($value) && method_exists($value, 'getUrl')) {
        return trim((string)$value->getUrl());
    }

    return trim((string)($value ?? ''));
}

function loadCsvRows(string $path): array
{
    $handle = fopen($path, 'r');
    if ($handle === false) {
        throw new RuntimeException("Unable to open {$path}");
    }

    $header = fgetcsv($handle);
    if ($header === false) {
        fclose($handle);
        throw new RuntimeException("CSV has no header: {$path}");
    }

    $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string)$header[0]) ?? $header[0];
    $rows = [];

    while (($data = fgetcsv($handle)) !== false) {
        if ($data === [null] || $data === false) {
            continue;
        }
        $row = [];
        foreach ($header as $i => $key) {
            $row[$key] = $data[$i] ?? '';
        }
        if (trim((string)($row['Provider Name'] ?? '')) === '') {
            continue;
        }
        $rows[] = $row;
    }

    fclose($handle);
    return $rows;
}

function scoreSheetLocation(array $row, array $loc): int
{
    if (!providerNamesMatch($row['provider'], $loc['providerName'])) {
        return 0;
    }

    $score = 40;
    $cityHit = cityMatches($row['city'], $loc['city']);
    $zipHit = zipMatches($row['zip'], $loc) || ($row['zip'] !== '' && (string)$loc['zip'] === $row['zip']);
    $addressHit = addressMatches($row['street'], $loc['address']) || addressMatches($row['full'], $loc['address']);

    if ($cityHit) {
        $score += 25;
    }
    if ($zipHit) {
        $score += 20;
    }
    if ($addressHit) {
        $score += 20;
    }

    $sheetNum = extractStreetNumber($row['street'] !== '' ? $row['street'] : $row['full']);
    $craftNum = extractStreetNumber($loc['address']);
    if ($sheetNum !== null && $craftNum !== null && $sheetNum === $craftNum) {
        $score += 10;
    }

    if (!$cityHit && !$zipHit && !$addressHit) {
        return 0;
    }

    return $score;
}

function matchProvider(Entry $provider, array $sheetProviders): ?string
{
    $title = (string)$provider->title;
    $currentSourceId = trim((string)($provider->getFieldValue('sourceProviderId') ?? ''));

    foreach ($sheetProviders as $name => $group) {
        if (strcasecmp($title, $name) === 0) {
            return $name;
        }
        if ($currentSourceId !== '' && $currentSourceId === sourceProviderId($name)) {
            return $name;
        }
    }

    foreach ($sheetProviders as $name => $group) {
        if (providerNamesMatchStrict($name, $title)) {
            return $name;
        }
    }

    $loose = [];
    foreach ($sheetProviders as $name => $group) {
        if (providerNamesMatch($name, $title)) {
            $loose[] = $name;
        }
    }

    return count($loose) === 1 ? $loose[0] : null;
}

$csvRows = loadCsvRows($csvPath);
$sheetProviders = [];
$sheetLocations = [];

foreach ($csvRows as $csvRow) {
    $name = trim((string)$csvRow['Provider Name']);
    $address = parseAddressParts(
        (string)($csvRow['Full Address (DHS)'] ?? ''),
        (string)($csvRow['City'] ?? ''),
        (string)($csvRow['State'] ?? 'MN'),
        (string)($csvRow['ZIP'] ?? '')
    );

    $location = [
        'provider' => $name,
        'street' => $address['street'],
        'city' => $address['city'],
        'state' => $address['state'],
        'zip' => $address['zip'],
        'full' => $address['full'],
        'phone' => pickPhone($csvRow),
        'email' => pickEmail((string)($csvRow['Email'] ?? '')),
        'website' => pickUrl((string)($csvRow['Website (DHS)'] ?? '')),
        'contactPage' => pickUrl((string)($csvRow['Contact Page URL'] ?? '')),
        'dbtaCertified' => yesNoToBool((string)($csvRow['DBT-A Certified'] ?? '')),
        'accepting' => yesNoToBool((string)($csvRow['Accepting New Clients'] ?? '')),
        'sourceLocationId' => sourceLocationId($name, $address['full'], $address['city'], $address['state'], $address['zip']),
    ];

    $sheetProviders[$name][] = $location;
    $sheetLocations[] = $location;
}

$sheetProviderMeta = [];
foreach ($sheetProviders as $name => $locations) {
    $phones = [];
    $emails = [];
    $contacts = [];
    $websites = [];
    foreach ($locations as $loc) {
        if ($loc['phone'] !== '') {
            $phones[normPhone($loc['phone'])] = $loc['phone'];
        }
        if ($loc['email'] !== '') {
            $emails[$loc['email']] = $loc['email'];
        }
        if ($loc['contactPage'] !== '') {
            $contacts[$loc['contactPage']] = $loc['contactPage'];
        }
        if ($loc['website'] !== '') {
            $websites[$loc['website']] = $loc['website'];
        }
    }

    $sheetProviderMeta[$name] = [
        'name' => $name,
        'phone' => $phones !== [] ? array_values($phones)[0] : '',
        'email' => $emails !== [] ? array_values($emails)[0] : '',
        'contactPage' => $contacts !== [] ? array_values($contacts)[0] : '',
        'website' => $websites !== [] ? array_values($websites)[0] : '',
        'sourceProviderId' => sourceProviderId($name),
        'locations' => $locations,
    ];
}

$providerSection = Craft::$app->getEntries()->getSectionByHandle('providers');
$locationSection = Craft::$app->getEntries()->getSectionByHandle('locations');
$providerType = $providerSection?->getEntryTypes()[0] ?? null;
$locationType = $locationSection?->getEntryTypes()[0] ?? null;

if (!$providerSection || !$locationSection || !$providerType || !$locationType) {
    fwrite(STDERR, "Could not resolve providers/locations sections or entry types.\n");
    exit(1);
}

$author = User::find()->admin()->status(null)->one();
$authorId = $author?->id;

$providers = Entry::find()->section('providers')->status(null)->all();
$locations = Entry::find()->section('locations')->status(null)->with(['provider'])->all();

$craftLocations = [];
foreach ($locations as $loc) {
    $related = $loc->getFieldValue('provider')?->one();
    $craftLocations[] = [
        'entry' => $loc,
        'id' => $loc->id,
        'address' => $loc->title,
        'city' => (string)$loc->getFieldValue('city'),
        'zip' => (string)$loc->getFieldValue('zip'),
        'state' => (string)$loc->getFieldValue('state'),
        'dbtaCertified' => (bool)$loc->getFieldValue('dbtaCertified'),
        'sourceLocationId' => trim((string)($loc->getFieldValue('sourceLocationId') ?? '')),
        'providerName' => $related?->title,
        'providerId' => $related?->id,
        'provider' => $related,
    ];
}

$providerUpdates = [];
$providersCreated = [];
$locationUpdates = [];
$locationsCreated = [];
$unmatchedSheetLocations = [];
$ambiguousLocations = [];
$unmatchedCraftProviders = [];
$matchedSheetProviderNames = [];
$usedCraftLocationIndexes = [];

function saveProviderFields(Entry $provider, array $fields, bool $dryRun): bool
{
    if ($fields === [] || $dryRun) {
        return true;
    }

    $provider->setFieldValues($fields);
    if (!Craft::$app->getElements()->saveElement($provider)) {
        fwrite(STDERR, "Failed to save provider {$provider->id}: " . json_encode($provider->getErrorSummary(true)) . PHP_EOL);
        return false;
    }

    return true;
}

function createProviderEntry($section, $type, ?int $authorId, array $meta, bool $dryRun): ?Entry
{
    if ($dryRun) {
        return null;
    }

    $entry = new Entry();
    $entry->sectionId = $section->id;
    $entry->setTypeId($type->id);
    $entry->title = $meta['name'];
    $entry->enabled = true;
    if ($authorId) {
        $entry->setAuthorId($authorId);
    }

    $fields = [
        'sourceProviderId' => $meta['sourceProviderId'],
    ];
    if ($meta['phone'] !== '') {
        $fields['phone'] = $meta['phone'];
    }
    if ($meta['email'] !== '') {
        $fields['email'] = $meta['email'];
    }
    if ($meta['website'] !== '') {
        $fields['website'] = ['value' => $meta['website'], 'type' => 'url'];
    }
    if ($meta['contactPage'] !== '') {
        $fields['contactPage'] = ['value' => $meta['contactPage'], 'type' => 'url'];
    }

    $entry->setFieldValues($fields);
    if (!Craft::$app->getElements()->saveElement($entry)) {
        fwrite(STDERR, "Failed to create provider {$meta['name']}: " . json_encode($entry->getErrorSummary(true)) . PHP_EOL);
        return null;
    }

    return $entry;
}

function createLocationEntry($section, $type, ?int $authorId, Entry $provider, array $row, bool $dryRun): ?Entry
{
    if ($dryRun) {
        return null;
    }

    $entry = new Entry();
    $entry->sectionId = $section->id;
    $entry->setTypeId($type->id);
    $entry->title = $row['street'];
    $entry->enabled = true;
    if ($authorId) {
        $entry->setAuthorId($authorId);
    }

    $fields = [
        'city' => $row['city'],
        'state' => $row['state'] !== '' ? $row['state'] : 'MN',
        'zip' => $row['zip'],
        'provider' => [$provider->id],
        'sourceLocationId' => $row['sourceLocationId'],
        'availability' => false,
    ];
    if ($row['dbtaCertified'] !== null) {
        $fields['dbtaCertified'] = $row['dbtaCertified'];
    }

    $entry->setFieldValues($fields);
    if (!Craft::$app->getElements()->saveElement($entry)) {
        fwrite(STDERR, "Failed to create location {$row['street']}: " . json_encode($entry->getErrorSummary(true)) . PHP_EOL);
        return null;
    }

    $locationIds = array_map('intval', $provider->getFieldValue('locations')->ids());
    $locationIds[] = (int)$entry->id;
    $provider->setFieldValue('locations', array_values(array_unique($locationIds)));
    Craft::$app->getElements()->saveElement($provider);

    return $entry;
}

foreach ($providers as $provider) {
    $sheetName = matchProvider($provider, $sheetProviders);
    if ($sheetName === null) {
        $unmatchedCraftProviders[] = [
            'id' => $provider->id,
            'title' => $provider->title,
        ];
        continue;
    }

    $matchedSheetProviderNames[$sheetName] = true;
    $meta = $sheetProviderMeta[$sheetName];
    $changes = [];
    $fields = [];

    $currentPhone = trim((string)$provider->getFieldValue('phone'));
    $currentEmail = trim((string)$provider->getFieldValue('email'));
    $currentWebsite = linkUrl($provider, 'website');
    $currentContact = linkUrl($provider, 'contactPage');
    $currentSourceId = trim((string)($provider->getFieldValue('sourceProviderId') ?? ''));

    if ($currentPhone === '' && $meta['phone'] !== '') {
        $fields['phone'] = $meta['phone'];
        $changes[] = 'phone';
    }
    if ($currentEmail === '' && $meta['email'] !== '') {
        $fields['email'] = $meta['email'];
        $changes[] = 'email';
    }
    if ($currentWebsite === '' && $meta['website'] !== '') {
        $fields['website'] = ['value' => $meta['website'], 'type' => 'url'];
        $changes[] = 'website';
    }
    if ($meta['contactPage'] !== '' && $currentContact !== $meta['contactPage']) {
        $fields['contactPage'] = ['value' => $meta['contactPage'], 'type' => 'url'];
        $changes[] = 'contactPage';
    }
    if ($currentSourceId === '' && $meta['sourceProviderId'] !== '') {
        $fields['sourceProviderId'] = $meta['sourceProviderId'];
        $changes[] = 'sourceProviderId';
    }

    if ($changes !== []) {
        if (!saveProviderFields($provider, $fields, $dryRun)) {
            continue;
        }
        $providerUpdates[] = [
            'id' => $provider->id,
            'title' => $provider->title,
            'sheetName' => $sheetName,
            'changes' => $changes,
            'phone' => $fields['phone'] ?? null,
            'email' => $fields['email'] ?? null,
            'website' => $meta['website'] !== '' && in_array('website', $changes, true) ? $meta['website'] : null,
            'contactPage' => $meta['contactPage'] !== '' && in_array('contactPage', $changes, true) ? $meta['contactPage'] : null,
        ];
    }
}

$providerBySheetName = [];
foreach ($providers as $provider) {
    $sheetName = matchProvider($provider, $sheetProviders);
    if ($sheetName !== null) {
        $providerBySheetName[$sheetName] = $provider;
    }
}

foreach ($sheetProviderMeta as $name => $meta) {
    if (isset($matchedSheetProviderNames[$name])) {
        continue;
    }

    $created = createProviderEntry($providerSection, $providerType, $authorId, $meta, $dryRun);
    $providersCreated[] = [
        'title' => $name,
        'phone' => $meta['phone'],
        'email' => $meta['email'],
        'contactPage' => $meta['contactPage'],
        'website' => $meta['website'],
        'id' => $created?->id,
    ];
    if ($created) {
        $providerBySheetName[$name] = $created;
        $providers[] = $created;
    }
}

foreach ($sheetLocations as $row) {
    $candidates = [];
    foreach ($craftLocations as $index => $loc) {
        if (isset($usedCraftLocationIndexes[$index])) {
            continue;
        }

        if ($loc['sourceLocationId'] !== '' && $loc['sourceLocationId'] === $row['sourceLocationId']) {
            $candidates[] = ['index' => $index, 'loc' => $loc, 'score' => 200];
            continue;
        }

        $score = scoreSheetLocation($row, $loc);
        if ($score >= 75) {
            $candidates[] = ['index' => $index, 'loc' => $loc, 'score' => $score];
        }
    }

    usort($candidates, fn($a, $b) => $b['score'] <=> $a['score']);

    if ($candidates !== [] && (count($candidates) === 1 || $candidates[0]['score'] > $candidates[1]['score'])) {
        $match = $candidates[0];
        $usedCraftLocationIndexes[$match['index']] = true;
        $loc = $match['loc'];
        $entry = $loc['entry'];
        $changes = [];
        $fields = [];

        if ($row['dbtaCertified'] !== null && (bool)$loc['dbtaCertified'] !== $row['dbtaCertified']) {
            $fields['dbtaCertified'] = $row['dbtaCertified'];
            $changes[] = 'dbtaCertified';
        }

        $currentZip = (string)$loc['zip'];
        $streetNumber = extractStreetNumber($loc['address']);
        if ($row['zip'] !== '' && ($currentZip === '' || $currentZip === $streetNumber) && $currentZip !== $row['zip']) {
            $fields['zip'] = $row['zip'];
            $changes[] = 'zip';
        }

        if (trim((string)$loc['state']) === '' && $row['state'] !== '') {
            $fields['state'] = $row['state'];
            $changes[] = 'state';
        }

        if ($loc['sourceLocationId'] === '' && $row['sourceLocationId'] !== '') {
            $fields['sourceLocationId'] = $row['sourceLocationId'];
            $changes[] = 'sourceLocationId';
        }

        if ($changes !== []) {
            if (!$dryRun) {
                $entry->setFieldValues($fields);
                if (!Craft::$app->getElements()->saveElement($entry)) {
                    fwrite(STDERR, "Failed to save location {$entry->id}: " . json_encode($entry->getErrorSummary(true)) . PHP_EOL);
                    continue;
                }
            }
            $locationUpdates[] = [
                'id' => $entry->id,
                'provider' => $loc['providerName'],
                'address' => $loc['address'],
                'city' => $loc['city'],
                'changes' => $changes,
            ];
        }

        continue;
    }

    if (count($candidates) > 1) {
        $ambiguousLocations[] = [
            'provider' => $row['provider'],
            'city' => $row['city'],
            'street' => $row['street'],
            'candidates' => array_map(fn($c) => [
                'id' => $c['loc']['id'],
                'address' => $c['loc']['address'],
                'city' => $c['loc']['city'],
                'score' => $c['score'],
            ], $candidates),
        ];
        continue;
    }

    $provider = $providerBySheetName[$row['provider']] ?? null;
    if (!$provider instanceof Entry && !$dryRun) {
        $unmatchedSheetLocations[] = [
            'provider' => $row['provider'],
            'city' => $row['city'],
            'street' => $row['street'],
            'reason' => 'provider missing',
        ];
        continue;
    }

    $created = $provider instanceof Entry
        ? createLocationEntry($locationSection, $locationType, $authorId, $provider, $row, $dryRun)
        : null;

    $locationsCreated[] = [
        'provider' => $row['provider'],
        'street' => $row['street'],
        'city' => $row['city'],
        'zip' => $row['zip'],
        'dbtaCertified' => $row['dbtaCertified'],
        'id' => $created?->id,
    ];
}

$acceptingYesUnmapped = [];
foreach ($sheetLocations as $row) {
    if ($row['accepting'] === true) {
        $acceptingYesUnmapped[] = [
            'provider' => $row['provider'],
            'city' => $row['city'],
            'note' => 'Sheet says Accepting New Clients=Yes; availability was not overwritten',
        ];
    }
}

$result = [
    'dryRun' => $dryRun,
    'csvPath' => $csvPath,
    'summary' => [
        'sheetRows' => count($sheetLocations),
        'sheetProviders' => count($sheetProviderMeta),
        'craftProviders' => count($providers),
        'craftLocations' => count($craftLocations),
        'providersUpdated' => count($providerUpdates),
        'providersCreated' => count($providersCreated),
        'locationsUpdated' => count($locationUpdates),
        'locationsCreated' => count($locationsCreated),
        'unmatchedCraftProviders' => count($unmatchedCraftProviders),
        'unmatchedSheetLocations' => count($unmatchedSheetLocations),
        'ambiguousLocations' => count($ambiguousLocations),
        'sheetAcceptingYesNotApplied' => count($acceptingYesUnmapped),
    ],
    'providerUpdates' => $providerUpdates,
    'providersCreated' => $providersCreated,
    'locationUpdates' => $locationUpdates,
    'locationsCreated' => $locationsCreated,
    'unmatchedCraftProviders' => $unmatchedCraftProviders,
    'unmatchedSheetLocations' => $unmatchedSheetLocations,
    'ambiguousLocations' => $ambiguousLocations,
];

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
