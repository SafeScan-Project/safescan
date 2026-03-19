import crypto from "node:crypto";
import { purgeExpiredResetTokens } from "lib/cleanup";
import { sendResetEmail } from "lib/email";
import { prisma } from "lib/prisma";
import { findUserByEmail } from "lib/user";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Opportunistically purge old tokens every time someone requests a reset.
    // Fire-and-forget — never blocks the response.
    purgeExpiredResetTokens();

    const user = await findUserByEmail(email);
    if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        await prisma.passwordResetToken.create({
            data: { userId: user.id, token, expires },
        });

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password/confirm?token=${token}`;
        await sendResetEmail(user.email, resetUrl);
    }

    // Always return ok — don't reveal whether the email exists
    return NextResponse.json({ ok: true });
}
