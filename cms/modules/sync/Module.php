<?php

namespace modules\sync;

use Craft;
use yii\base\Module as BaseModule;

/**
 * Console utilities for directory data maintenance.
 *
 * Use this module for one-off or repeatable tasks after bulk imports (e.g. additional states’
 * providers/locations via Feed Me or scripts). Add new `console/controllers/*Controller.php`
 * actions here as needed.
 *
 * Commands: `sync/sync/provider-locations`, `sync/sync/repair-provider-emails`.
 */
class Module extends BaseModule
{
    public function init(): void
    {
        parent::init();

        Craft::setAlias('@modules/sync', __DIR__);

        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\sync\\console\\controllers';
        }
    }
}
