<?php

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
    $name = preg_replace('/[&]/', ' ', $name) ?? $name;
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
    if ($aFirst !== '' && $bFirst !== '' && $aFirst === $bFirst && (str_starts_with($a, $bFirst) || str_starts_with($b, $aFirst))) {
        return true;
    }

    similar_text($a, $b, $pct);
    return $pct >= 72;
}

function providerNamesMatchStrict(?string $official, ?string $craft): bool
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

    $stopWords = ['mental', 'health', 'counseling', 'clinic', 'center', 'services', 'behavioral', 'psychology', 'psychological', 'therapy', 'therapeutic', 'family', 'associates', 'resources', 'solutions', 'program', 'programs'];

    $aWords = array_values(array_filter(explode(' ', $a), fn($w) => strlen($w) > 3 && !in_array($w, $stopWords, true)));
    $bWords = array_values(array_filter(explode(' ', $b), fn($w) => strlen($w) > 3 && !in_array($w, $stopWords, true)));

    if ($aWords === [] || $bWords === []) {
        return false;
    }

    $overlap = count(array_intersect($aWords, $bWords));
    return $overlap >= 2;
}

function cityMatches(?string $official, ?string $craft): bool
{
    $a = normStr($official);
    $b = normStr($craft);
    return $a === $b || str_contains($a, $b) || str_contains($b, $a);
}

function extractStreetNumber(?string $address): ?string
{
    if (preg_match('/\b(\d+)\b/', normStr($address), $matches)) {
        return $matches[1];
    }

    return null;
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

function effectiveZip(array $loc): string
{
    $zip = trim((string)($loc['zip'] ?? ''));

    if (preg_match_all('/\b(\d{5})\b/', (string)($loc['address'] ?? ''), $matches)) {
        $addressZips = $matches[1];
        if (in_array($zip, $addressZips, true)) {
            return $zip;
        }

        $streetNumber = extractStreetNumber((string)($loc['address'] ?? ''));
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

    if (preg_match_all('/\b(\d{5})\b/', (string)($loc['address'] ?? ''), $matches)) {
        return in_array($officialZip, $matches[1], true);
    }

    return false;
}
