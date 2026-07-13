<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see \craft\config\GeneralConfig
 * @link https://craftcms.com/docs/5.x/reference/config/general.html
 */

use craft\config\GeneralConfig;
use mikehaertl\shellcommand\Command as ShellCommand;
use craft\helpers\App;


$isLocalDev = in_array(App::env('CRAFT_ENVIRONMENT'), ['dev', 'local'], true);
$skipLocalMysqlSsl = static fn(ShellCommand $command) => $command->addArg('--ssl-mode=DISABLED');

return GeneralConfig::create()
    // CRAFT_DEV_MODE, CRAFT_ALLOW_ADMIN_CHANGES, CRAFT_DISALLOW_ROBOTS, and
    // CRAFT_SECURITY_KEY are applied automatically from the environment.
    // Set the default week start day for date pickers (0 = Sunday, 1 = Monday, etc.)
    ->defaultWeekStartDay(1)
    // Prevent generated URLs from including "index.php"
    ->omitScriptNameInUrls()
    // Preload Single entries as Twig variables
    ->preloadSingles()
    // Prevent user enumeration attacks
    ->preventUserEnumeration()
    // Enable the Twig sandbox for system messages, etc.
    ->enableTwigSandbox()
    // Set the @webroot alias so the clear-caches command knows where to find CP resources
    ->aliases([
        '@webroot' => dirname(__DIR__) . '/web',
    ])
    ->postLogoutRedirect('/signed-out')
    ->backupCommand($isLocalDev ? $skipLocalMysqlSsl : null)
    ->restoreCommand($isLocalDev ? $skipLocalMysqlSsl : null)
;
