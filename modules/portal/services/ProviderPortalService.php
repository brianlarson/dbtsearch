<?php

namespace modules\portal\services;

use craft\base\Component;
use craft\elements\Entry;
use craft\elements\User;
use craft\helpers\DateTimeHelper;

class ProviderPortalService extends Component
{
    public const PROVIDER_GROUP_HANDLES = ['provider', 'providerEditors'];

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
            'phone' => (string)($provider->getFieldValue('phone') ?? ''),
            'email' => (string)($provider->getFieldValue('email') ?? ''),
            'website' => (string)($provider->getFieldValue('website') ?? ''),
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

        if (array_key_exists('phone', $data)) {
            $fieldValues['phone'] = trim((string)$data['phone']);
        }
        if (array_key_exists('email', $data)) {
            $fieldValues['email'] = trim((string)$data['email']);
        }
        if (array_key_exists('website', $data)) {
            $fieldValues['website'] = trim((string)$data['website']);
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

            $fieldValues = [
                'availability' => !empty($locationData['availability']),
                'dbtaCertified' => !empty($locationData['dbtaCertified']),
            ];

            if ($saveDetails) {
                $address = trim((string)($locationData['address'] ?? ''));
                if ($address !== '') {
                    $location->title = $address;
                }

                foreach (['city', 'state', 'zip'] as $handle) {
                    if (array_key_exists($handle, $locationData)) {
                        $fieldValues[$handle] = trim((string)$locationData[$handle]);
                    }
                }
            }

            $location->setFieldValues($fieldValues);

            if (!\Craft::$app->getElements()->saveElement($location)) {
                $errors = array_merge($errors, $location->getErrorSummary(true));
            }
        }

        return $errors;
    }
}
