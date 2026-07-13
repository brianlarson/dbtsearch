<?php

use craft\elements\Entry;

if (!class_exists(Craft::class, false)) {
    require __DIR__ . '/../bootstrap.php';
    /** @var craft\console\Application $app */
    $app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';
    $app->init();
}

function normPhone(?string $phone): string
{
    $digits = preg_replace('/\D/', '', (string)$phone);
    return strlen($digits) >= 10 ? substr($digits, -10) : $digits;
}

function normStr(?string $value): string
{
    $value = strtolower(trim((string)$value));
    $value = str_replace(['.', ',', '#'], ' ', $value);
    $value = preg_replace('/\s+/', ' ', $value) ?? $value;

    $replacements = [
        ' street' => ' st',
        ' avenue' => ' ave',
        ' boulevard' => ' blvd',
        ' suite' => ' ste',
        ' drive' => ' dr',
        ' driver' => ' dr',
        ' road' => ' rd',
        ' northeast' => ' ne',
        ' northwest' => ' nw',
        ' southeast' => ' se',
        ' southwest' => ' sw',
        ' north ' => ' n ',
        ' south ' => ' s ',
        ' east ' => ' e ',
        ' west ' => ' w ',
    ];

    foreach ($replacements as $from => $to) {
        $value = str_replace($from, $to, $value);
    }

    $value = str_replace(['saint paul', 'st paul', 'st. paul'], 'saint paul', $value);
    $value = str_replace(['w saint paul', 'west saint paul', 'w st paul'], 'west saint paul', $value);

    return trim($value);
}

function normProvider(?string $name): string
{
    $name = normStr($name);
    $name = preg_replace('/\([^)]*\)/', '', $name) ?? $name;
    $name = preg_replace('/\b(inc|llc|pllc|pa|llp|dba)\b/', '', $name) ?? $name;
    $name = preg_replace('/\s+/', ' ', $name) ?? $name;
    return trim($name);
}

function providerNamesMatch(?string $official, ?string $craft): bool
{
    $a = normProvider($official);
    $b = normProvider($craft);

    if ($a === '' || $b === '') {
        return false;
    }

    if ($a === $b) {
        return true;
    }

    if (str_contains($a, $b) || str_contains($b, $a)) {
        return true;
    }

    $aWords = array_values(array_filter(explode(' ', $a), fn($w) => strlen($w) > 3));
    $bWords = array_values(array_filter(explode(' ', $b), fn($w) => strlen($w) > 3));

    if ($aWords !== [] && $bWords !== []) {
        $overlap = count(array_intersect($aWords, $bWords));
        if ($overlap >= min(count($aWords), count($bWords), 2)) {
            return true;
        }
    }

    $aFirst = explode(' ', $a)[0] ?? '';
    $bFirst = explode(' ', $b)[0] ?? '';
    if ($aFirst !== '' && $bFirst !== '' && ($aFirst === $bFirst || str_starts_with($a, $bFirst) || str_starts_with($b, $aFirst))) {
        return true;
    }

    similar_text($a, $b, $pct);
    return $pct >= 72;
}

function cityMatches(?string $official, ?string $craft): bool
{
    $a = normStr($official);
    $b = normStr($craft);
    return $a === $b || str_contains($a, $b) || str_contains($b, $a);
}

function addressMatches(?string $official, ?string $craft): bool
{
    $a = normStr($official);
    $b = normStr($craft);

    if ($a === $b || str_contains($b, $a) || str_contains($a, $b)) {
        return true;
    }

    $numA = extractStreetNumber($a);
    $numB = extractStreetNumber($b);

    if ($numA !== null && $numB !== null && $numA === $numB) {
        similar_text($a, $b, $pct);
        return $pct >= 45;
    }

    similar_text($a, $b, $pct);
    return $pct >= 75;
}

function extractStreetNumber(?string $address): ?string
{
    if (preg_match('/\b(\d+)\b/', normStr($address), $matches)) {
        return $matches[1];
    }

    return null;
}

function effectiveZip(array $loc): string
{
    $zip = trim((string)($loc['zip'] ?? ''));

    if (preg_match_all('/\b(\d{5})\b/', (string)$loc['address'], $matches)) {
        $addressZips = $matches[1];
        if (in_array($zip, $addressZips, true)) {
            return $zip;
        }

        $streetNumber = extractStreetNumber((string)$loc['address']);
        if ($streetNumber !== null && $zip === $streetNumber) {
            return end($addressZips) ?: $zip;
        }

        if ($zip === '' && $addressZips !== []) {
            return end($addressZips);
        }
    }

    return $zip;
}

