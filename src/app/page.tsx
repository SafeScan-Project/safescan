/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

"use client";

import { useState } from "react";
import type { ScanResult } from "@/app/api/scan/route";
import type { ExposedDir } from "lib/dir-scan";

type SummaryLevel = "pass" | "warning" | "issue";

interface SummaryItem {
    icon: string;
    text: string;
    level: SummaryLevel;
    detail: string;
}

const HEADER_EXPLANATIONS: Record<string, string> = {
    "Uses HTTPS":
        "HTTPS encrypts data between your browser and the website, protecting your information from attackers.",
    "Missing HTTPS":
        "This site does not use HTTPS. Information you send or receive could be intercepted by others.",
    "CSP header present":
        "Content Security Policy (CSP) helps prevent malicious scripts from running on the site.",
    "CSP header missing":
        "No Content Security Policy header found. This makes it easier for attackers to inject malicious scripts.",
    "HSTS header present":
        "HTTP Strict Transport Security (HSTS) forces browsers to use secure connections only.",
    "HSTS header missing":
        "No HSTS header found. Browsers may connect over insecure HTTP.",
    "X-Frame-Options present":
        "X-Frame-Options protects against clickjacking by preventing the site from being embedded elsewhere.",
    "X-Frame-Options missing":
        "No X-Frame-Options header. The site could be embedded in another page for clickjacking attacks.",
};

const SEVERITY_LABEL: Record<string, string> = {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
};

const SEVERITY_COLOR: Record<string, string> = {
    CRITICAL: "text-red-800 bg-red-100 border-red-300",
    HIGH: "text-orange-800 bg-orange-100 border-orange-300",
    MEDIUM: "text-yellow-800 bg-yellow-100 border-yellow-300",
};

const STATUS_LABEL: Record<number, string> = {
    200: "Accessible (HTTP 200)",
    403: "Exists, access restricted (HTTP 403)",
};

