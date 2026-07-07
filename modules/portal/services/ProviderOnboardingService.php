<?php

namespace modules\portal\services;

use Craft;
use craft\base\Component;
use craft\db\Query;
use craft\elements\Entry;
use craft\elements\User;
use verbb\formie\elements\Submission;

class ProviderOnboardingService extends Component
{
    public const SIGNUP_FORM_HANDLE = 'providerSignup';

    /**
     * @return int[]
     */
    public function getClaimedProviderIds(): array
    {
        $claimedIds = [];

        $providerField = Craft::$app->getFields()->getFieldByHandle('provider');
        if ($providerField) {
            $relationIds = (new Query())
                ->select(['targetId'])
                ->from(['{{%relations}}'])
                ->where([
                    'fieldId' => $providerField->id,
                    'sourceClass' => User::class,
                ])
                ->column();

            $claimedIds = array_merge($claimedIds, array_map('intval', $relationIds));
        }

        $authoredProviders = Entry::find()
            ->section('providers')
            ->authorId(['not', null])
            ->status(null)
            ->all();

        foreach ($authoredProviders as $provider) {
            $author = $provider->getAuthor();
            if (!$author instanceof User || $author->admin) {
                continue;
            }

            if ($author->isInGroup('provider') || $author->isInGroup('providerEditors')) {
                $claimedIds[] = (int)$provider->id;
            }
        }

        return array_values(array_unique(array_filter($claimedIds)));
    }

    /**
     * @return Entry[]
     */
    public function getUnclaimedProviders(): array
    {
        $claimedIds = $this->getClaimedProviderIds();
        $query = Entry::find()
            ->section('providers')
            ->orderBy('title ASC')
            ->status(null);

        if ($claimedIds !== []) {
            $query->andWhere(['not in', 'elements.id', $claimedIds]);
        }

        return $query->all();
    }

    public function isProviderClaimable(Entry $provider): bool
    {
        return !in_array((int)$provider->id, $this->getClaimedProviderIds(), true);
    }

    /**
     * @return array<string, string>
     */
    public function validateSignupSubmission(Submission $submission): array
    {
        $form = $submission->getForm();
        if (!$form || $form->handle !== self::SIGNUP_FORM_HANDLE) {
            return [];
        }

        $errors = [];

        $email = trim((string)$submission->getFieldValue('email'));
        if ($email === '') {
            $errors['email'] = 'Email is required.';
        } elseif (User::find()->email($email)->status(null)->exists()) {
            $errors['email'] = 'An account with this email already exists. Try logging in instead.';
        }

        $fullName = trim((string)$submission->getFieldValue('fullName'));
        if ($fullName === '') {
            $errors['fullName'] = 'Your name is required.';
        }

        $provider = $this->resolveProviderFromSubmission($submission);
        if (!$provider) {
            $errors['providerListing'] = 'Please select your practice listing.';
        } elseif (!$this->isProviderClaimable($provider)) {
            $errors['providerListing'] = 'That listing already has a manager account. Contact support if you need access.';
        }

        $password = $this->getRawPasswordFromRequest('password');
        $confirmPassword = $this->getRawPasswordFromRequest('confirmPassword');

        if ($password === null || $password === '') {
            $errors['password'] = 'Password is required.';
        } elseif (strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters.';
        }

        if ($confirmPassword === null || $confirmPassword === '') {
            $errors['confirmPassword'] = 'Please confirm your password.';
        } elseif ($password !== $confirmPassword) {
            $errors['confirmPassword'] = 'Passwords do not match.';
        }

        return $errors;
    }

    public function provisionUserFromSubmission(Submission $submission): User
    {
        $email = trim((string)$submission->getFieldValue('email'));
        $fullName = trim((string)$submission->getFieldValue('fullName'));
        $provider = $this->resolveProviderFromSubmission($submission);
        $password = $this->getRawPasswordFromRequest('password');

        if (!$provider instanceof Entry) {
            throw new \RuntimeException('Provider listing could not be resolved.');
        }

        if ($password === null || $password === '') {
            throw new \RuntimeException('Password was not submitted.');
        }

        if (!$this->isProviderClaimable($provider)) {
            throw new \RuntimeException('Provider listing is no longer available to claim.');
        }

        return $this->createProviderUser($email, $fullName, $password, $provider);
    }

    public function createProviderUser(string $email, string $fullName, string $password, Entry $provider): User
    {
        $email = trim($email);
        $fullName = trim($fullName);

        $user = new User();
        $user->username = $email;
        $user->email = $email;
        $user->fullName = $fullName;
        $user->newPassword = $password;
        $user->active = true;

        if (!Craft::$app->getElements()->saveElement($user)) {
            throw new \RuntimeException('Could not create user: ' . json_encode($user->getErrors()));
        }

        $user->setFieldValue('provider', [$provider->id]);
        if (!Craft::$app->getElements()->saveElement($user)) {
            throw new \RuntimeException('Could not link provider listing: ' . json_encode($user->getErrors()));
        }

        $provider->authorId = $user->id;
        if (!Craft::$app->getElements()->saveElement($provider)) {
            throw new \RuntimeException('Could not assign listing author: ' . json_encode($provider->getErrors()));
        }

        $group = Craft::$app->getUserGroups()->getGroupByHandle('provider');
        if ($group && !$user->isInGroup($group)) {
            Craft::$app->getUsers()->assignUserToGroups($user->id, [$group->id]);
        }

        return $user;
    }

    public function resolveProviderFromSubmission(Submission $submission): ?Entry
    {
        $providerId = $this->resolveProviderId($submission->getFieldValue('providerListing'));
        if (!$providerId) {
            return null;
        }

        $provider = Entry::find()
            ->section('providers')
            ->id($providerId)
            ->status(null)
            ->one();

        return $provider instanceof Entry ? $provider : null;
    }

    private function resolveProviderId(mixed $value): ?int
    {
        if ($value instanceof Entry) {
            return (int)$value->id;
        }

        if (is_object($value) && method_exists($value, 'one')) {
            $one = $value->one();
            if ($one instanceof Entry) {
                return (int)$one->id;
            }
        }

        if (is_numeric($value)) {
            return (int)$value;
        }

        if (is_array($value)) {
            if (isset($value['id']) && is_numeric($value['id'])) {
                return (int)$value['id'];
            }

            $first = reset($value);
            if (is_numeric($first)) {
                return (int)$first;
            }
        }

        return null;
    }

    private function getRawPasswordFromRequest(string $handle): ?string
    {
        $fields = Craft::$app->getRequest()->getBodyParam('fields');
        if (!is_array($fields) || !array_key_exists($handle, $fields)) {
            return null;
        }

        $value = $fields[$handle];
        if (!is_string($value)) {
            return null;
        }

        return $value;
    }
}