function zipMatches(?string $official, array $loc): bool
{
    $officialZip = normStr($official);
    $craftZip = normStr(effectiveZip($loc));

    if ($officialZip === $craftZip) {
        return true;
    }

    if (preg_match_all('/\b(\d{5})\b/', (string)$loc['address'], $matches)) {
        return in_array($officialZip, $matches[1], true);
    }

    return false;
}

$certifiedRows = [
    ['num' => 1, 'provider' => 'Align Your Soul Counseling', 'address' => '300 3rd Ave Suite 302', 'city' => 'Rochester', 'zip' => '55904', 'phone' => '507-218-5913'],
    ['num' => 2, 'provider' => 'Art of Counseling, PLLC', 'address' => '275 4th St East Suite 301', 'city' => 'St. Paul', 'zip' => '55101', 'phone' => '651-318-0109'],
    ['num' => 3, 'provider' => 'Associated Clinic of Psychology (ACP DBT)', 'address' => '4027 County Road 25', 'city' => 'Minneapolis', 'zip' => '55416', 'phone' => '612-925-6033'],
    ['num' => 4, 'provider' => 'Associated Clinic of Psychology (ACP DBT)', 'address' => '6950 W 146th St Suite 100', 'city' => 'Apple Valley', 'zip' => '55124', 'phone' => '952-432-1484'],
    ['num' => 5, 'provider' => 'Associated Clinic of Psychology (ACP DBT)', 'address' => '149 Thompson Ave E Suite 150', 'city' => 'W. St. Paul', 'zip' => '55118', 'phone' => '651-450-0860'],
    ['num' => 6, 'provider' => 'Behavioral Health Advocate', 'address' => '130 Park Ave S Ste 3', 'city' => 'St. Cloud', 'zip' => '56301', 'phone' => '320-251-4571'],
    ['num' => 7, 'provider' => 'DBT Associates', 'address' => '7362 University Avenue Northeast Suite 101', 'city' => 'Fridley', 'zip' => '55432', 'phone' => '763-503-3981'],
    ['num' => 8, 'provider' => 'Family Services of Rochester', 'address' => '4600 18th Avenue Northwest', 'city' => 'Rochester', 'zip' => '55901', 'phone' => '507-507-2010'],
    ['num' => 9, 'provider' => 'Independent Management Services', 'address' => '101 21st Street Suite 1', 'city' => 'Austin', 'zip' => '55912', 'phone' => '507-437-6389'],
    ['num' => 10, 'provider' => 'Independent Management Services', 'address' => '226 W Clark Street', 'city' => 'Albert Lea', 'zip' => '56007', 'phone' => '507-437-6389'],
    ['num' => 11, 'provider' => 'Life Development Resources PA', 'address' => '7580 160th Street West', 'city' => 'Lakeville', 'zip' => '55044', 'phone' => '952-898-1133'],
    ['num' => 12, 'provider' => 'Life Development Resources PA', 'address' => '1619 Dayton Avenue', 'city' => 'St. Paul', 'zip' => '55104', 'phone' => '952-898-1133'],
    ['num' => 13, 'provider' => 'The Meadows Counseling Center', 'address' => '3737 40th Avenue Northwest', 'city' => 'Rochester', 'zip' => '55901', 'phone' => '507-288-6978'],
    ['num' => 14, 'provider' => 'Minnesota Center for Psychology LLC', 'address' => '2324 University Avenue West Suite 120', 'city' => 'St Paul', 'zip' => '55114', 'phone' => '651-644-4100'],
    ['num' => 15, 'provider' => 'Northern Pines Mental Health Center Inc', 'address' => '520 5th Street Northwest', 'city' => 'Brainerd', 'zip' => '56401', 'phone' => '218-892-3235'],
    ['num' => 16, 'provider' => 'Northern Pines', 'address' => '1906 5th Avenue SE', 'city' => 'Little Falls', 'zip' => '56345', 'phone' => '320-639-2025'],
    ['num' => 17, 'provider' => 'Northern Pines', 'address' => '16 9th Ave SE', 'city' => 'Long Prairie', 'zip' => '56347', 'phone' => '320-639-2025'],
    ['num' => 18, 'provider' => 'Northern Pines', 'address' => '11 2nd St W', 'city' => 'Wadena', 'zip' => '56452', 'phone' => '320-639-2025'],
    ['num' => 19, 'provider' => 'Sagent Behavioral Health', 'address' => '11660 Round Lake Boulevard Northwest', 'city' => 'Coon Rapids', 'zip' => '55433', 'phone' => '763-767-3350'],
    ['num' => 20, 'provider' => 'Sagent', 'address' => '11010 Prairie Lakes Drive Suite 350', 'city' => 'Eden Prairie', 'zip' => '55344', 'phone' => '952-746-2522'],
    ['num' => 21, 'provider' => 'Sagent', 'address' => '17685 Juniper Path Suite 303', 'city' => 'Lakeville', 'zip' => '55044', 'phone' => '952-214-8959'],
    ['num' => 22, 'provider' => 'Sagent', 'address' => '201 North Broad Street', 'city' => 'Mankato', 'zip' => '56001', 'phone' => '507-225-1500'],
    ['num' => 23, 'provider' => 'Sagent', 'address' => '13603 80th Circle North', 'city' => 'Maple Grove', 'zip' => '55369', 'phone' => '763-274-3120'],
    ['num' => 24, 'provider' => 'Sagent', 'address' => '1900 Silver Lake Road Suite 110', 'city' => 'New Brighton', 'zip' => '55112', 'phone' => '651-628-9566'],
    ['num' => 25, 'provider' => 'Sagent', 'address' => '101 Delher Drive', 'city' => 'St. Cloud', 'zip' => '56377', 'phone' => '320-253-3512'],
    ['num' => 26, 'provider' => 'Sagent', 'address' => '1811 Weir Drive Suite 270', 'city' => 'Woodbury', 'zip' => '55125', 'phone' => '651-714-9646'],
    ['num' => 27, 'provider' => 'Parker Collins Family Mental Health (DBT-A Certified)', 'address' => '1056 Centerville Circle', 'city' => 'Vadnais Heights', 'zip' => '55127', 'phone' => '651-604-7771'],
    ['num' => 28, 'provider' => 'PhoenixRisen Counseling LLC', 'address' => '6640 Shady Oak Road', 'city' => 'Eden Prairie', 'zip' => '55344', 'phone' => '612-217-1810'],
    ['num' => 29, 'provider' => 'RADIAS Health', 'address' => '166 4th Street East', 'city' => 'St Paul', 'zip' => '55101', 'phone' => '651-389-4690'],
    ['num' => 30, 'provider' => 'Riverstone Psychological Services Inc.', 'address' => '511 Northern Hills Drive Northeast Suite 2', 'city' => 'Rochester', 'zip' => '55906', 'phone' => '507-696-2523'],
    ['num' => 31, 'provider' => 'Secure Base Counseling Center', 'address' => '570 Professional Drive', 'city' => 'Northfield', 'zip' => '55057', 'phone' => '507-301-3412'],
    ['num' => 32, 'provider' => 'Secure Base', 'address' => '213 First St', 'city' => 'Farmington', 'zip' => '55024', 'phone' => '507-301-3412'],
    ['num' => 33, 'provider' => 'Secure Base', 'address' => '301 E Main St', 'city' => 'New Prague', 'zip' => '56071', 'phone' => '507-301-3412'],
    ['num' => 34, 'provider' => 'Spero', 'address' => '610 Florence Ave', 'city' => 'Owatonna', 'zip' => '55060', 'phone' => '507-451-2630'],
    ['num' => 35, 'provider' => 'Spero', 'address' => '17 5th St SE', 'city' => 'Kasson', 'zip' => '55944', 'phone' => '507-634-4639'],
    ['num' => 36, 'provider' => 'Volunteers of America MN / Vona Center', 'address' => '9220 Bass Lake Road Suite 255', 'city' => 'New Hope', 'zip' => '55422', 'phone' => '763-225-4029'],
    ['num' => 37, 'provider' => 'Washburn Center for Children', 'address' => '1100 Glenwood Ave', 'city' => 'Minneapolis', 'zip' => '55405', 'phone' => '612-871-1454'],
    ['num' => 38, 'provider' => 'Western Mental Health Clinic', 'address' => '1212 East College Drive', 'city' => 'Marshall', 'zip' => '56258', 'phone' => '507-532-3236'],
    ['num' => 39, 'provider' => 'Western Mental Health', 'address' => '112 St. Olaf Ave S', 'city' => 'Canby', 'zip' => '56220', 'phone' => '800-658-2429'],
    ['num' => 40, 'provider' => 'Western Mental Health', 'address' => '818 Prentice Drive', 'city' => 'Granite Falls', 'zip' => '56241', 'phone' => '800-658-2449'],
    ['num' => 41, 'provider' => 'Western Mental Health', 'address' => '2001 Maple St', 'city' => 'Slayton', 'zip' => '56172', 'phone' => '800-658-2249'],
    ['num' => 42, 'provider' => 'Western Mental Health', 'address' => '101 Caring Way', 'city' => 'Redwood Falls', 'zip' => '56283', 'phone' => '507-532-3236'],
    ['num' => 43, 'provider' => 'Western Mental Health', 'address' => '2042 Juniper Driver', 'city' => 'Slayton', 'zip' => '56172', 'phone' => '800-658-2429'],
    ['num' => 44, 'provider' => 'Western Mental Health', 'address' => '240 Willow St', 'city' => 'Tyler', 'zip' => '56178', 'phone' => '800-658-2429'],
];

