<?php

/**
 * Backfill provider phone, website (from DHS certified list), and email (from legacy JSON).
 * Also reports location/provider contact gaps vs the DHS table.
 *
 * Usage:
 *   php scripts/backfill-provider-contacts-from-dhs.php [--dry-run] [--html=path]
 */

use craft\elements\Entry;

if (!class_exists(Craft::class, false)) {
    require __DIR__ . '/../bootstrap.php';
    /** @var craft\console\Application $app */
    $app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';
    $app->init();
}

require_once __DIR__ . '/lib/dhs-match.php';

$argv = $argv ?? [];
$dryRun = in_array('--dry-run', $argv, true);
$htmlPath = __DIR__ . '/../data/mn-dhs-certified-providers.html';
$overridePath = __DIR__ . '/../data/dhs-provider-contact-overrides.json';

foreach ($argv as $arg) {
    if (str_starts_with($arg, '--html=')) {
        $htmlPath = substr($arg, 7);
    }
}

if (!is_file($htmlPath) || isPlaceholderDhsHtml($htmlPath)) {
    $fallback = __DIR__ . '/../data/mn-dhs-table.html';
    if (is_file($fallback)) {
        $htmlPath = $fallback;
    }
}

function isPlaceholderDhsHtml(string $path): bool
{
    $head = file_get_contents($path, false, null, 0, 200) ?: '';
    return str_contains($head, 'Place latest DHS');
}

if (!is_file($htmlPath)) {
    fwrite(STDERR, "DHS HTML not found: {$htmlPath}\n");
    exit(1);
}

function loadContactOverrides(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $data = json_decode(file_get_contents($path) ?: '{}', true);
    return is_array($data) ? $data : [];
}

function parseDhsHtml(string $html): array
{
    $rows = [];
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
    libxml_clear_errors();

    $trs = $dom->getElementsByTagName('tr');
    foreach ($trs as $tr) {
        $tds = $tr->getElementsByTagName('td');
        if ($tds->length < 4) {
            continue;
        }

        $provider = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags(innerHtml($tds->item(0))), ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?? '');
        $provider = preg_replace('/\bDBT-A Certified Provider\b/i', '', $provider) ?? $provider;
        $provider = preg_replace('/\bDBT-A Certified\b/i', '', $provider) ?? $provider;
        $provider = trim($provider);

        if ($provider === '' || strcasecmp($provider, 'Provider') === 0) {
            continue;
        }

        $addressHtml = innerHtml($tds->item(1));
        $addressHtml = preg_replace('/<\/p>\s*<p[^>]*>/i', '<br>', $addressHtml) ?? $addressHtml;
        $addressLines = array_values(array_filter(array_map(
            fn($line) => trim(html_entity_decode(strip_tags($line), ENT_QUOTES | ENT_HTML5, 'UTF-8')),
            preg_split('/<br\s*\/?>/i', $addressHtml) ?: []
        )));

        $streetParts = [];
        $city = '';
        $state = 'MN';
        $zip = '';

        foreach ($addressLines as $line) {
            if (preg_match('/^(.+),\s*([A-Z]{2})\s+(\d{5})$/', $line, $m)) {
                $city = trim($m[1]);
                $state = trim($m[2]);
                $zip = trim($m[3]);
                continue;
            }
            if (preg_match('/^(.+),\s*([A-Z]{2})$/', $line, $m)) {
                $city = trim($m[1]);
                $state = trim($m[2]);
                continue;
            }
            if (preg_match('/^\d{5}$/', $line)) {
                $zip = $line;
                continue;
            }
            $streetParts[] = $line;
        }

        $address = trim(implode(' ', $streetParts));
        $website = extractLink($tds->item(2));
        $phoneCell = $tds->length >= 5 ? $tds->item(3) : $tds->item(3);
        $phone = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags(innerHtml($phoneCell)), ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?? '');

        $rows[] = [
            'provider' => $provider,
            'address' => $address,
            'city' => $city,
            'state' => $state,
            'zip' => $zip,
            'website' => $website,
            'phone' => $phone,
        ];
    }

    return $rows;
}

function innerHtml(?DOMNode $node): string
{
    if (!$node) {
        return '';
    }

    $html = '';
    foreach ($node->childNodes as $child) {
        $html .= $node->ownerDocument?->saveHTML($child) ?? '';
    }

    return $html;
}

