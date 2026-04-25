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
use craft\helpers\MailerHelper;
use craft\mail\transportadapters\Smtp;
use modules\sync\Module as SyncModule;

return [
    'id' => App::env('CRAFT_APP_ID') ?: 'CraftCMS',
    'modules' => [
        'sync' => [
            'class' => SyncModule::class,
        ],
    ],
    'bootstrap' => ['sync'],
    'components' => [
        /**
         * Outbound mail:
         * - Production/staging: set RESEND_API_KEY (Resend SMTP). See cms/.env.example.production.
         * - DDEV without that key: Mailpit (ddev mailpit). Optional MAILPIT_SMTP_HOSTNAME / MAILPIT_SMTP_PORT.
         * - Otherwise: project-config email transport (Sendmail by default).
         *
         * @see https://resend.com/docs/send-with-smtp
         */
        'mailer' => function () {
            $config = App::mailerConfig();

            if (App::env('RESEND_API_KEY')) {
                $adapter = MailerHelper::createTransportAdapter(Smtp::class, [
                    'host' => App::env('RESEND_SMTP_HOST') ?: 'smtp.resend.com',
                    'port' => (int) (App::env('RESEND_SMTP_PORT') ?: 587),
                    'useAuthentication' => true,
                    'username' => App::env('RESEND_SMTP_USERNAME') ?: 'resend',
                    'password' => App::env('RESEND_API_KEY'),
                ]);
                $config['transport'] = $adapter->defineTransport();
            } elseif (filter_var(App::env('IS_DDEV_PROJECT'), FILTER_VALIDATE_BOOLEAN)) {
                $adapter = MailerHelper::createTransportAdapter(Smtp::class, [
                    'host' => App::env('MAILPIT_SMTP_HOSTNAME') ?: '127.0.0.1',
                    'port' => (int) (App::env('MAILPIT_SMTP_PORT') ?: 1025),
                    'useAuthentication' => false,
                ]);
                $config['transport'] = $adapter->defineTransport();
            }

            return \Craft::createObject($config);
        },
    ],
];