$dryRun = $dryRun ?? in_array('--dry-run', $argv ?? [], true);

$locations = Entry::find()->section('locations')->status(null)->with(['provider'])->all();
$locationRows = [];

foreach ($locations as $loc) {
    $provider = $loc->provider->one();
    $locationRows[] = [
        'entry' => $loc,
        'id' => $loc->id,
        'address' => $loc->title,
        'city' => (string)$loc->getFieldValue('city'),
        'zip' => (string)$loc->getFieldValue('zip'),
        'dbtaCertified' => (bool)$loc->getFieldValue('dbtaCertified'),
        'status' => $loc->status,
        'providerName' => $provider?->title,
        'phone' => (string)($provider?->getFieldValue('phone') ?? ''),
    ];
}

function scoreMatch(array $row, array $loc): int
{
    $score = 0;

    if (!providerNamesMatch($row['provider'], $loc['providerName'])) {
        return 0;
    }
    $score += 30;

    if (!zipMatches($row['zip'], $loc)) {
        return 0;
    }
    $score += 25;

    if (cityMatches($row['city'], $loc['city'])) {
        $score += 20;
    } else {
        return 0;
    }

    if (addressMatches($row['address'], $loc['address'])) {
        $score += 20;
    } else {
        return 0;
    }

    $officialPhone = normPhone($row['phone']);
    $craftPhone = normPhone($loc['phone']);
    if ($officialPhone !== '' && $craftPhone !== '' && $officialPhone === $craftPhone) {
        $score += 10;
    }

    return $score;
}

