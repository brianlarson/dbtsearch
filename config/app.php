<?php
/**
 * Yii Application Config
 *
 * Edit this file at your own risk!
 *
 * The array returned by this file will get merged with
 * vendor/craftcms/cms/src/config/app.php and app.[web|console].php, when
 * Craft's bootstrap script is defining the configuration for the entire
 * application.
 *
 * You can define custom modules and system components, and even override the
 * built-in system components.
 *
 * If you want to modify the application config for *only* web requests or
 * *only* console requests, create an app.web.php or app.console.php file in
 * your config/ folder, alongside this one.
 *
 * Read more about application configuration:
 * @link https://craftcms.com/docs/5.x/reference/config/app.html
 */

use craft\helpers\App;
use craft\mail\transportadapters\Smtp;

// This DDEV project’s `.env` may set CRAFT_ENVIRONMENT=production. Detect DDEV explicitly
// so Mailpit is used locally without changing staging/production Resend.
$isDdev = filter_var(App::env('IS_DDEV_PROJECT'), FILTER_VALIDATE_BOOLEAN);

$config = [
    'id' => App::env('CRAFT_APP_ID') ?: 'CraftCMS',
    'modules' => [
        'portal' => \modules\portal\Module::class,
    ],
    'bootstrap' => ['portal'],
];

if ($isDdev) {
    $config['components']['mailer'] = static function() {
        $settings = App::mailSettings();
        $settings->transportType = Smtp::class;
        $settings->transportSettings = [
            'host' => '127.0.0.1',
            'port' => 1025,
            'useAuthentication' => false,
        ];
        return Craft::createObject(App::mailerConfig($settings));
    };
}

return $config;
