/**
 * lib/dir-scan.ts
 *
 * Probes a set of well-known sensitive paths on a target origin and reports
 * which ones appear to be accessible.
 *
 * Severity levels:
 *   CRITICAL — paths that almost always indicate a serious misconfiguration
 *              (e.g. exposed .git, .env, database dumps)
 *   HIGH     — admin panels, backup files, common CMS dashboards
 *   MEDIUM   — dev tooling, configuration files that may contain sensitive data
 *
 * A path is considered "exposed" when the server returns 200 or 403.
 *   200 = readable
 *   403 = exists but access-controlled (still a finding — confirms path presence)
 *   Anything else (301, 404, 5xx, timeout) = not flagged
 */

export type DirSeverity = "CRITICAL" | "HIGH" | "MEDIUM";

export interface DirProbe {
    path: string;
    severity: DirSeverity;
    description: string;
}

export interface ExposedDir extends DirProbe {
    status: number; // HTTP status returned
}

// ---------------------------------------------------------------------------
// Probe list — ordered from highest to lowest severity
// Keep this list focused on paths with real security impact.
// ---------------------------------------------------------------------------

export const DIR_PROBES: DirProbe[] = [
    // CRITICAL
    {
        path: "/.git/HEAD",
        severity: "CRITICAL",
        description: "Git repository exposed — source code may be downloadable",
    },
    {
        path: "/.env",
        severity: "CRITICAL",
        description: "Environment file — may contain credentials and API keys",
    },
    {
        path: "/.env.local",
        severity: "CRITICAL",
        description: "Local environment file — may contain credentials",
    },
    {
        path: "/config.php",
        severity: "CRITICAL",
        description: "PHP config file — may contain database credentials",
    },
    {
        path: "/wp-config.php",
        severity: "CRITICAL",
        description: "WordPress config — contains database credentials",
    },
    {
        path: "/database.sql",
        severity: "CRITICAL",
        description: "Possible database dump accessible over HTTP",
    },
    {
        path: "/backup.sql",
        severity: "CRITICAL",
        description: "Possible database backup accessible over HTTP",
    },
    {
        path: "/dump.sql",
        severity: "CRITICAL",
        description: "Possible database dump accessible over HTTP",
    },

    // HIGH
    {
        path: "/admin",
        severity: "HIGH",
        description: "Admin panel — should not be publicly reachable",
    },
    {
        path: "/admin/",
        severity: "HIGH",
        description: "Admin panel directory listing",
    },
    {
        path: "/administrator",
        severity: "HIGH",
        description: "Administrator panel (Joomla default)",
    },
    {
        path: "/wp-admin/",
        severity: "HIGH",
        description: "WordPress admin panel",
    },
    {
        path: "/phpmyadmin/",
        severity: "HIGH",
        description: "phpMyAdmin database interface exposed",
    },
    {
        path: "/server-status",
        severity: "HIGH",
        description:
            "Apache server status page — reveals configuration details",
    },
    {
        path: "/elmah.axd",
        severity: "HIGH",
        description: "ELMAH error log — may contain sensitive application data",
    },

    // MEDIUM
    {
        path: "/.htaccess",
        severity: "MEDIUM",
        description: "Apache config file — reveals server configuration",
    },
    {
        path: "/web.config",
        severity: "MEDIUM",
        description: "IIS config file — reveals server configuration",
    },
    {
        path: "/phpinfo.php",
        severity: "MEDIUM",
        description: "PHP info page — exposes server environment details",
    },
    {
        path: "/info.php",
        severity: "MEDIUM",
        description: "PHP info page — exposes server environment details",
    },
    {
        path: "/readme.html",
        severity: "MEDIUM",
        description: "CMS readme — reveals software version",
    },
    {
        path: "/CHANGELOG.md",
        severity: "MEDIUM",
        description: "Changelog — reveals software version history",
    },
    {
        path: "/robots.txt",
        severity: "MEDIUM",
        description: "Robots file — may reveal hidden paths (informational)",
    },
];

// ---------------------------------------------------------------------------
// Probe runner
// ---------------------------------------------------------------------------

const PROBE_TIMEOUT_MS = 5_000;
// Concurrency cap — we don't want to hammer the target or get rate-limited
const CONCURRENCY = 4;

/**
 * Probe all known paths against `origin` and return those that appear exposed.
 *
 * `origin` should be a bare scheme+host, e.g. "https://example.com"
 */
export async function scanDirectories(origin: string): Promise<ExposedDir[]> {
    const exposed: ExposedDir[] = [];
    const probes = [...DIR_PROBES];

    // Process in batches of CONCURRENCY
    while (probes.length > 0) {
        const batch = probes.splice(0, CONCURRENCY);
        const results = await Promise.allSettled(
            batch.map((probe) => probeOne(origin, probe)),
        );

        for (const result of results) {
            if (result.status === "fulfilled" && result.value !== null) {
                exposed.push(result.value);
            }
            // Rejected (network error, timeout) — silently skip; don't penalise the
            // target for connection failures that may just be DNS or firewall behaviour
        }
    }

    return exposed;
}

async function probeOne(
    origin: string,
    probe: DirProbe,
): Promise<ExposedDir | null> {
    const url = `${origin}${probe.path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    try {
        const resp = await fetch(url, {
            method: "GET",
            signal: controller.signal,
            redirect: "manual", // don't follow redirects — a redirect to /login is not "exposed"
            headers: {
                // Identify as a security scanner so site owners can see this in their logs
                "User-Agent":
                    "SafeScan/1.0 (security scanner; educational use)",
            },
        });

        // 200 = exposed and readable; 403 = exists but forbidden (still a finding)
        if (resp.status === 200 || resp.status === 403) {
            return { ...probe, status: resp.status };
        }
        return null;
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}
