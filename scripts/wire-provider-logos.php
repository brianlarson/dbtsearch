<?php

declare(strict_types=1);

use craft\elements\Asset;
use craft\elements\Entry;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use craft\helpers\StringHelper;

require dirname(__DIR__) . '/bootstrap.php';

/** @var craft\console\Application $app */
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';

$dryRun = in_array('--dry-run', $argv, true);
$verifyOnly = in_array('--verify', $argv, true);

$jsonPath = dirname(__DIR__) . '/data/provider-logos.json';
$logosByDomain = [];
$logosByNameNorm = [];
if (is_file($jsonPath)) {
    $items = json_decode((string)file_get_contents($jsonPath), true) ?: [];
    foreach ($items as $item) {
        $domain = strtolower((string)($item['domain'] ?? ''));
        if ($domain !== '') {
            $logosByDomain[$domain] = $item;
        }
        $name = normalizeKey((string)($item['name'] ?? ''));
        if ($name !== '') {
            $logosByNameNorm[$name] = $item;
        }
    }
}

$logosByDomain['fernbrook.org'] = [
    'domain' => 'fernbrook.org',
    'logoClearbit' => 'https://logo.clearbit.com/fernbrook.org',
    'logoFavicon' => 'https://www.google.com/s2/favicons?domain=fernbrook.org&sz=128',
];

$volume = Craft::$app->getVolumes()->getVolumeByHandle('general');
if (!$volume) {
    Console::stderr("General volume not found.\n", Console::FG_RED);
    exit(1);
}

$folder = Craft::$app->getAssets()->findFolder(['volumeId' => $volume->id, 'path' => 'providers/logos/']);
if (!$folder) {
    Console::stderr("Folder providers/logos not found.\n", Console::FG_RED);
    exit(1);
}

$allAssets = Asset::find()->folderId($folder->id)->status(null)->all();
$assetsByFilename = [];
$assetsByTitleNorm = [];
$assignedAssetIds = assignedLogoAssetIds();

foreach ($allAssets as $asset) {
    $assetsByFilename[strtolower($asset->filename)] = $asset;
    $assetsByTitleNorm[normalizeKey((string)$asset->title)] = $asset;
}

$providers = Entry::find()->section('providers')->status(null)->all();
$missing = [];
$withLogo = 0;
foreach ($providers as $provider) {
    if ($provider->getFieldValue('logo')->one()) {
        $withLogo++;
    } else {
        $missing[] = $provider;
    }
}

Console::stdout('Providers: ' . count($providers) . " total, {$withLogo} with logo, " . count($missing) . " missing\n");

if ($verifyOnly) {
    foreach ($missing as $p) {
        $match = findMatchingAsset($p, $assetsByFilename, $assetsByTitleNorm, $logosByDomain, $logosByNameNorm, $assignedAssetIds);
        $hint = $match ? " possible asset {$match->id} ({$match->filename})" : '';
        Console::stdout("MISSING: {$p->title} (id {$p->id}){$hint}\n");
    }
    exit(0);
}

$imported = [];
$wiredExisting = [];
$failed = [];
$northlandAsset = null;

foreach ($missing as $provider) {
    $title = (string)$provider->title;

    if (isNorthland($title) && $northlandAsset) {
        $asset = $northlandAsset;
    } else {
        $asset = findMatchingAsset($provider, $assetsByFilename, $assetsByTitleNorm, $logosByDomain, $logosByNameNorm, $assignedAssetIds);
    }

    if (!$asset) {
        $meta = providerMeta($provider, $logosByDomain, $logosByNameNorm);
        if (!$meta) {
            $failed[$title] = 'no metadata/domain for download';
            continue;
        }

        $filename = suggestedFilename($meta, $title);
        if ($dryRun) {
            Console::stdout("[dry-run] would download and import {$filename} for {$title}\n");
            continue;
        }

        $localRoot = dirname(__DIR__) . '/public/images/providers/';
        $localPath = $localRoot . $filename;
        if (is_file($localPath)) {
            $bytes = (string) file_get_contents($localPath);
        } else {
            $bytes = downloadLogo($meta);
        }
        if ($bytes === null || strlen($bytes) < 200) {
            $failed[$title] = 'download failed or too small';
            continue;
        }

        $tempPath = Craft::$app->getPath()->getTempPath() . '/' . StringHelper::UUID() . '-' . $filename;
        file_put_contents($tempPath, $bytes);

        $asset = createAsset($tempPath, $filename, $folder, $title);
        @unlink($tempPath);
        if (!$asset) {
            $failed[$title] = 'asset create failed';
            continue;
        }
        $assetsByFilename[strtolower($asset->filename)] = $asset;
        $imported[$title] = $asset->id;
    } else {
        $wiredExisting[$title] = $asset->id;
    }

    if (isNorthland($title)) {
        $northlandAsset = $asset;
    }

    if (!$dryRun && $asset) {
        $provider->setFieldValue('logo', [$asset->id]);
        if (!Craft::$app->getElements()->saveElement($provider)) {
            $failed[$title] = 'save provider: ' . implode(', ', $provider->getErrorSummary(true));
        } else {
            $assignedAssetIds[$asset->id] = true;
        }
    }
}

