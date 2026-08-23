<?php
/**
 * Dispatch plugin config (justinholtweb/craft-dispatch).
 *
 * Free edition uses Craft’s mailer (`transportType` = craft). Local DDEV
 * captures mail in Mailpit; staging/production use the Resend adapter.
 *
 * @see https://github.com/justinholtweb/craft-dispatch
 */

return [
    '*' => [
        'defaultFromName' => 'DBT Search',
        'defaultFromEmail' => 'system@dbtsearch.org',
        'defaultReplyToEmail' => 'admin@dbtsearch.com',
        'sendBatchSize' => 25,
        'sendRateLimit' => 0,
        'transportType' => 'craft',
    ],
];
