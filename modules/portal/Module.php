<?php

namespace modules\portal;

use Craft;
use craft\elements\Entry;
use craft\helpers\UrlHelper;
use yii\base\ModelEvent;
use modules\portal\services\ProviderOnboardingService;
use modules\portal\services\ProviderPortalService;
use verbb\formie\base\ElementField;
use verbb\formie\controllers\SubmissionsController;
use verbb\formie\elements\Submission;
use verbb\formie\events\ModifyElementFieldQueryEvent;
use verbb\formie\events\SubmissionEvent;
use verbb\formie\fields\Entries;
use verbb\formie\services\Submissions;
use yii\base\Event;
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
            'providerOnboarding' => ProviderOnboardingService::class,
        ]);

        $this->registerFormieEvents();
        $this->registerLocationAvailabilityEvents();
    }

    private function registerLocationAvailabilityEvents(): void
    {
        /** @var ProviderPortalService $portal */
        $portal = $this->get('providerPortal');

        Event::on(
            Entry::class,
            Entry::EVENT_BEFORE_SAVE,
            function (ModelEvent $event) use ($portal) {
                $entry = $event->sender;
                if (!$entry instanceof Entry) {
                    return;
                }

                $section = $entry->getSection();
                if (!$section || $section->handle !== 'locations' || !$entry->getIsCanonical()) {
                    return;
                }

                $portal->stampAvailabilityUpdatedAtIfChanged($entry);
            }
        );
    }

    private function registerFormieEvents(): void
    {
        if (!class_exists(SubmissionsController::class)) {
            return;
        }

        /** @var ProviderOnboardingService $onboarding */
        $onboarding = $this->get('providerOnboarding');

        Event::on(
            Entries::class,
            ElementField::EVENT_MODIFY_ELEMENT_QUERY,
            function (ModifyElementFieldQueryEvent $event) use ($onboarding) {
                $field = $event->field;
                if (!$field || $field->handle !== ProviderOnboardingService::PROVIDER_FIELD_HANDLE) {
                    return;
                }

                $unclaimedIds = array_map(
                    static fn ($entry) => (int)$entry->id,
                    $onboarding->getUnclaimedProviders()
                );

                if ($unclaimedIds === []) {
                    $event->query->id(false);
                    return;
                }

                $event->query->id($unclaimedIds);
            }
        );

        Event::on(
            SubmissionsController::class,
            SubmissionsController::EVENT_BEFORE_SUBMISSION_REQUEST,
            function (SubmissionEvent $event) use ($onboarding) {
                $submission = $event->submission;
                if (!$submission instanceof Submission) {
                    return;
                }

                $form = $event->form ?? $submission->getForm();
                if (!$form || $form->handle !== ProviderOnboardingService::SIGNUP_FORM_HANDLE) {
                    return;
                }

                if (($event->submitAction ?? 'submit') !== 'submit') {
                    return;
                }

                $onboarding->normalizeProviderFieldValue($submission);

                $errors = $onboarding->validateSignupSubmission($submission);
                if ($errors !== []) {
                    foreach ($errors as $handle => $message) {
                        $submission->addError($handle, $message);
                    }
                    $event->isValid = false;
                    return;
                }

                try {
                    $onboarding->provisionUserFromSubmission($submission);
                } catch (\Throwable $e) {
                    Craft::error('Provider signup provisioning failed: ' . $e->getMessage(), __METHOD__);
                    $submission->addError('email', 'We could not create your account. Please try again or contact support.');
                    $event->isValid = false;
                }
            }
        );

        Event::on(
            SubmissionsController::class,
            SubmissionsController::EVENT_AFTER_SUBMISSION_REQUEST,
            function (SubmissionEvent $event) use ($onboarding) {
                if (!$event->success) {
                    return;
                }

                $form = $event->form;
                if (!$form || $form->handle !== ProviderOnboardingService::SIGNUP_FORM_HANDLE) {
                    return;
                }

                $submission = $event->submission;
                if (!$submission instanceof Submission) {
                    return;
                }

                $provider = $onboarding->resolveProviderFromSubmission($submission);
                $user = $onboarding->loginUserFromSubmission($submission);

                if ($user) {
                    $notice = $provider
                        ? sprintf('Welcome! You can now manage %s.', $provider->title)
                        : 'Welcome! Your account is ready.';
                    Craft::$app->getSession()->setFlash('notice', $notice);
                    $form->settings->submitAction = 'redirect';
                    $event->redirectUrl = UrlHelper::siteUrl('manage');
                    return;
                }

                $form->settings->submitAction = 'redirect';

                $email = trim((string)$submission->getFieldValue('email'));
                Craft::warning('Provider signup succeeded but auto-login failed; redirecting to login.', __METHOD__);
                $event->redirectUrl = UrlHelper::siteUrl('manage/login', array_filter([
                    'registered' => '1',
                    'email' => $email !== '' ? $email : null,
                    'listing' => $provider ? $provider->title : null,
                ]));
            }
        );
    }
}