export default function Home() {
    const [url, setUrl] = useState("");
    const [scanDirs, setScanDirs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [showRawHeaders, setShowRawHeaders] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setSummary([]);

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url.trim());
        } catch {
            setError("Please enter a valid URL (e.g. https://example.com)");
            return;
        }
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            setError("URL must start with http:// or https://");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, scanDirs }),
            });
            const data: ScanResult = await res.json();
            if (!res.ok || !data.success) {
                setError((data as any).error || "Scan failed");
            } else {
                setResult(data);
                setSummary(buildSummary(data));
            }
        } catch (err: any) {
            setError(err.message || "Network error");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
                Enter a website URL to scan
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={scanDirs}
                        onChange={(e) => setScanDirs(e.target.checked)}
                        className="accent-blue-600"
                    />
                    <span>
                        Also scan for exposed directories and sensitive files
                        <span className="ml-1 text-gray-400">
                            (adds ~10–20 s)
                        </span>
                    </span>
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Scanning…" : "Scan"}
                </button>
            </form>

            {/* Summary bar */}
            {summary.length > 0 && (
                <div className="mt-4 flex space-x-4 text-sm bg-gray-100 p-2 rounded">
                    <span className="text-green-800">
                        🟢 {summary.filter((s) => s.level === "pass").length}{" "}
                        pass
                    </span>
                    <span className="text-yellow-800">
                        🟡 {summary.filter((s) => s.level === "warning").length}{" "}
                        warning
                    </span>
                    <span className="text-red-800">
                        🔴 {summary.filter((s) => s.level === "issue").length}{" "}
                        issue
                    </span>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mt-6 flex items-center space-x-2 text-blue-600">
                    <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    <span>
                        {scanDirs
                            ? "Scanning headers and checking directories…"
                            : "Scanning…"}
                    </span>
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-4">
                    {/* Header checks */}
                    <div className="p-4 bg-white border rounded">
                        <h3 className="text-lg font-bold text-black mb-3">
                            Security headers
                        </h3>
                        <ul className="space-y-2">
                            {summary.map((item, idx) => (
                                <li
                                    key={idx}
                                    className={`text-sm ${
                                        item.level === "pass"
                                            ? "text-green-800"
                                            : item.level === "warning"
                                              ? "text-yellow-800"
                                              : "text-red-800"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{item.icon}</span>
                                        <span className="font-medium">
                                            {item.text}
                                        </span>
                                    </div>
                                    <p className="ml-6 text-xs text-gray-600 italic mt-0.5">
                                        {item.detail}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            onClick={() => setShowRawHeaders((v) => !v)}
                            className="mt-4 text-blue-600 underline text-sm"
                        >
                            {showRawHeaders
                                ? "Hide raw headers"
                                : "Show raw headers"}
                        </button>

                        {showRawHeaders && (
                            <div className="mt-2 space-y-1 text-black text-sm">
                                {Object.entries(result.headers).map(
                                    ([k, v]) => (
                                        <div
                                            key={k}
                                            className="flex flex-wrap items-start"
                                        >
                                            <code className="font-mono text-xs bg-gray-100 px-1 rounded mr-2">
                                                {k}
                                            </code>
                                            <span className="text-xs break-words">
                                                {v}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {/* Directory scan results */}
                    {scanDirs && (
                        <div className="p-4 bg-white border rounded">
                            <h3 className="text-lg font-bold text-black mb-1">
                                Exposed directories and files
                            </h3>
                            {result.exposedDirs.length === 0 ? (
                                <p className="text-sm text-green-800">
                                    ✅ No sensitive paths responded with HTTP
                                    200 or 403.
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm text-red-700 mb-3">
                                        ! {result.exposedDirs.length} sensitive{" "}
                                        {result.exposedDirs.length === 1
                                            ? "path"
                                            : "paths"}{" "}
                                        found. Review these and restrict access
                                        as soon as possible.
                                    </p>
                                    <ul className="space-y-3">
                                        {result.exposedDirs.map((dir, idx) => (
                                            <li
                                                key={idx}
                                                className={`text-sm border rounded p-3 ${SEVERITY_COLOR[dir.severity]}`}
                                            >
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${SEVERITY_COLOR[dir.severity]}`}
                                                    >
                                                        {
                                                            SEVERITY_LABEL[
                                                                dir.severity
                                                            ]
                                                        }
                                                    </span>
                                                    <code className="font-mono text-xs bg-white bg-opacity-60 px-1 rounded">
                                                        {dir.path}
                                                    </code>
                                                    <span className="text-xs opacity-75">
                                                        {STATUS_LABEL[
                                                            dir.status
                                                        ] ??
                                                            `HTTP ${dir.status}`}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs opacity-90">
                                                    {dir.description}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Build the header check summary from a ScanResult
// ---------------------------------------------------------------------------

function buildSummary(data: ScanResult): SummaryItem[] {
    const items: SummaryItem[] = [];
    const h = data.headers;

    if (data.https) {
        items.push({
            icon: "✅",
            text: "Uses HTTPS",
            level: "pass",
            detail: HEADER_EXPLANATIONS["Uses HTTPS"],
        });
    } else {
        items.push({
            icon: "❌",
            text: "Missing HTTPS",
            level: "issue",
            detail: HEADER_EXPLANATIONS["Missing HTTPS"],
        });
    }

    const checks: Array<[string, string, string, string]> = [
        [
            "content-security-policy",
            "🛡",
            "CSP header present",
            "CSP header missing",
        ],
        [
            "strict-transport-security",
            "🔒",
            "HSTS header present",
            "HSTS header missing",
        ],
        [
            "x-frame-options",
            "🖼",
            "X-Frame-Options present",
            "X-Frame-Options missing",
        ],
    ];

    for (const [key, icon, presentLabel, missingLabel] of checks) {
        if (key in h) {
            items.push({
                icon,
                text: presentLabel,
                level: "pass",
                detail: HEADER_EXPLANATIONS[presentLabel] ?? "",
            });
        } else {
            items.push({
                icon,
                text: missingLabel,
                level: "warning",
                detail: HEADER_EXPLANATIONS[missingLabel] ?? "",
            });
        }
    }

    return items;
}
