/**
 * lib/secrets-scan.ts
 *
 * Scans raw HTML/JS content for inadvertently exposed sensitive tokens
 * using pattern matching.
 */

export interface SecretFinding {
    type: string;
    pattern: string; // Redacted version of the found secret
    description: string;
}

const SECRET_PATTERNS = [
    {
        type: "Google Cloud / Maps API Key",
        regex: /AIza[0-9A-Za-z-_]{35}/g,
        description:
            "Exposes Google API quotas, potentially leading to financial charges",
    },
    {
        type: "AWS Access Key ID",
        regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
        description:
            "AWS IAM Access Key, grants programmatic access to AWS resources",
    },
    {
        type: "Stripe Live Secret Key",
        regex: /sk_live_[0-9a-zA-Z]{24}/g,
        description:
            "Full access to Stripe account, allows processing payments and refunds",
    },
    {
        type: "Stripe Restricted Key",
        regex: /rk_live_[0-9a-zA-Z]{24}/g,
        description:
            "Restricted access to Stripe account, may allow viewing sensitive data",
    },
    {
        type: "Slack Bot/User Token",
        regex: /(xox[pboaq]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})/g,
        description:
            "Grants access to a Slack workspace, reading/writing messages",
    },
    {
        type: "Generic Bearer Token",
        // Looks for "Bearer " followed by a base64/JWT-like string
        regex: /Bearer\s+[A-Za-z0-9\-\._~\+\/]{20,}=*/g,
        description:
            "Authorization token, often grants session access to an API",
    },
];

export function scanForSecrets(content: string): SecretFinding[] {
    const findings: SecretFinding[] = [];

    if (!content) return findings;

    for (const { type, regex, description } of SECRET_PATTERNS) {
        const matches = content.match(regex);
        if (matches) {
            // Deduplicate matching strings
            const uniqueMatches = Array.from(new Set(matches));

            for (const match of uniqueMatches) {
                // Redact the key for safety (e.g. "AIzaSy...XYZ")
                const redacted =
                    match.substring(0, 10) +
                    "..." +
                    match.substring(match.length - 4);

                findings.push({
                    type,
                    pattern: redacted,
                    description,
                });
            }
        }
    }

    return findings;
}
