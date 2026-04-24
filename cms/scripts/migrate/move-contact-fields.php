<?php

declare(strict_types=1);

use craft\elements\Entry;
use craft\helpers\Console;

require dirname(__DIR__, 2) . '/bootstrap.php';

/** @var craft\console\Application $app */
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';

$updated = 0;
$conflicts = [];

foreach (Entry::find()->section('providers')->status(null)->all() as $provider) {
    $locations = Entry::find()
        ->section('locations')
        ->relatedTo(['targetElement' => $provider, 'field' => 'provider'])
        ->status(null)
        ->all();

    if (!$locations) {
        continue;
    }

    $contactValues = [
        'website' => [],
        'email' => [],
        'phone' => [],
    ];

    foreach ($locations as $location) {
        foreach (array_keys($contactValues) as $handle) {
            $value = fieldString($location->getFieldValue($handle));

            if ($value !== '') {
                $contactValues[$handle][normalize($value)] = $value;
            }
        }
    }

    $fieldValues = [];

    foreach ($contactValues as $handle => $values) {
        if (!$values) {
            continue;
        }

        if (count($values) > 1) {
            $conflicts[] = sprintf(
                '%s %s: %s',
                $provider->title,
                $handle,
                implode(' | ', array_values($values)),
            );
        }

        $fieldValues[$handle] = chooseCanonicalValue($handle, array_values($values));
    }

    if (!$fieldValues) {
        continue;
    }

    $provider->setFieldValues($fieldValues);

    if (!Craft::$app->getElements()->saveElement($provider)) {
        Console::stderr("Unable to save provider {$provider->title}: " . json_encode($provider->getErrors()) . PHP_EOL, Console::FG_RED);
        exit(1);
    }

    $updated++;
}

Console::stdout("Updated {$updated} providers with provider-level contact fields." . PHP_EOL, Console::FG_GREEN);

if ($conflicts) {
    Console::stdout('Conflicts resolved:' . PHP_EOL, Console::FG_YELLOW);

    foreach ($conflicts as $conflict) {
        Console::stdout("- {$conflict}" . PHP_EOL, Console::FG_YELLOW);
    }
}

function fieldString(mixed $value): string
{
    if ($value && is_object($value) && method_exists($value, 'getUrl')) {
        $value = $value->getUrl();
    }

    return trim((string)$value);
}

function normalize(string $value): string
{
    return strtolower(trim($value));
}

function chooseCanonicalValue(string $handle, array $values): string
{
    if ($handle !== 'website' || count($values) < 2) {
        return $values[0] ?? '';
    }

    $rootUrls = array_values(array_filter($values, static function(string $value): bool {
        $path = parse_url($value, PHP_URL_PATH);

        return $path === null || $path === '' || $path === '/';
    }));

    return $rootUrls[0] ?? $values[0];
}
