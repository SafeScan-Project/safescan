/**
 * lib/school-email.ts
 *
 * Validates that an email address belongs to an allowed institutional domain.
 *
 * Configuration (in .env):
 *
 *   ALLOWED_EMAIL_DOMAINS=".edu,.ac.uk,myuniversity.edu,college.ca,fanshaweonline.ca"
 *
 * Each entry is either:
 *   - A TLD suffix   — ".edu"   matches any address ending in ".edu"
 *   - An exact domain — "mit.edu" matches only @mit.edu
 *
 * If the env var is not set, the default behaviour is to accept ".edu" only.
 * Set ALLOWED_EMAIL_DOMAINS="*" to disable domain restriction entirely (dev/test).
 */

/** Parse and cache the domain rules from the environment. */
function loadAllowedDomains(): string[] {
    const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? ".edu";
    return raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Returns true when the email's domain satisfies at least one rule.
 * Throws nothing — callers check the return value.
 */
export function isSchoolEmail(email: string): boolean {
    const rules = loadAllowedDomains();

    // Wildcard — all addresses accepted (useful in development)
    if (rules.includes("*")) return true;

    const lower = email.toLowerCase();
    const atIdx = lower.lastIndexOf("@");
    if (atIdx === -1) return false;

    const domain = lower.slice(atIdx + 1); // e.g. "student.mit.edu"

    return rules.some((rule) => {
        if (rule.startsWith(".")) {
            // TLD suffix match — domain must end with the rule
            // ".edu" matches "mit.edu" and "student.example.edu" but not "edu.com"
            return domain === rule.slice(1) || domain.endsWith(rule);
        }
        // Exact domain match
        return domain === rule;
    });
}

/** Human-readable description of the current domain policy (for error messages). */
export function allowedDomainsDescription(): string {
    const rules = loadAllowedDomains();
    if (rules.includes("*")) return "any email";
    return rules.join(", ");
}
