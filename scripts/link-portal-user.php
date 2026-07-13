<?php

require __DIR__ . '/../bootstrap.php';
/** @var craft\console\Application $app */
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';
$app->init();

use craft\elements\Entry;
use craft\elements\User;

$email = $argv[1] ?? 'support@tinytreecounseling.com';
$providerTitle = $argv[2] ?? 'Tiny Tree Counseling';

$user = User::find()->email($email)->one();
if (!$user) {
    fwrite(STDERR, "User not found: {$email}\n");
    exit(1);
}

$provider = Entry::find()->section('providers')->search($providerTitle)->one()
    ?? Entry::find()->section('providers')->title($providerTitle)->one();

if (!$provider) {
    fwrite(STDERR, "Provider not found: {$providerTitle}\n");
    exit(1);
}

$user->setFieldValue('provider', [$provider->id]);
if (!Craft::$app->getElements()->saveElement($user)) {
    fwrite(STDERR, 'Failed to save user: ' . json_encode($user->getErrors()) . PHP_EOL);
    exit(1);
}

$provider->authorId = $user->id;
Craft::$app->getElements()->saveElement($provider);

$group = Craft::$app->userGroups->getGroupByHandle('provider');
if ($group && !$user->isInGroup($group)) {
    Craft::$app->users->assignUserToGroups($user->id, [$group->id]);
    echo "Added user to provider group\n";
} elseif (!$group) {
    echo "Warning: provider group not found in Craft — portal access check will fail until group exists\n";
}

echo "Linked {$email} to provider #{$provider->id} ({$provider->title})\n";
echo 'Locations: ' . count($provider->locations->all()) . "\n";
