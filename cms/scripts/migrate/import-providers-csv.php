<?php

declare(strict_types=1);

use craft\elements\Category;
use craft\elements\Entry;
use craft\helpers\App;
use craft\helpers\Console;
use craft\helpers\StringHelper;

require dirname(__DIR__, 2) . '/bootstrap.php';

/** @var craft\console\Application $app */
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';

$defaultSource = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS3A1P-z3ZwFnJwxGFvbiik6WAuyuMSgDZruGaqt1WengExno78Z2nitew_UQTdrs6l0PGlrJcShLN/pub?gid=827851666&single=true&output=csv';
$source = $argv[1] ?? $defaultSource;

$siteId = Craft::$app->getSites()->getPrimarySite()->id;
$entries = Craft::$app->getEntries();
$categories = Craft::$app->getCategories();

$providersSection = $entries->getSectionByHandle('providers');
$locationsSection = $entries->getSectionByHandle('locations');
$credentialsGroup = $categories->getGroupByHandle('credentials');
$specialtiesGroup = $categories->getGroupByHandle('specialties');

if (!$providersSection || !$locationsSection || !$credentialsGroup || !$specialtiesGroup) {
    Console::stderr("Missing one or more required Craft sections/category groups.\n", Console::FG_RED);
    exit(1);
}

$providerType = $providersSection->getEntryTypes()[0] ?? null;
$locationType = $locationsSection->getEntryTypes()[0] ?? null;

if (!$providerType || !$locationType) {
    Console::stderr("Missing provider or location entry type.\n", Console::FG_RED);
    exit(1);
}

$csv = fetchCsv($source);
$rows = parseCsv($csv);

$providersByName = [];
foreach (Entry::find()->section('providers')->siteId($siteId)->status(null)->all() as $provider) {
    $providersByName[normalizeKey((string)$provider->title)] = $provider;
}

$locationsByKey = [];
foreach (Entry::find()->section('locations')->siteId($siteId)->status(null)->all() as $location) {
    $provider = $location->getFieldValue('provider')->one();
    if ($provider) {
        $locationsByKey[locationKey($provider->id, (string)$location->title)] = $location;
    }
}

$stats = [
    'rows' => 0,
    'providersCreated' => 0,
    'providersUpdated' => 0,
    'locationsCreated' => 0,
    'locationsUpdated' => 0,
    'categoriesCreated' => 0,
];

foreach ($rows as $row) {
    $providerName = clean($row['Provider Name'] ?? '');
    $address = clean($row['Full Address (DHS)'] ?? '');
    $city = clean($row['City'] ?? '');
    $state = clean($row['State'] ?? '');
    $zip = clean($row['ZIP'] ?? '');

    if ($providerName === '' || $address === '' || $city === '' || $state === '' || $zip === '') {
        continue;
    }

    $stats['rows']++;

    $providerKey = normalizeKey($providerName);
    $provider = $providersByName[$providerKey] ?? null;
    $isNewProvider = !$provider;

    if (!$provider) {
        $provider = new Entry([
            'sectionId' => $providersSection->id,
            'typeId' => $providerType->id,
            'siteId' => $siteId,
            'title' => $providerName,
            'slug' => StringHelper::slugify($providerName),
            'enabled' => true,
            'enabledForSite' => true,
        ]);
    }

    $providerWebsite = urlValue($row['Website (DHS)'] ?? '') ?: urlValue($row['Contact Page URL'] ?? '');
    $providerEmail = emailValue($row['Email'] ?? '');
    $providerPhone = cleanKnownEmpty($row['Phone (Website)'] ?? '') ?: cleanKnownEmpty($row['Phone (DHS)'] ?? '');
    $credentialIds = categoryIds($row['Staff Credentials'] ?? '', $credentialsGroup, $siteId, $stats);
    $specialtyIds = categoryIds($row['Specialties'] ?? '', $specialtiesGroup, $siteId, $stats);

    $providerValues = [
        'dbtaCertified' => yes($row['DBT-A Certified'] ?? ''),
        'dbtAdherentTeam' => yes($row['Adherent Team Only'] ?? ''),
        'credentials' => $credentialIds,
        'specialties' => $specialtyIds,
    ];

    if ($providerWebsite && shouldUseWebsite($providerWebsite, fieldString($provider->getFieldValue('website')))) {
        $providerValues['website'] = $providerWebsite;
    }

    if ($providerEmail && fieldString($provider->getFieldValue('email')) === '') {
        $providerValues['email'] = $providerEmail;
    }

    if ($providerPhone && fieldString($provider->getFieldValue('phone')) === '') {
        $providerValues['phone'] = $providerPhone;
    }

    $provider->setFieldValues($providerValues);

    saveElement($provider, "provider {$providerName}");
    $providersByName[$providerKey] = $provider;
    $stats[$isNewProvider ? 'providersCreated' : 'providersUpdated']++;

    $locationKey = locationKey($provider->id, $address);
    $location = $locationsByKey[$locationKey] ?? null;
    $isNewLocation = !$location;

    if (!$location) {
        $location = new Entry([
            'sectionId' => $locationsSection->id,
            'typeId' => $locationType->id,
            'siteId' => $siteId,
            'title' => $address,
            'slug' => StringHelper::slugify($providerName . '-' . $address),
            'enabled' => true,
            'enabledForSite' => true,
        ]);
    }

    $locationValues = [
        'provider' => [$provider->id],
        'city' => $city,
        'state' => $state,
        'zip' => $zip,
        'availability' => yes($row['Accepting New Clients'] ?? ''),
    ];

    $location->setFieldValues($locationValues);
    saveElement($location, "location {$address}");

    $locationsByKey[$locationKey] = $location;
    $stats[$isNewLocation ? 'locationsCreated' : 'locationsUpdated']++;
}

