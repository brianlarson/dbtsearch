<?php
/**
 * Shared bootstrap file
 */

// Set the error reporting level
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

// Define path constants
define('CRAFT_BASE_PATH', __DIR__);
define('CRAFT_VENDOR_PATH', CRAFT_BASE_PATH . '/vendor');

// Load Composer's autoloader
require_once CRAFT_VENDOR_PATH . '/autoload.php';

// Load dotenv?
if (class_exists(Dotenv\Dotenv::class)) {
    // Immutable: variables already set in the environment (e.g. DDEV CRAFT_DB_SERVER=mysql8) are not
    // replaced by .env. Missing vars are filled from .env so host-side `php craft` can use 127.0.0.1.
    Dotenv\Dotenv::createUnsafeImmutable(CRAFT_BASE_PATH)->safeLoad();
}
