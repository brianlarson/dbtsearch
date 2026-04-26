<?php

namespace modules\sync;

use Craft;
use yii\base\Module as BaseModule;

/**
 * Console utilities for directory data maintenance.
 *
 * Use this module for one-off or repeatable tasks after bulk imports (e.g. additional states’
 * providers/locations via Feed Me or scripts). Add new `console/controllers/*Controller.php`
 * actions here as needed. Duplicate provider rows: `fix-duplicate-provider-owners` re-points
 * locations; delete empty surplus providers in the CP. Prevent repeats with Feed Me matching on
 * `sourceProviderId` / `sourceLocationId`.
 *
 * Commands: `sync/sync/provider-locations`, `sync/sync/repair-provider-emails`,
 * `sync/sync/clear-invalid-provider-emails`, `sync/sync/normalize-location-titles`,
 * `sync/sync/diagnose-providers-import`, `sync/sync/fix-duplicate-provider-owners`.
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