function extractLink(?DOMNode $node): string
{
    if (!$node) {
        return '';
    }

    $anchors = $node->getElementsByTagName('a');
    if ($anchors->length > 0) {
        return trim(html_entity_decode($anchors->item(0)?->getAttribute('href') ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    $text = trim(strip_tags(innerHtml($node)));
    return strcasecmp($text, 'Website') === 0 ? '' : $text;
}

function getWebsiteUrl(Entry $provider): string
{
    $website = $provider->getFieldValue('website');
    if (is_object($website) && method_exists($website, 'getUrl')) {
        return trim((string)$website->getUrl());
    }

    return trim((string)$website);
}

function normalizeWebsite(?string $url): string
{
    $url = trim((string)$url);
    if ($url === '' || strcasecmp($url, 'Website') === 0) {
        return '';
    }

    if (!preg_match('#^https?://#i', $url)) {
        $url = 'https://' . ltrim($url, '/');
    }

    return $url;
}

function formatPhone(?string $phone): string
{
    $digits = preg_replace('/\D/', '', (string)$phone);
    if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
        $digits = substr($digits, 1);
    }

    if (strlen($digits) === 10) {
        return sprintf('(%s) %s-%s', substr($digits, 0, 3), substr($digits, 3, 3), substr($digits, 6));
    }

    return trim((string)$phone);
}

function loadLegacyEmails(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $data = json_decode(file_get_contents($path) ?: '[]', true);
    if (!is_array($data)) {
        return [];
    }

    $emails = [];
    foreach ($data as $row) {
        $email = trim((string)($row['email'] ?? ''));
        if ($email === '') {
            continue;
        }

        $key = normProvider((string)($row['name'] ?? ''));
        if ($key !== '' && !isset($emails[$key])) {
            $emails[$key] = $email;
        }
    }

    return $emails;
}

function providerContactFromDhsRows(array $rows): array
{
    $phones = [];
    $websites = [];

    foreach ($rows as $row) {
        $phone = trim((string)($row['phone'] ?? ''));
        if ($phone !== '') {
            $phones[normPhone($phone)] = $phone;
        }

        $website = normalizeWebsite((string)($row['website'] ?? ''));
        if ($website !== '') {
            $websites[$website] = $website;
        }
    }

    return [
        'phone' => $phones !== [] ? array_values($phones)[0] : '',
        'website' => $websites !== [] ? array_values($websites)[0] : '',
    ];
}

function scoreLocationMatch(array $dhsRow, array $craftLoc): int
{
    $score = 0;

    if (!providerNamesMatch($dhsRow['provider'], $craftLoc['providerName'])) {
        return 0;
    }
    $score += 30;

    if (!zipMatches($dhsRow['zip'], $craftLoc)) {
        return 0;
    }
    $score += 25;

    if (!cityMatches($dhsRow['city'], $craftLoc['city'])) {
        return 0;
    }
    $score += 20;

    if (!addressMatches($dhsRow['address'], $craftLoc['address'])) {
        return 0;
    }
    $score += 20;

    return $score;
}

$dhsRows = parseDhsHtml(file_get_contents($htmlPath) ?: '');
$legacyEmails = loadLegacyEmails(__DIR__ . '/../data/dbt-providers.json');
$contactOverrides = loadContactOverrides($overridePath);

$dhsByProvider = [];
foreach ($dhsRows as $row) {
    $key = normProvider($row['provider']);
    $dhsByProvider[$key][] = $row;
}

$providers = Entry::find()->section('providers')->status(null)->all();
$locations = Entry::find()->section('locations')->status(null)->with(['provider'])->all();

$craftLocations = [];
foreach ($locations as $loc) {
    $provider = $loc->provider->one();
    $craftLocations[] = [
        'entry' => $loc,
        'id' => $loc->id,
        'address' => $loc->title,
        'city' => (string)$loc->getFieldValue('city'),
        'zip' => (string)$loc->getFieldValue('zip'),
        'providerName' => $provider?->title,
        'providerId' => $provider?->id,
        'availability' => (bool)$loc->getFieldValue('availability'),
    ];
}

$matchedDhs = [];
$matchedCraft = [];
$dhsNotInCraft = [];
$craftNotInDhs = [];

foreach ($dhsRows as $index => $dhsRow) {
    $best = null;
    $bestScore = 0;

    foreach ($craftLocations as $locIndex => $craftLoc) {
        $score = scoreLocationMatch($dhsRow, $craftLoc);
        if ($score > $bestScore) {
            $bestScore = $score;
            $best = $locIndex;
        }
    }

    if ($bestScore >= 90 && $best !== null) {
        $matchedDhs[$index] = $best;
        $matchedCraft[$best] = $index;
    } else {
        $dhsNotInCraft[] = $dhsRow;
    }
}

foreach ($craftLocations as $locIndex => $craftLoc) {
    if (!isset($matchedCraft[$locIndex])) {
        $craftNotInDhs[] = $craftLoc;
    }
}

$updated = [];
$alreadyComplete = [];
$stillMissing = [];
$noDhsMatch = [];

foreach ($providers as $provider) {
    $key = normProvider($provider->title);
    $dhsGroup = $dhsByProvider[$key] ?? null;

    if ($dhsGroup === null) {
        foreach ($dhsByProvider as $rows) {
            if (providerNamesMatchStrict($provider->title, $rows[0]['provider'])) {
                $dhsGroup = $rows;
                break;
            }
        }
    }

    $currentPhone = trim((string)$provider->getFieldValue('phone'));
    $currentEmail = trim((string)$provider->getFieldValue('email'));
    $currentWebsite = getWebsiteUrl($provider);

    $targetPhone = $currentPhone;
    $targetEmail = $currentEmail;
    $targetWebsite = $currentWebsite;
    $changes = [];

    if ($dhsGroup !== null) {
        $contact = providerContactFromDhsRows($dhsGroup);
        if ($currentPhone === '' && $contact['phone'] !== '') {
            $targetPhone = $contact['phone'];
            $changes[] = 'phone';
        }
        if ($currentWebsite === '' && $contact['website'] !== '') {
            $targetWebsite = $contact['website'];
            $changes[] = 'website';
        }
    } else {
        $noDhsMatch[] = [
            'id' => $provider->id,
            'title' => $provider->title,
            'phone' => $currentPhone,
            'email' => $currentEmail,
            'website' => $currentWebsite,
        ];
    }

    $overrideKey = normProvider($provider->title);
    $override = $contactOverrides[$overrideKey] ?? null;

    if (is_array($override)) {
        if ($targetPhone === '' && !empty($override['phone'])) {
            $targetPhone = (string)$override['phone'];
            $changes[] = 'phone';
        }
        if ($targetWebsite === '' && !empty($override['website'])) {
            $targetWebsite = normalizeWebsite((string)$override['website']);
            $changes[] = 'website';
        }
        if ($targetEmail === '' && !empty($override['email'])) {
            $targetEmail = (string)$override['email'];
            $changes[] = 'email';
        }
    }

    if ($targetEmail === '' && isset($legacyEmails[$key])) {
        $targetEmail = $legacyEmails[$key];
        $changes[] = 'email';
    } elseif ($targetEmail === '') {
        foreach ($legacyEmails as $legacyKey => $email) {
            if (providerNamesMatchStrict($provider->title, $legacyKey)) {
                $targetEmail = $email;
                $changes[] = 'email';
                break;
            }
        }
    }

    $changes = array_values(array_unique($changes));

    if ($changes === []) {
        if ($currentPhone === '' || $currentWebsite === '') {
            $hasAvailableLocation = false;
            foreach ($provider->getFieldValue('locations')->all() as $loc) {
                if ($loc instanceof Entry && $loc->getFieldValue('availability')) {
                    $hasAvailableLocation = true;
                    break;
                }
            }

            if ($hasAvailableLocation) {
                $stillMissing[] = [
                    'id' => $provider->id,
                    'title' => $provider->title,
                    'missing' => array_values(array_filter([
                        $currentPhone === '' ? 'phone' : null,
                        $currentEmail === '' ? 'email' : null,
                        $currentWebsite === '' ? 'website' : null,
                    ])),
                ];
            }
        } else {
            $alreadyComplete[] = [
                'id' => $provider->id,
                'title' => $provider->title,
            ];
        }
        continue;
    }

    if (!$dryRun) {
        $fieldValues = [];
        if (in_array('phone', $changes, true)) {
            $fieldValues['phone'] = $targetPhone;
        }
        if (in_array('email', $changes, true)) {
            $fieldValues['email'] = $targetEmail;
        }
        if (in_array('website', $changes, true)) {
            $fieldValues['website'] = ['value' => $targetWebsite, 'type' => 'url'];
        }

        $provider->setFieldValues($fieldValues);
        if (!Craft::$app->getElements()->saveElement($provider)) {
            fwrite(STDERR, "Failed to save provider {$provider->id}: " . json_encode($provider->getErrors()) . PHP_EOL);
            continue;
        }
    }

    $updated[] = [
        'id' => $provider->id,
        'title' => $provider->title,
        'changes' => $changes,
        'phone' => in_array('phone', $changes, true) ? $targetPhone : null,
        'email' => in_array('email', $changes, true) ? $targetEmail : null,
        'website' => in_array('website', $changes, true) ? $targetWebsite : null,
    ];
}

$result = [
    'dryRun' => $dryRun,
    'htmlPath' => $htmlPath,
    'summary' => [
        'dhsRows' => count($dhsRows),
        'craftProviders' => count($providers),
        'craftLocations' => count($craftLocations),
        'dhsLocationsMatchedInCraft' => count($matchedDhs),
        'dhsLocationsNotInCraft' => count($dhsNotInCraft),
        'craftLocationsNotInDhs' => count($craftNotInDhs),
        'providersUpdated' => count($updated),
        'providersAlreadyComplete' => count($alreadyComplete),
        'providersStillMissingContacts' => count($stillMissing),
        'providersWithoutDhsMatch' => count($noDhsMatch),
    ],
    'updated' => $updated,
    'stillMissing' => $stillMissing,
    'noDhsMatch' => $noDhsMatch,
    'dhsNotInCraft' => array_map(fn($row) => [
        'provider' => $row['provider'],
        'address' => $row['address'],
        'city' => $row['city'],
        'zip' => $row['zip'],
        'phone' => $row['phone'],
        'website' => $row['website'],
    ], $dhsNotInCraft),
    'craftNotInDhs' => array_map(fn($loc) => [
        'locationId' => $loc['id'],
        'provider' => $loc['providerName'],
        'address' => $loc['address'],
        'city' => $loc['city'],
        'zip' => $loc['zip'],
    ], $craftNotInDhs),
];

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;

return $result;