Console::stdout("Imported {$stats['rows']} CSV rows.\n", Console::FG_GREEN);
Console::stdout("Providers: {$stats['providersCreated']} created, {$stats['providersUpdated']} updated.\n");
Console::stdout("Locations: {$stats['locationsCreated']} created, {$stats['locationsUpdated']} updated.\n");
Console::stdout("Categories: {$stats['categoriesCreated']} created.\n");

function fetchCsv(string $source): string
{
    $source = App::parseEnv($source);
    $contents = @file_get_contents($source);

    if ($contents === false) {
        Console::stderr("Unable to read CSV source: {$source}\n", Console::FG_RED);
        exit(1);
    }

    return $contents;
}

/**
 * @return array<int, array<string, string>>
 */
function parseCsv(string $csv): array
{
    $handle = fopen('php://temp', 'r+');
    fwrite($handle, $csv);
    rewind($handle);

    $header = fgetcsv($handle);
    if (!$header) {
        return [];
    }

    $rows = [];
    while (($values = fgetcsv($handle)) !== false) {
        if ($values === [null] || $values === false) {
            continue;
        }

        $values = array_pad($values, count($header), '');
        $rows[] = array_combine($header, array_slice($values, 0, count($header)));
    }

    fclose($handle);

    return $rows;
}

function saveElement(Entry|Category $element, string $label): void
{
    if (!Craft::$app->getElements()->saveElement($element)) {
        Console::stderr("Unable to save {$label}: " . json_encode($element->getErrors()) . "\n", Console::FG_RED);
        exit(1);
    }
}

function categoryIds(string $value, craft\models\CategoryGroup $group, int $siteId, array &$stats): array
{
    $ids = [];

    foreach (splitList($value) as $title) {
        $category = Category::find()
            ->groupId($group->id)
            ->siteId($siteId)
            ->title($title)
            ->status(null)
            ->one();

        if (!$category) {
            $category = new Category([
                'groupId' => $group->id,
                'siteId' => $siteId,
                'title' => $title,
                'slug' => StringHelper::slugify($title),
                'enabled' => true,
                'enabledForSite' => true,
            ]);

            saveElement($category, "category {$title}");
            $stats['categoriesCreated']++;
        }

        $ids[] = $category->id;
    }

    return array_values(array_unique($ids));
}

function splitList(string $value): array
{
    $items = array_map('cleanKnownEmpty', explode(',', $value));

    return array_values(array_filter($items, static fn(string $item): bool => $item !== ''));
}

function clean(string $value): string
{
    return trim($value);
}

function cleanKnownEmpty(string $value): string
{
    $value = clean($value);
    $normalized = strtolower($value);

    if ($value === '' || in_array($normalized, ['not found', 'unknown', 'none', 'n/a'], true)) {
        return '';
    }

    return $value;
}

function urlValue(string $value): string
{
    $value = cleanKnownEmpty($value);

    return filter_var($value, FILTER_VALIDATE_URL) ? $value : '';
}

function emailValue(string $value): string
{
    $value = cleanKnownEmpty($value);

    return filter_var($value, FILTER_VALIDATE_EMAIL) ? $value : '';
}

function fieldString(mixed $value): string
{
    if ($value && is_object($value) && method_exists($value, 'getUrl')) {
        $value = $value->getUrl();
    }

    return trim((string)$value);
}

function shouldUseWebsite(string $incoming, string $existing): bool
{
    if ($existing === '') {
        return true;
    }

    return isRootUrl($incoming) && !isRootUrl($existing);
}

function isRootUrl(string $value): bool
{
    $path = parse_url($value, PHP_URL_PATH);

    return $path === null || $path === '' || $path === '/';
}

function yes(string $value): bool
{
    return str_starts_with(strtolower(clean($value)), 'yes');
}

function normalizeKey(string $value): string
{
    return strtolower(preg_replace('/\s+/', ' ', clean($value)) ?? '');
}

function locationKey(int $providerId, string $address): string
{
    return $providerId . ':' . normalizeKey($address);
}
