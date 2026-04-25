<?php

namespace modules\provideraccess;

use Craft;
use craft\controllers\EntriesController;
use craft\elements\Entry;
use craft\elements\db\ElementQuery;
use craft\elements\db\EntryQuery;
use craft\events\CancelableEvent;
use yii\base\ActionEvent;
use yii\base\Event;
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
    // Project-specific defaults. These are the first candidates to move into plugin settings later.
    private const PROVIDER_GROUP_HANDLE = 'providers';
    private const USER_PROVIDER_FIELD_HANDLE = 'providers';
    private const LOCATION_PROVIDER_FIELD_HANDLE = 'provider';
    private const PROVIDER_SECTION_HANDLE = 'providers';
    private const LOCATION_SECTION_HANDLE = 'locations';

    private bool $isComputingScope = false;

    public function init(): void
    {
        parent::init();

        Craft::setAlias('@modules/provideraccess', __DIR__);

        // Scope only the Control Panel; public site/API traffic should stay unaffected.
        if (!Craft::$app->getRequest()->getIsCpRequest()) {
            return;
        }

        // One interception point keeps the minimal module easy to reason about.
        Event::on(EntriesController::class, EntriesController::EVENT_BEFORE_ACTION, function(ActionEvent $event): void {
            $this->handleEntriesControllerBeforeAction($event);
        });

        // Craft 5 listing/modals are driven by element queries; enforce scope at query prep time.
        Event::on(EntryQuery::class, ElementQuery::EVENT_BEFORE_PREPARE, function(CancelableEvent $event): void {
            $this->handleEntryQueryBeforePrepare($event);
        });
    }

    private function handleEntriesControllerBeforeAction(ActionEvent $event): void
    {
        $user = Craft::$app->getUser()->getIdentity();
        // Admins and non-authenticated requests bypass scoping.
        if ($user === null || $user->admin) {
            return;
        }

        // Only apply this policy to the provider editors group.
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

            // Entries index builds criteria from request params, so id scoping here is enough
            // to constrain what records appear in the listing.
            $_GET['id'] = $allowedIds === [] ? [0] : $allowedIds;
            return;
        }

        if (in_array($actionId, ['edit-entry', 'save-entry'], true)) {
            $entryId = $this->extractEntryIdFromRequest();
            if ($entryId === null) {
                // New entries (no id yet) are intentionally open in v1. Follow-up hardening
                // can gate creation by section and preselect/lock allowed providers.
                return;
            }

            if (!$this->canAccessEntryId($entryId)) {
                throw new ForbiddenHttpException('You do not have permission to access this entry.');
            }
        }
    }

    private function handleEntryQueryBeforePrepare(CancelableEvent $event): void
    {
        if ($this->isComputingScope || !$this->shouldScopeCurrentUser()) {
            return;
        }

        $query = $event->sender;
        if (!$query instanceof EntryQuery) {
            return;
        }

        $sectionHandle = $this->resolveScopedSectionHandleFromQuery($query);
        if ($sectionHandle === null) {
            // "All Entries" view (no section filter): constrain to the union of scoped sections.
            $allowedIds = $this->allowedEntryIdsForAllScopedSections();
            $query->id($allowedIds === [] ? [0] : $allowedIds);
            return;
        }

        $allowedIds = $this->allowedEntryIdsForSection($sectionHandle);
        if ($allowedIds === null) {
            return;
        }

        // Hard id constraint is reliable across indexes and relation modals.
        $query->id($allowedIds === [] ? [0] : $allowedIds);
    }

    private function shouldScopeCurrentUser(): bool
    {
        $user = Craft::$app->getUser()->getIdentity();
        if ($user === null || $user->admin) {
            return false;
        }

        return $user->isInGroup(self::PROVIDER_GROUP_HANDLE);
    }

    private function resolveScopedSectionHandleFromQuery(EntryQuery $query): ?string
    {
        $sectionIds = $query->sectionId;
        if ($sectionIds === null || $sectionIds === '') {
            // Some CP index queries don't carry sectionId yet at this stage; fall back to request context.
            return $this->resolveScopedSectionHandleFromRequest();
        }

        if (!is_array($sectionIds)) {
            $sectionIds = [$sectionIds];
        }

        $handles = [];
        foreach ($sectionIds as $sectionId) {
            if (is_string($sectionId) && !is_numeric($sectionId)) {
                $section = Craft::$app->getEntries()->getSectionByHandle($sectionId);
            } elseif (is_numeric($sectionId)) {
                $section = Craft::$app->getEntries()->getSectionById((int) $sectionId);
            } else {
                return null;
            }
            if ($section === null) {
                continue;
            }

            $handles[$section->handle] = true;
        }

        if (count($handles) !== 1) {
            return null;
        }

        $handle = array_key_first($handles);
        if (!in_array($handle, [self::PROVIDER_SECTION_HANDLE, self::LOCATION_SECTION_HANDLE], true)) {
            return null;
        }

        return $handle;
    }

    private function resolveScopedSectionHandleFromRequest(): ?string
    {
        $request = Craft::$app->getRequest();
        $section = $request->getQueryParam('section') ?? $request->getBodyParam('section');
        if (!is_string($section) || $section === '') {
            return null;
        }

        if (!in_array($section, [self::PROVIDER_SECTION_HANDLE, self::LOCATION_SECTION_HANDLE], true)) {
            return null;
        }

        return $section;
    }

    /**
     * @return int[]
     */
    private function allowedEntryIdsForAllScopedSections(): array
    {
        $providerIds = $this->allowedEntryIdsForSection(self::PROVIDER_SECTION_HANDLE) ?? [];
        $locationIds = $this->allowedEntryIdsForSection(self::LOCATION_SECTION_HANDLE) ?? [];

        return array_values(array_unique(array_merge($providerIds, $locationIds)));
    }

    private function extractEntryIdFromRequest(): ?int
    {
        // Craft routes may pass ids in either body/query and in either `entryId` or `id`.
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
        // Include non-live states so draft/provisional edit routes are checked consistently.
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

        if ($sectionHandle === self::PROVIDER_SECTION_HANDLE) {
            // Provider entries are directly scoped from the user relation field.
            return $providerIds;
        }

        if ($sectionHandle === self::LOCATION_SECTION_HANDLE) {
            if ($providerIds === []) {
                return [];
            }

            $this->isComputingScope = true;
            try {
                return Entry::find()
                    ->section(self::LOCATION_SECTION_HANDLE)
                    ->status(null)
                    ->drafts(null)
                    ->provisionalDrafts(null)
                    ->trashed(null)
                    ->relatedTo([
                        // Location is in-scope when its Provider relation points at an allowed provider.
                        'targetElement' => $providerIds,
                        'field' => self::LOCATION_PROVIDER_FIELD_HANDLE,
                    ])
                    ->ids();
            } finally {
                $this->isComputingScope = false;
            }
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
        // Entries fields return an element query object, which supports ids().
        if (method_exists($value, 'ids')) {
            return array_values(array_map('intval', $value->ids()));
        }

        return [];
    }
}
