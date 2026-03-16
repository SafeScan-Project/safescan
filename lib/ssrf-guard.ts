/**
 * lib/ssrf-guard.ts
 *
 * Resolves a hostname and throws if it resolves to a private, loopback,
 * link-local, or multicast address.  Call this before any server-side
 * fetch of user-supplied URLs.
 *
 * Covered ranges:
 *   Loopback    127.0.0.0/8, ::1
 *   Private     10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
 *   Link-local  169.254.0.0/16, fe80::/10
 *   Multicast   224.0.0.0/4, ff00::/8
 *   Unspecified 0.0.0.0, ::
 */

import { promises as dns } from "dns";

type CidrV4 = [number, number]; // [network_as_uint32, mask_as_uint32]

const BLOCKED_V4: CidrV4[] = [
    [ipToInt("127.0.0.0"), mask(8)], // loopback
    [ipToInt("10.0.0.0"), mask(8)], // private
    [ipToInt("172.16.0.0"), mask(12)], // private
    [ipToInt("192.168.0.0"), mask(16)], // private
    [ipToInt("169.254.0.0"), mask(16)], // link-local (AWS metadata etc)
    [ipToInt("224.0.0.0"), mask(4)], // multicast
    [ipToInt("0.0.0.0"), mask(32)], // unspecified
];

function ipToInt(ip: string): number {
    return (
        ip
            .split(".")
            .reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0
    );
}

function mask(bits: number): number {
    return bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
}

function isBlockedV4(ip: string): boolean {
    let n: number;
    try {
        n = ipToInt(ip);
    } catch {
        return true; // if we can't parse it, block it
    }
    return BLOCKED_V4.some(([net, m]) => (n & m) === (net & m));
}

function isBlockedV6(ip: string): boolean {
    const l = ip.toLowerCase().replace(/^\[|\]$/g, "");
    // Loopback, link-local, multicast, unique-local, unspecified
    return (
        l === "::1" ||
        l === "::" ||
        l.startsWith("fe80") ||
        l.startsWith("ff") ||
        l.startsWith("fc") ||
        l.startsWith("fd")
    );
}

export async function assertSafeUrl(rawUrl: string): Promise<void> {
    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error("Malformed URL");
    }

    const hostname = parsed.hostname;

    // Block numeric IPv4 literals directly
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        if (isBlockedV4(hostname)) {
            throw new Error(
                "Requests to private or reserved addresses are not allowed",
            );
        }
        return;
    }

    // Block IPv6 literals
    if (hostname.startsWith("[") || hostname.includes(":")) {
        if (isBlockedV6(hostname)) {
            throw new Error(
                "Requests to private or reserved addresses are not allowed",
            );
        }
        return;
    }

    // Resolve hostname to IP(s) and check each one
    let addresses: string[];
    try {
        const results = await dns.resolve(hostname);
        addresses = results;
    } catch {
        // If DNS fails, also try resolve4 / resolve6
        try {
            addresses = await dns.resolve4(hostname);
        } catch {
            throw new Error(`Could not resolve hostname: ${hostname}`);
        }
    }

    for (const addr of addresses) {
        if (addr.includes(":")) {
            if (isBlockedV6(addr)) {
                throw new Error(
                    "Requests to private or reserved addresses are not allowed",
                );
            }
        } else {
            if (isBlockedV4(addr)) {
                throw new Error(
                    "Requests to private or reserved addresses are not allowed",
                );
            }
        }
    }
}
