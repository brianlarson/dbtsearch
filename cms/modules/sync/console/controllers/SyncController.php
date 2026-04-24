<?php

namespace modules\sync\console\controllers;

use Craft;
use craft\console\Controller;
use craft\elements\Entry;
use craft\fields\data\LinkData;
use craft\helpers\Console;
use GuzzleHttp\Client;
use modules\sync\support\EmailHarvester;
use yii\console\ExitCode;

class SyncController extends Controller
{
    /**
     * Sets each provider’s Locations field from Location entries whose Provider field points at that provider.
     *
     * Safe to re-run after each bulk import (new states, Feed Me runs, etc.). Day-to-day edits in
     * the control panel can stay manual; run this again if you only fixed relations on locations.
     */
    public function actionProviderLocations(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $saved = 0;
        $failed = 0;

        foreach ($providers as $provider) {
            $locationIds = Entry::find()
                ->section('locations')
                ->relatedTo([
                    'targetElement' => $provider,
                    'field' => 'provider',
                ])
                ->orderBy('title')
                ->ids();

            $provider->setFieldValue('locations', $locationIds);

            if (!Craft::$app->getElements()->saveElement($provider)) {
                $this->stderr(
                    'Could not save provider ' . $provider->id . ' (' . $provider->title . '): '
                    . json_encode($provider->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                    Console::FG_RED
                );
                $failed++;
                continue;
            }

            $saved++;
            $this->stdout(sprintf(
                "%s → %d location(s)\n",
                $provider->title,
                count($locationIds)
            ));
        }

        $this->stdout(sprintf(
            "\nFinished: %d provider(s) saved, %d error(s).\n",
            $saved,
            $failed
        ));

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    /**
     * Clears placeholder/invalid provider emails, then tries to discover a contact address from the Website URL
     * (homepage, contact-style links, common /contact paths).
     */
    public function actionRepairProviderEmails(): int
    {
        $providers = Entry::find()->section('providers')->all();

        if ($providers === []) {
            $this->stdout("No provider entries found.\n", Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $client = new Client([
            'timeout' => 12,
            'connect_timeout' => 8,
            'allow_redirects' => ['max' => 5],
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
                'Accept-Language' => 'en-US,en;q=0.9',
            ],
            'verify' => true,
        ]);
        $harvester = new EmailHarvester($client);

        $saved = 0;
        $failed = 0;
        $skippedOk = 0;

        foreach ($providers as $provider) {
            $current = trim((string) $provider->getFieldValue('email'));

            if ($this->providerEmailIsAcceptable($current)) {
                $skippedOk++;
                continue;
            }

            $provider->setFieldValue('email', null);

            $website = $provider->getFieldValue('website');
            $url = ($website instanceof LinkData && $website->getUrl() !== '') ? $website->getUrl() : null;

            $found = null;
            if ($url !== null) {
                $this->stdout("{$provider->title} ← {$url}\n");
                $found = $harvester->findBestEmail($url);
                if ($found !== null) {
                    $provider->setFieldValue('email', $found);
                    $this->stdout("  → {$found}\n", Console::FG_GREEN);
                } else {
                    $this->stdout("  → (no email found)\n", Console::FG_YELLOW);
                }
            } else {
                $this->stdout("{$provider->title} — no website URL; email cleared.\n", Console::FG_YELLOW);
            }

            if (!Craft::$app->getElements()->saveElement($provider)) {
                $this->stderr(
                    'Could not save provider ' . $provider->id . ' (' . $provider->title . '): '
                    . json_encode($provider->getErrors(), JSON_UNESCAPED_UNICODE) . PHP_EOL,
                    Console::FG_RED
                );
                $failed++;
                continue;
            }
            $saved++;
        }

        $this->stdout(sprintf(
            "\nDone: %d saved, %d skipped (already valid email), %d error(s).\n",
            $saved,
            $skippedOk,
            $failed
        ));

        return $failed > 0 ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    private function providerEmailIsAcceptable(string $email): bool
    {
        if ($email === '') {
            return false;
        }

        $lower = strtolower($email);
        $placeholders = ['not found', 'by email', 'n/a', 'na', 'unknown', 'none', 'tbd', '—', '-', 'email', 'no email'];
        if (in_array($lower, $placeholders, true)) {
            return false;
        }

        return filter_var($lower, FILTER_VALIDATE_EMAIL) !== false;
    }
}