$updated = [];
$alreadySet = [];
$notFound = [];
$ambiguous = [];

foreach ($certifiedRows as $row) {
    $candidates = [];

    foreach ($locationRows as $loc) {
        $score = scoreMatch($row, $loc);
        if ($score >= 90) {
            $candidates[] = ['loc' => $loc, 'score' => $score];
        }
    }

    usort($candidates, fn($a, $b) => $b['score'] <=> $a['score']);

    if (count($candidates) === 0) {
        $notFound[] = $row;
        continue;
    }

    if (count($candidates) > 1 && $candidates[0]['score'] === $candidates[1]['score']) {
        $ambiguous[] = [
            'row' => $row,
            'candidates' => array_map(fn($c) => [
                'id' => $c['loc']['id'],
                'provider' => $c['loc']['providerName'],
                'address' => $c['loc']['address'],
                'city' => $c['loc']['city'],
                'zip' => $c['loc']['zip'],
                'score' => $c['score'],
            ], $candidates),
        ];
        continue;
    }

    $match = $candidates[0]['loc'];

    if ($match['dbtaCertified']) {
        $alreadySet[] = [
            'num' => $row['num'],
            'locationId' => $match['id'],
            'provider' => $match['providerName'],
            'address' => $match['address'],
            'city' => $match['city'],
        ];
        continue;
    }

    if (!$dryRun) {
        $entry = $match['entry'];
        $entry->setFieldValue('dbtaCertified', true);
        if (!Craft::$app->getElements()->saveElement($entry)) {
            fwrite(STDERR, "Failed to save location {$match['id']}: " . json_encode($entry->getErrors()) . PHP_EOL);
            continue;
        }
        $match['dbtaCertified'] = true;
    }

    $updated[] = [
        'num' => $row['num'],
        'locationId' => $match['id'],
        'provider' => $match['providerName'],
        'address' => $match['address'],
        'city' => $match['city'],
        'zip' => $match['zip'],
        'score' => $candidates[0]['score'],
    ];
}

$result = [
    'dryRun' => $dryRun,
    'summary' => [
        'certifiedRows' => count($certifiedRows),
        'updated' => count($updated),
        'alreadySet' => count($alreadySet),
        'notFound' => count($notFound),
        'ambiguous' => count($ambiguous),
    ],
    'updated' => $updated,
    'alreadySet' => $alreadySet,
    'notFound' => array_map(fn($r) => [
        'num' => $r['num'],
        'provider' => $r['provider'],
        'address' => $r['address'],
        'city' => $r['city'],
        'zip' => $r['zip'],
        'phone' => $r['phone'],
    ], $notFound),
    'ambiguous' => $ambiguous,
];

if (PHP_SAPI === 'cli' && !defined('TINKER_RUNNING')) {
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
}

return $result;
