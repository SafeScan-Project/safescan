import { type ExposedDir, scanDirectories } from "lib/dir-scan";
import { prisma } from "lib/prisma";
import { assertSafeUrl } from "lib/ssrf-guard";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';

interface ScanRequest {
    url: string;
    /** Include directory exposure scan.  Off by default (adds latency). */
    scanDirs?: boolean;
}

export interface ScanResult {
    success: boolean;
    https: boolean;
    headers: Record<string, string>;
    exposedDirs: ExposedDir[];
    error?: string;
}

export async function POST(request: Request) {
    try {
        const body: ScanRequest = await request.json();
        const { url, scanDirs = false } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid URL" },
                { status: 400 },
            );
        }

        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: "Malformed URL" },
                { status: 400 },
            );
        }

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return NextResponse.json(
                {
                    success: false,
                    error: "URL must start with http:// or https://",
                },
                { status: 400 },
            );
        }

        // SSRF guard — rejects private/loopback/reserved IP ranges
        try {
            await assertSafeUrl(url);
        } catch (e: any) {
            return NextResponse.json(
                { success: false, error: e.message },
                { status: 400 },
            );
        }

        // ---- Header check (HEAD request) ----------------------------------------
        const controller = new AbortController();
        const headTimeout = setTimeout(() => controller.abort(), 8_000);
        let resp: Response;
        try {
            resp = await fetch(url, {
                method: "HEAD",
                signal: controller.signal,
            });
        } catch (e: any) {
            if (e.name === "AbortError") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Scan timed out. The site may be slow or unresponsive.",
                    },
                    { status: 504 },
                );
            }
            return NextResponse.json(
                { success: false, error: "Failed to fetch site." },
                { status: 502 },
            );
        } finally {
            clearTimeout(headTimeout);
        }

        const headers: Record<string, string> = {};
        resp.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });

        // ---- Directory scan (optional, user-initiated) --------------------------
        let exposedDirs: ExposedDir[] = [];
        if (scanDirs) {
            const origin = `${parsed.protocol}//${parsed.host}`;
            exposedDirs = await scanDirectories(origin);
        }

        const result: ScanResult = {
            success: true,
            https: parsed.protocol === "https:",
            headers,
            exposedDirs,
        };

        // Persist for authenticated users
        try {
            const session = await getServerSession(authOptions);
            if (session?.user?.id) {
                await prisma.scan.create({
                    data: {
                        url,
                        result: JSON.stringify(result),
                        userId: session.user.id as string,
                    },
                });
            }
        } catch (e) {
            console.error("failed to save scan history", e);
        }

        return NextResponse.json(result);
    } catch (err) {
        console.error("scan error", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
