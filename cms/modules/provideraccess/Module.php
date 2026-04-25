<?php

namespace modules\provideraccess;

use Craft;
use craft\controllers\EntriesController;
use craft\elements\Entry;
use yii\base\ActionEvent;
use yii\base\Module as BaseModule;
use yii\web\ForbiddenHttpException;

/**
 * Minimal CP entry scoping for provider users.
 *
 * Current behavior:
 * - On providers/locations index pages, limits results to entries related to the current user.
 * - On edit/save requests for existing entries, denies access unless entry is in the user's scope.
 *
 * Scope rules:
 * - Read provider ids from the user's `providers` relation field.
 * - Allowed providers = those related provider entries.
 * - Allowed locations = entries in `locations` related to allowed providers via `provider` field.
 */
class Module extends BaseModule
{
    private const PROVIDER_GROUP_HANDLE = 'providers';
    private const USER_PROVIDER_FIELD_HANDLE = 'providers';
    private const LOCATION_PROVIDER_FIELD_HANDLE = 'provider';

    public function init(): void
    {
        parent::init();

        Craft::setAlias('@modules/provideraccess', __DIR__);

        if (!Craft::$app->getRequest()->getIsCpRequest()) {
            return;
        }

        EntriesController::on(EntriesController::EVENT_BEFORE_ACTION, function(ActionEvent $event): void {
            $this->handleEntriesControllerBeforeAction($event);
        });
    }

    private function handleEntriesControllerBeforeAction(ActionEvent $event): void
    {
        $user = Craft::$app->getUser()->getIdentity();
        if ($user === null || $user->admin) {
            return;
        }

        if (!$user->isInGroup(self::PROVIDER_GROUP_HANDLE)) {
            return;
        }

        $actionId = $event->action->id;
        $request = Craft::$app->getRequest();

        if ($actionId === 'index') {
            $sectionHandle = (string) ($request->getQueryParam('section') ?? '');
            if ($sectionHandle === '') {
                return;
            }

            $allowedIds = $this->allowedEntryIdsForSection($sectionHandle);
            if ($allowedIds === null) {
                return;
            }

            // Entries index reads request params into query criteria; inject id criteria.
            $_GET['id'] = $allowedIds === [] ? [0] : $allowedIds;
            return;
        }

        if (in_array($actionId, ['edit-entry', 'save-entry'], true)) {
            $entryId = $this->extractEntryIdFromRequest();
            if ($entryId === null) {
                // New entries (no id yet) are not restricted by this minimal module.
                return;
            }

            if (!$this->canAccessEntryId($entryId)) {
                throw new ForbiddenHttpException('You do not have permission to access this entry.');
            }
        }
    }

    private function extractEntryIdFromRequest(): ?int
    {
        $request = Craft::$app->getRequest();
        $entryId = $request->getBodyParam('entryId')
            ?? $request->getBodyParam('id')
            ?? $request->getQueryParam('entryId')
            ?? $request->getQueryParam('id');

        if ($entryId === null || $entryId === '') {
            return null;
        }

        $id = (int) $entryId;
        return $id > 0 ? $id : null;
    }

    private function canAccessEntryId(int $entryId): bool
    {
        $entry = Entry::find()
            ->id($entryId)
            ->status(null)
            ->drafts(null)
            ->provisionalDrafts(null)
            ->trashed(null)
            ->one();

        if (!$entry instanceof Entry) {
            return false;
        }

        $allowedIds = $this->allowedEntryIdsForSection((string) $entry->section->handle);
        if ($allowedIds === null) {
            return true;
        }

        return in_array($entryId, $allowedIds, true);
    }

    /**
     * @return int[]|null Null means section is not scoped by this module.
     */
    private function allowedEntryIdsForSection(string $sectionHandle): ?array
    {
        $providerIds = $this->currentUserProviderIds();

        if ($sectionHandle === 'providers') {
            return $providerIds;
        }

        if ($sectionHandle === 'locations') {
            if ($providerIds === []) {
                return [];
            }

            return Entry::find()
                ->section('locations')
                ->status(null)
                ->drafts(null)
                ->provisionalDrafts(null)
                ->trashed(null)
                ->relatedTo([
                    'targetElement' => $providerIds,
                    'field' => self::LOCATION_PROVIDER_FIELD_HANDLE,
                ])
                ->ids();
        }

        return null;
    }

    /**
     * @return int[]
     */
    private function currentUserProviderIds(): array
    {
        $user = Craft::$app->getUser()->getIdentity();
        if ($user === null) {
            return [];
        }

        $value = $user->getFieldValue(self::USER_PROVIDER_FIELD_HANDLE);
        if (method_exists($value, 'ids')) {
            return array_values(array_map('intval', $value->ids()));
        }

        return [];
    }
}
