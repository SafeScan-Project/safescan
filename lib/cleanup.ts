/**
 * lib/cleanup.ts
 *
 * Lightweight maintenance helpers.  Import and call opportunistically
 * from API routes that already touch the database — no background job
 * or cron required for a low-traffic app.
 */

import { prisma } from "./prisma";

/**
 * Delete all PasswordResetToken rows whose `expires` timestamp is in the past.
 * Runs async without awaiting so it never delays the caller.
 */
export function purgeExpiredResetTokens(): void {
    prisma.passwordResetToken
        .deleteMany({ where: { expires: { lt: new Date() } } })
        .catch((err) => console.warn("purgeExpiredResetTokens failed:", err));
}
