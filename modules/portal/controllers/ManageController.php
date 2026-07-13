<?php

namespace modules\portal\controllers;

use Craft;
use craft\elements\Entry;
use craft\web\Controller;
use modules\portal\Module;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class ManageController extends Controller
{
    protected array|bool|int $allowAnonymous = false;

    public function actionSave(): ?Response
    {
        $this->requirePostRequest();
        $this->requireLogin();

        $user = Craft::$app->getUser()->getIdentity();
        if (!$user) {
            throw new ForbiddenHttpException();
        }

        /** @var Module $module */
        $module = Craft::$app->getModule('portal');
        $portal = $module->get('providerPortal');

        if (!$portal->userCanAccessPortal($user)) {
            throw new ForbiddenHttpException('You do not have permission to use the provider portal.');
        }

        $request = Craft::$app->getRequest();
        $providerId = (int)$request->getRequiredBodyParam('providerId');

        $provider = Entry::find()
            ->section('providers')
            ->id($providerId)
            ->status(null)
            ->one();

        if (!$provider) {
            Craft::$app->getSession()->setError('Provider listing not found.');
            return $this->redirect('manage');
        }

        $result = $portal->saveProviderPortal($user, $provider, [
            'name' => $request->getBodyParam('name'),
            'phone' => $request->getBodyParam('phone'),
            'email' => $request->getBodyParam('email'),
            'website' => $request->getBodyParam('website'),
            'locations' => $request->getBodyParam('locations', []),
            'locationDetails' => (bool)$request->getBodyParam('locationDetails'),
        ]);

        if (!$result['success']) {
            Craft::$app->getSession()->setError(
                implode(' ', $result['errors'] ?? ['Unable to save your listing.'])
            );
            return $this->redirect('manage');
        }

        Craft::$app->getSession()->setNotice('Your listing has been updated.');
        return $this->redirect('manage');
    }
}