Console::stdout("\n=== Summary ===\n");
$withLogoAfter = 0;
$stillMissing = [];
foreach (Entry::find()->section('providers')->status(null)->all() as $p) {
    if ($p->getFieldValue('logo')->one()) {
        $withLogoAfter++;
    } else {
        $stillMissing[] = (string)$p->title;
    }
}
Console::stdout('With logo now: ' . $withLogoAfter . '/' . count($providers) . "\n");
Console::stdout('Wired existing: ' . count($wiredExisting) . "\n");
foreach ($wiredExisting as $t => $id) {
    Console::stdout("  existing {$t} -> asset {$id}\n");
}
Console::stdout('Newly imported: ' . count($imported) . "\n");
foreach ($imported as $t => $id) {
    Console::stdout("  imported {$t} -> asset {$id}\n");
}
if ($stillMissing) {
    Console::stdout('Still missing: ' . count($stillMissing) . "\n");
    foreach ($stillMissing as $t) {
        Console::stdout("  {$t}\n");
    }
}
if ($failed) {
    Console::stdout('Failed this run: ' . count($failed) . "\n");
    foreach ($failed as $t => $why) {
        Console::stdout("  {$t}: {$why}\n");
    }
}

function assignedLogoAssetIds(): array
{
    $ids = [];
    foreach (Entry::find()->section('providers')->status(null)->all() as $provider) {
        $logo = $provider->getFieldValue('logo')->one();
        if ($logo) {
            $ids[(int)$logo->id] = true;
        }
    }
    return $ids;
}

function normalizeKey(string $s): string
{
    $s = strtolower($s);
    $s = preg_replace('/\s*provider\s*$/', '', $s) ?? $s;
    $s = preg_replace('/[^a-z0-9]+/', '', $s) ?? $s;
    return $s;
}

function isNorthland(string $title): bool
{
    return stripos($title, 'northland counseling') !== false;
}

function providerMeta(Entry $provider, array $byDomain, array $byName): ?array
{
    $website = (string)$provider->getFieldValue('website');
    $domain = '';
    if ($website !== '' && ($host = parse_url($website, PHP_URL_HOST))) {
        $domain = strtolower((string)$host);
        if (str_starts_with($domain, 'www.')) {
            $domain = substr($domain, 4);
        }
    }
    if ($domain !== '' && isset($byDomain[$domain])) {
        return $byDomain[$domain];
    }
    $norm = normalizeKey((string)$provider->title);
    return $byName[$norm] ?? null;
}

function findMatchingAsset(
    Entry $provider,
    array $byFile,
    array $byTitle,
    array $byDomain,
    array $byName,
    array $assignedAssetIds,
): ?Asset {
    $meta = providerMeta($provider, $byDomain, $byName);
    if ($meta) {
        foreach (['imageLocal', 'image', 'logoUrl'] as $key) {
            if (empty($meta[$key])) {
                continue;
            }
            $base = strtolower(basename((string)$meta[$key]));
            if (isset($byFile[$base])) {
                return $byFile[$base];
            }
        }
        $domain = (string)($meta['domain'] ?? '');
        if ($domain !== '') {
            $needle = str_replace('.', '-', $domain);
            foreach ($byFile as $fn => $asset) {
                if (str_contains($fn, $needle)) {
                    return $asset;
                }
            }
        }
    }
    $norm = normalizeKey((string)$provider->title);
    if (isset($byTitle[$norm])) {
        return $byTitle[$norm];
    }

    // Fuzzy: unassigned assets whose filename contains significant tokens from title
    $tokens = array_filter(preg_split('/\s+/', strtolower((string)$provider->title)) ?: [], fn ($t) => strlen($t) > 4);
    foreach ($byFile as $fn => $asset) {
        if (isset($assignedAssetIds[(int)$asset->id])) {
            continue;
        }
        foreach ($tokens as $token) {
            if (str_contains($fn, preg_replace('/[^a-z0-9]/', '', $token) ?? '')) {
                return $asset;
            }
        }
    }

    return null;
}

function suggestedFilename(array $meta, string $title): string
{
    if (!empty($meta['imageLocal'])) {
        return basename((string)$meta['imageLocal']);
    }
    if (!empty($meta['logoUrl'])) {
        return basename((string)$meta['logoUrl']);
    }
    $domain = (string)($meta['domain'] ?? StringHelper::slugify($title));
    return str_replace('.', '-', $domain) . '.png';
}

function downloadLogo(array $meta): ?string
{
    $urls = [];
    if (!empty($meta['logoClearbit'])) {
        $urls[] = $meta['logoClearbit'];
    }
    if (!empty($meta['logoFavicon'])) {
        $urls[] = $meta['logoFavicon'];
    }
    foreach ($urls as $url) {
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 20,
                'user_agent' => 'dbtsearch-logo-import/1.0',
                'follow_location' => 1,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);
        $data = @file_get_contents($url, false, $ctx);
        if ($data !== false && strlen($data) >= 200) {
            return $data;
        }
    }
    return null;
}

function createAsset(string $tempPath, string $filename, $folder, string $title): ?Asset
{
    $asset = new Asset([
        'tempFilePath' => $tempPath,
        'filename' => $filename,
        'newFolderId' => $folder->id,
        'title' => $title,
        'avoidFilenameConflicts' => true,
    ]);
    if (!Craft::$app->getElements()->saveElement($asset)) {
        Console::stderr('Asset save failed: ' . implode(', ', $asset->getErrorSummary(true)) . "\n");
        return null;
    }
    return $asset;
}
