<?php
/**
 * Site URL Rules
 *
 * You can define custom site URL rules here, which Craft will check in addition
 * to routes defined in Settings → Routes.
 *
 * Read about Craft’s routing behavior (and this file’s structure), here:
 * @link https://craftcms.com/docs/5.x/system/routing.html
 */

return [
    'directory' => ['template' => 'directory/index'],
    'providers' => ['template' => 'directory/index'],
    'about' => ['template' => 'about/index'],
    'faqs' => ['template' => 'faqs/index'],
    'contact' => ['template' => 'contact/index'],
    'login' => ['template' => 'login/index'],
    'register' => ['template' => 'register/index'],
    'sign-out' => 'users/logout',
    'signed-out' => ['template' => 'logout/index'],
];
