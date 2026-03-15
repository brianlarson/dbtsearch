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
    // Homepage: use default index for now while refining splash in Storybook.
    // To use splash as homepage again: '' => ['template' => 'splash/index'],
    '' => ['template' => 'index'],
];
