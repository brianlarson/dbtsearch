<?php

namespace modules\sync\support;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Fetches a provider website (homepage, linked contact-style pages, then common /contact paths)
 * and picks a plausible public contact email from mailto links and visible text.
 */
final class EmailHarvester
{
    public function __construct(
        private readonly Client $client,
    ) {
    }

    public function findBestEmail(string $siteUrl): ?string
    {
        $siteUrl = trim($siteUrl);
        if ($siteUrl === '') {
            return null;
        }

        $parts = parse_url($siteUrl);
        if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $siteHost = $this->normalizeHost($parts['host']);
        $root = $parts['scheme'] . '://' . $parts['host'];

        $html = $this->fetch($siteUrl);
        if ($html === null) {
            return null;
        }

        $found = $this->extractEmails($html, $siteHost);

        foreach ($this->discoverContactUrls($html, $siteUrl, $siteHost) as $contactUrl) {
            $sub = $this->fetch($contactUrl);
            if ($sub === null) {
                continue;
            }
            foreach ($this->extractEmails($sub, $siteHost) as $addr) {
                $found[] = $addr;
            }
            if (count($found) > 40) {
                break;
            }
        }

        if ($found === []) {
            foreach (['/contact', '/contact-us', '/contact_us', '/contactus', '/about/contact', '/about-us/contact'] as $path) {
                $sub = $this->fetch($root . $path);
                if ($sub === null) {
                    continue;
                }
                $found = $this->extractEmails($sub, $siteHost);
                if ($found !== []) {
                    break;
                }
            }
        }

        return $this->pickBest($found, $siteHost);
    }

    private function fetch(string $url): ?string
    {
        try {
            $response = $this->client->get($url, [
                'http_errors' => false,
            ]);
            if ($response->getStatusCode() !== 200) {
                return null;
            }
            $body = (string) $response->getBody();

            return $body === '' ? null : $body;
        } catch (GuzzleException) {
            return null;
        }
    }

    /**
     * @return list<string>
     */
    private function extractEmails(string $html, string $siteHost): array
    {
        $out = [];

        if (preg_match_all('/mailto:\s*([^?#"\s\'>]+)/i', $html, $m)) {
            foreach ($m[1] as $raw) {
                $addr = $this->normalizeEmailCandidate(urldecode($raw));
                if ($addr !== null) {
                    $out[] = $addr;
                }
            }
        }

        $stripped = preg_replace('#<script\b[^>]*>.*?</script>#is', '', $html) ?? '';
        $stripped = preg_replace('#<noscript\b[^>]*>.*?</noscript>#is', '', $stripped) ?? '';
        $stripped = preg_replace('#<style\b[^>]*>.*?</style>#is', '', $stripped) ?? '';
        $stripped = preg_replace('#<!--.*?-->#s', '', $stripped) ?? '';

        if (preg_match_all('/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/i', $stripped, $m2)) {
            foreach ($m2[0] as $raw) {
                $addr = $this->normalizeEmailCandidate($raw);
                if ($addr !== null) {
                    $out[] = $addr;
                }
            }
        }

        return $out;
    }

    private function normalizeEmailCandidate(string $raw): ?string
    {
        $raw = trim($raw);
        $raw = html_entity_decode($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if ($raw === '') {
            return null;
        }

        $addr = strtolower($raw);
        if (!filter_var($addr, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        if ($this->isJunkEmail($addr)) {
            return null;
        }

        return $addr;
    }

    private function isJunkEmail(string $email): bool
    {
        $fragments = [
            'noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster',
            'wix.com', 'wixpress.com', 'sentry.io', 'schema.org',
            '@facebook.', '@twitter.', '@linkedin.', '@instagram.',
            'example.com', 'yourdomain.com', 'domain.com', 'email.com',
        ];
        foreach ($fragments as $frag) {
            if (str_contains($email, $frag)) {
                return true;
            }
        }

        return (bool) preg_match('/\.(png|jpe?g|gif|webp|svg|css|js)@\w/i', $email);
    }

    /**
     * @return list<string>
     */
    private function discoverContactUrls(string $html, string $baseUrl, string $siteHost): array
    {
        if (!preg_match_all('/href\s*=\s*(["\'])(.*?)\1/i', $html, $matches, PREG_SET_ORDER)) {
            return [];
        }

        $urls = [];
        foreach ($matches as [, , $href]) {
            $href = trim($href);
            if ($href === '' || str_starts_with(strtolower($href), 'javascript:')) {
                continue;
            }
            if (preg_match('/\.(pdf|zip|jpe?g|png|gif|docx?)(\?|$)/i', $href)) {
                continue;
            }
            if (!preg_match('/contact|about|touch|reach|location|office|appoint|visit/i', $href)) {
                continue;
            }

            $resolved = $this->resolveUrl($baseUrl, $href);
            if ($resolved === null) {
                continue;
            }
            $p = parse_url($resolved);
            if (empty($p['host'])) {
                continue;
            }
            if ($this->normalizeHost($p['host']) !== $siteHost) {
                continue;
            }
            $urls[$resolved] = true;
            if (count($urls) >= 4) {
                break;
            }
        }

        return array_keys($urls);
    }

    private function resolveUrl(string $base, string $relative): ?string
    {
        $relative = trim($relative);
        if ($relative === '' || $relative === '#') {
            return null;
        }
        if (preg_match('#^https?://#i', $relative)) {
            return $relative;
        }
        $baseParts = parse_url($base);
        if (!$baseParts || empty($baseParts['scheme']) || empty($baseParts['host'])) {
            return null;
        }
        $scheme = $baseParts['scheme'];
        $host = $baseParts['host'];
        $root = $scheme . '://' . $host;

        if (str_starts_with($relative, '//')) {
            return $scheme . ':' . $relative;
        }
        if (str_starts_with($relative, '/')) {
            return $root . $relative;
        }

        $path = $baseParts['path'] ?? '/';
        $dir = \dirname($path);
        if ($dir === '.' || $dir === '\\') {
            $dir = '/';
        }
        $prefix = $root . ($dir === '/' ? '/' : rtrim($dir, '/') . '/');

        return $prefix . $relative;
    }

    private function normalizeHost(string $host): string
    {
        $host = strtolower($host);

        return preg_replace('/^www\./', '', $host) ?? $host;
    }

    private function hostMatchesEmailDomain(string $siteHost, string $email): bool
    {
        $at = strrchr($email, '@');
        if ($at === false) {
            return false;
        }
        $emailHost = $this->normalizeHost(substr($at, 1));

        if ($emailHost === $siteHost) {
            return true;
        }

        return str_ends_with($emailHost, '.' . $siteHost);
    }

    /**
     * @param list<string> $emails
     */
    private function pickBest(array $emails, string $siteHost): ?string
    {
        if ($emails === []) {
            return null;
        }

        $emails = array_values(array_unique(array_map('strtolower', $emails)));

        $scored = [];
        foreach ($emails as $email) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }
            $score = 0;
            if ($this->hostMatchesEmailDomain($siteHost, $email)) {
                $score += 20;
            }
            $local = strstr($email, '@', true) ?: '';
            foreach (['contact', 'info', 'office', 'hello', 'admin', 'support', 'care', 'appointments', 'frontdesk', 'reception'] as $p) {
                if (str_starts_with($local, $p)) {
                    $score += 8;
                    break;
                }
            }
            $scored[] = ['email' => $email, 'score' => $score];
        }

        if ($scored === []) {
            return null;
        }

        usort($scored, static fn (array $a, array $b) => $b['score'] <=> $a['score']);

        return $scored[0]['email'];
    }
}
