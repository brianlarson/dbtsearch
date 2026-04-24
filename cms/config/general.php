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
use craft\helpers\App;
use mikehaertl\shellcommand\Command as ShellCommand;

$general = GeneralConfig::create()
    // Set the dev mode based on the environment
    ->devMode(App::env('ENVIRONMENT') === 'local' ? true : false)
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
    ]);

// Local DDEV: Craft builds mysqldump/mysql invocations with --defaults-file only (see
// craft\db/mysql\Schema::_createDumpConfigFile). That skips global my.cnf, and MariaDB's
// client enables TLS when MySQL 8 advertises it — then verification fails on the Docker
// mysql8 service's self-signed chain. Skip SSL for CLI only; traffic stays on the Docker network.
if (filter_var(App::env('IS_DDEV_PROJECT'), FILTER_VALIDATE_BOOLEAN)) {
    $skipSsl = static function (ShellCommand $command): ShellCommand {
        $command->addArg('--skip-ssl');
        return $command;
    };
    $general->backupCommand($skipSsl);
    $general->restoreCommand($skipSsl);
}

return $general;
