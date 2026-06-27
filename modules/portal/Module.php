<?php

namespace modules\portal;

use Craft;
use modules\portal\services\ProviderPortalService;
use yii\base\Module as BaseModule;

class Module extends BaseModule
{
    public function init(): void
    {
        Craft::setAlias('@modules/portal', __DIR__);

        if (!Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\portal\\controllers';
        }

        parent::init();

        $this->setComponents([
            'providerPortal' => ProviderPortalService::class,
        ]);
    }
}
