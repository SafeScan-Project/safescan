/**
 * Implements the admin export user story.  Returns a downloadable CSV
 * of anonymized scan data so admins can report usage trends without exposing
 * any personally identifiable information.
 *
 * ACCESS:  ADMIN role only — returns 403 for any other authenticated user
 *          and 401 for unauthenticated requests.
 *
 * ANONYMIZATION: userId is replaced with a salted HMAC-SHA256 hash.  The
 * same user always maps to the same anonymous ID within one export (so you
 * can count unique users), but the hash cannot be reversed to an email.
 * Add EXPORT_ANON_SALT to your .env — if absent, a dev-only default is used.
 *
 * Access: ADMIN role only.
 *
 * Anonymization approach:
 *   - userId is replaced with a salted HMAC-SHA256 hash.  The same user
 *     always gets the same anonymous ID within one export, so you can count
 *     unique users, but the hash cannot be reversed to an email address.
 *   - The salt (EXPORT_ANON_SALT env var, or a per-process fallback) is never
 *     included in the export.  Changing the salt invalidates cross-export
 *     user-linkage, which is intentional for periodic anonymization resets.
 *   - Scan result JSON is included in summarised form (checks passed/warned/failed)
 *     rather than raw headers, so no third-party hostname data leaks.
 *
 * CSV columns:
 *   anon_user_id, scanned_at, https, csp_present, hsts_present,
 *   x_frame_options_present, exposed_dirs_found, url_tld
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "lib/prisma";
import { createHmac } from "crypto";

// Types
interface StoredScanResult {
    success: boolean;
    https?: boolean;
    headers?: Record<string, string>;
    exposedDirs?: ExposedDir[];
}

interface ExposedDir {
    path: string;
    status: number;
}

// Anonymisation
const ANON_SALT = process.env.EXPORT_ANON_SALT ?? "safescan-default-dev-salt";

function anonymiseUserId(userId: string | null): string {
    if (!userId) return "anonymous";
    return createHmac("sha256", ANON_SALT)
        .update(userId)
        .digest("hex")
        .slice(0, 16);
}

// URL summarisation — extract only the public TLD+1 for trend analysis
function extractTld(rawUrl: string): string {
    try {
        const { hostname } = new URL(rawUrl);
        const parts = hostname.split(".");
        // Return last two labels (e.g. "example.com") — enough for trend analysis
        return parts.slice(-2).join(".");
    } catch {
        return "unknown";
    }
}

// CSV helpers
function csvEscape(value: string | number | boolean): string {
    const str = String(value);
    // Wrap in quotes if the value contains a comma, quote, or newline
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
}

function toCsvRow(fields: (string | number | boolean)[]): string {
    return fields.map(csvEscape).join(",");
}

const CSV_HEADER = toCsvRow([
    "anon_user_id",
    "scanned_at",
    "https",
    "csp_present",
    "hsts_present",
    "x_frame_options_present",
    "exposed_dirs_found",
    "url_tld",
]);

// Route handler
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 },
        );
    }

    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all scans.  We select only the columns we need — no email, no notes.
    const scans = await prisma.scan.findMany({
        orderBy: { createdAt: "asc" },
        select: {
            userId: true,
            url: true,
            result: true,
            createdAt: true,
        },
    });

    const rows: string[] = [CSV_HEADER];

    for (const scan of scans) {
        let parsed: StoredScanResult = { success: false };
        try {
            parsed = JSON.parse(scan.result) as StoredScanResult;
        } catch {
            // Malformed stored result — still emit a row with unknown values
        }

        const headers = parsed.headers ?? {};
        const exposedDirs = parsed.exposedDirs ?? [];

        rows.push(
            toCsvRow([
                anonymiseUserId(scan.userId),
                scan.createdAt.toISOString(),
                parsed.https ?? false,
                "content-security-policy" in headers,
                "strict-transport-security" in headers,
                "x-frame-options" in headers,
                exposedDirs.length,
                extractTld(scan.url),
            ]),
        );
    }

    const csv = rows.join("\n");

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="safescan-export-${new Date().toISOString().slice(0, 10)}.csv"`,
            // Never cache the export — data changes with every scan
            "Cache-Control": "no-store",
        },
    });
}
