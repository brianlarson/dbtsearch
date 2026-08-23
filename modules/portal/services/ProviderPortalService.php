<?php

namespace modules\portal\services;

use craft\base\Component;
use craft\elements\Category;
use craft\elements\Entry;
use craft\elements\User;
use craft\helpers\DateTimeHelper;

class ProviderPortalService extends Component
{
    public const PROVIDER_GROUP_HANDLES = ['provider', 'providerEditors'];

    /** @var array<string, int> */
    private array $categoryIdsByKey = [];

    public function userCanAccessPortal(User $user): bool
    {
        if ($user->admin) {
            return true;
        }

        foreach (self::PROVIDER_GROUP_HANDLES as $handle) {
            if ($user->isInGroup($handle)) {
                return true;
            }
        }

        return false;
    }

    public function getProviderForUser(User $user): ?Entry
    {
        $linked = $this->getLinkedProvider($user);
        if ($linked) {
            return $linked;
        }

        $authored = Entry::find()
            ->section('providers')
            ->authorId($user->id)
            ->status(null)
            ->all();

        return count($authored) === 1 ? $authored[0] : null;
    }

    public function getLinkedProvider(User $user): ?Entry
    {
        foreach (['provider', 'providers'] as $handle) {
            try {
                $value = $user->getFieldValue($handle);
            } catch (\Throwable) {
                continue;
            }

            if ($value === null) {
                continue;
            }

            if (is_object($value) && method_exists($value, 'one')) {
                $one = $value->one();
                if ($one instanceof Entry) {
                    return $one;
                }
            }

            if (is_object($value) && method_exists($value, 'all')) {
                $all = $value->all();
                if (count($all) === 1 && $all[0] instanceof Entry) {
                    return $all[0];
                }
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public function buildPortalData(Entry $provider): array
    {
        $locations = [];

        foreach ($provider->getFieldValue('locations')->all() as $location) {
            if (!$location instanceof Entry) {
                continue;
            }

            $city = trim((string)($location->getFieldValue('city') ?? ''));
            $state = trim((string)($location->getFieldValue('state') ?? ''));

            $locations[] = [
                'id' => (string)$location->id,
                'name' => (string)$location->title,
                'address' => (string)$location->title,
                'heading' => $city !== '' ? $city : ($state !== '' ? $state : 'Unknown location'),
                'city' => $city,
                'state' => $state,
                'zip' => (string)($location->getFieldValue('zip') ?? ''),
                'phone' => '',
                'email' => '',
                'website' => '',
                'availability' => (bool)($location->getFieldValue('availability') ?? false),
                'dbtaCertified' => (bool)($location->getFieldValue('dbtaCertified') ?? false),
            ];
        }

        return [
            'id' => (string)$provider->id,
            'name' => (string)$provider->title,
            'phone' => $this->plainText($provider, 'phone'),
            'email' => $this->plainText($provider, 'email'),
            'website' => $this->linkUrl($provider, 'website'),
            'contactPage' => $this->linkUrl($provider, 'contactPage'),
            'fax' => $this->plainText($provider, 'fax'),
            'staffPage' => $this->linkUrl($provider, 'staffPage'),
            'facebookUrl' => $this->linkUrl($provider, 'facebookUrl'),
            'instagramUrl' => $this->linkUrl($provider, 'instagramUrl'),
            'servicesOffered' => $this->plainText($provider, 'servicesOffered'),
            'dbtServicesDescription' => $this->plainText($provider, 'dbtServicesDescription'),
            'agesServed' => $this->plainText($provider, 'agesServed'),
            'acceptsInsurance' => $this->plainText($provider, 'acceptsInsurance'),
            'staffNames' => $this->plainText($provider, 'staffNames'),
            'specialties' => $this->categoryTitles($provider, 'specialties'),
            'credentials' => $this->categoryTitles($provider, 'credentials'),
            'telehealthAvailable' => $this->boolValue($provider, 'telehealthAvailable'),
            'inPersonAvailable' => $this->boolValue($provider, 'inPersonAvailable'),
            'slidingScale' => $this->boolValue($provider, 'slidingScale'),
            'dbtAdherentTeam' => $this->boolValue($provider, 'dbtAdherentTeam'),
            'dateUpdated' => $provider->dateUpdated
                ? DateTimeHelper::toDateTime($provider->dateUpdated)->format('c')
                : null,
            'locations' => $locations,
        ];
    }

    /**
     * @param array<string, mixed> $data
     * @return array{success: bool, errors?: string[]}
     */
    public function saveProviderPortal(User $user, Entry $provider, array $data): array
    {
        if ($this->getProviderForUser($user)?->id !== $provider->id) {
            return [
                'success' => false,
                'errors' => ['You do not have permission to edit this provider.'],
            ];
        }

        $name = trim((string)($data['name'] ?? ''));
        if ($name === '') {
            return [
                'success' => false,
                'errors' => ['Practice / listing name is required.'],
            ];
        }

        $provider->title = $name;
        $fieldValues = [];

        foreach (['phone', 'email', 'fax', 'servicesOffered', 'dbtServicesDescription', 'agesServed', 'acceptsInsurance', 'staffNames'] as $handle) {
            if (array_key_exists($handle, $data) && $data[$handle] !== null) {
                $fieldValues[$handle] = trim((string)$data[$handle]);
            }
        }

        foreach (['website', 'contactPage', 'staffPage', 'facebookUrl', 'instagramUrl'] as $handle) {
            if (!array_key_exists($handle, $data) || $data[$handle] === null) {
                continue;
            }
            $url = $this->normalizeWebsiteUrl(trim((string)$data[$handle]));
            $fieldValues[$handle] = $url === '' ? null : ['value' => $url, 'type' => 'url'];
        }

        foreach (['telehealthAvailable', 'inPersonAvailable', 'slidingScale', 'dbtAdherentTeam'] as $handle) {
            if (array_key_exists($handle, $data) && $data[$handle] !== null) {
                $fieldValues[$handle] = !empty($data[$handle]) && $data[$handle] !== '0';
            }
        }

        if (array_key_exists('specialties', $data) && $data['specialties'] !== null) {
            $fieldValues['specialties'] = $this->categoryIdsFromList((string)$data['specialties'], 'specialties');
        }
        if (array_key_exists('credentials', $data) && $data['credentials'] !== null) {
            $fieldValues['credentials'] = $this->categoryIdsFromList((string)$data['credentials'], 'credentials');
        }

        if ($fieldValues !== []) {
            $provider->setFieldValues($fieldValues);
        }

        $locationErrors = $this->saveLocations(
            $provider,
            is_array($data['locations'] ?? null) ? $data['locations'] : [],
            !empty($data['locationDetails'])
        );

        if ($locationErrors !== []) {
            return [
                'success' => false,
                'errors' => $locationErrors,
            ];
        }

        if (!\Craft::$app->getElements()->saveElement($provider)) {
            return [
                'success' => false,
                'errors' => $provider->getErrorSummary(true),
            ];
        }

        return ['success' => true];
    }

    /**
     * @param array<string|int, array<string, mixed>> $locationsData
     * @return string[]
     */
    private function saveLocations(Entry $provider, array $locationsData, bool $saveDetails): array
    {
        $allowedIds = array_map('intval', $provider->getFieldValue('locations')->ids());
        $errors = [];

        foreach ($locationsData as $locationId => $locationData) {
            if (!is_array($locationData)) {
                continue;
            }

            $locationId = (int)$locationId;
            if (!in_array($locationId, $allowedIds, true)) {
                $errors[] = "Location {$locationId} is not linked to your provider.";
                continue;
            }

            $location = Entry::find()
                ->section('locations')
                ->id($locationId)
                ->status(null)
                ->one();

            if (!$location instanceof Entry) {
                $errors[] = "Location {$locationId} could not be found.";
                continue;
            }

            $relatedProvider = $location->getFieldValue('provider')?->one();
            if (!$relatedProvider || (int)$relatedProvider->id !== (int)$provider->id) {
                $errors[] = "Location {$locationId} is not linked to your provider.";
                continue;
            }

            $newAvailability = !empty($locationData['availability']);
            $newDbtaCertified = !empty($locationData['dbtaCertified']);
            $currentAvailability = (bool)($location->getFieldValue('availability') ?? false);
            $currentDbtaCertified = (bool)($location->getFieldValue('dbtaCertified') ?? false);

            $fieldValues = [
                'availability' => $newAvailability,
                'dbtaCertified' => $newDbtaCertified,
            ];

            $hasChanges = $currentAvailability !== $newAvailability
                || $currentDbtaCertified !== $newDbtaCertified;

            if ($saveDetails) {
                $address = trim((string)($locationData['address'] ?? ''));
                if ($address !== '' && $location->title !== $address) {
                    $location->title = $address;
                    $hasChanges = true;
                }

                foreach (['city', 'state', 'zip'] as $handle) {
                    if (!array_key_exists($handle, $locationData)) {
                        continue;
                    }

                    $value = trim((string)$locationData[$handle]);
                    if ((string)($location->getFieldValue($handle) ?? '') !== $value) {
                        $fieldValues[$handle] = $value;
                        $hasChanges = true;
                    }
                }
            }

            if (!$hasChanges) {
                continue;
            }

            $location->setFieldValues($fieldValues);

            if (!\Craft::$app->getElements()->saveElement($location)) {
                $errors = array_merge($errors, $location->getErrorSummary(true));
            }
        }

        return $errors;
    }

    private function getWebsiteUrl(Entry $provider): string
    {
        return $this->linkUrl($provider, 'website');
    }

    private function plainText(Entry $entry, string $handle): string
    {
        try {
            return trim((string)($entry->getFieldValue($handle) ?? ''));
        } catch (\Throwable) {
            return '';
        }
    }

    private function boolValue(Entry $entry, string $handle): bool
    {
        try {
            return (bool)($entry->getFieldValue($handle) ?? false);
        } catch (\Throwable) {
            return false;
        }
    }

    private function linkUrl(Entry $entry, string $handle): string
    {
        try {
            $value = $entry->getFieldValue($handle);
        } catch (\Throwable) {
            return '';
        }

        if (is_object($value) && method_exists($value, 'getUrl')) {
            return trim((string)$value->getUrl());
        }

        if (is_object($value) && isset($value->value)) {
            return trim((string)$value->value);
        }

        return trim((string)($value ?? ''));
    }

    private function categoryTitles(Entry $entry, string $handle): string
    {
        try {
            $related = $entry->getFieldValue($handle);
        } catch (\Throwable) {
            return '';
        }

        if (!is_object($related) || !method_exists($related, 'all')) {
            return '';
        }

        $titles = [];
        foreach ($related->all() as $category) {
            if ($category instanceof Category) {
                $title = trim((string)$category->title);
                if ($title !== '') {
                    $titles[] = $title;
                }
            }
        }

        return implode(', ', $titles);
    }

    /**
     * @return int[]
     */
    public function categoryIdsFromList(string $raw, string $groupHandle): array
    {
        $group = \Craft::$app->getCategories()->getGroupByHandle($groupHandle);
        if (!$group) {
            return [];
        }

        $ids = [];
        foreach ($this->splitList($raw) as $title) {
            $cacheKey = $groupHandle . ':' . mb_strtolower($title);
            if (isset($this->categoryIdsByKey[$cacheKey])) {
                $ids[] = $this->categoryIdsByKey[$cacheKey];
                continue;
            }

            $category = Category::find()
                ->groupId($group->id)
                ->title($title)
                ->status(null)
                ->one();

            if (!$category instanceof Category) {
                $category = new Category();
                $category->groupId = $group->id;
                $category->title = $title;
                $category->enabled = true;
                if (!\Craft::$app->getElements()->saveElement($category)) {
                    continue;
                }
            }

            $this->categoryIdsByKey[$cacheKey] = (int)$category->id;
            $ids[] = (int)$category->id;
        }

        return array_values(array_unique($ids));
    }

    /**
     * @return string[]
     */
    public function splitList(string $raw): array
    {
        $parts = preg_split('/\s*(?:,|;|\n)\s*/', $raw) ?: [];
        $out = [];
        foreach ($parts as $part) {
            $title = trim((string)$part);
            $normalized = strtolower($title);
            if ($title === '' || in_array($normalized, ['not found', 'unknown', 'n/a', 'na', 'none', 'null', '-'], true)) {
                continue;
            }
            if (mb_strlen($title) > 80) {
                continue;
            }
            $out[$normalized] = $title;
        }

        return array_values($out);
    }

    private function normalizeWebsiteUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }

        if (!preg_match('#^https?://#i', $url)) {
            $url = 'https://' . ltrim($url, '/');
        }

        return $url;
    }

    public function stampAvailabilityUpdatedAtIfChanged(Entry $location, ?bool $previousAvailability = null): void
    {
        $section = $location->getSection();
        if (!$section || $section->handle !== 'locations') {
            return;
        }

        $newAvailability = (bool)($location->getFieldValue('availability') ?? false);

        if ($previousAvailability === null && $location->id) {
            $existing = Entry::find()
                ->section('locations')
                ->id($location->id)
                ->status(null)
                ->one();

            if ($existing instanceof Entry) {
                $previousAvailability = (bool)($existing->getFieldValue('availability') ?? false);
            } else {
                $previousAvailability = $newAvailability;
            }
        } elseif ($previousAvailability === null) {
            $previousAvailability = false;
        }

        if ($previousAvailability === $newAvailability) {
            return;
        }

        $location->setFieldValue('availabilityUpdatedAt', DateTimeHelper::currentUTCDateTime());
    }
}
