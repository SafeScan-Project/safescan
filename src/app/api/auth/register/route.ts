/**
 * This version gates registration behind an institutional
 * domain check using lib/school-email.ts.
 *
 * The allowed domains are configured via ALLOWED_EMAIL_DOMAINS in .env so
 * the app works for schools that don't use .edu (e.g. .ac.uk, .edu.au).
 * Set ALLOWED_EMAIL_DOMAINS="*" to disable the check in development.
 */

import { allowedDomainsDescription, isSchoolEmail } from "lib/school-email";
import { createUser, findUserByEmail } from "lib/user";
import { NextResponse } from "next/server";

interface RegisterBody {
    email?: string;
    password?: string;
}

export async function POST(request: Request) {
    try {
        const body: RegisterBody = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 },
            );
        }

        // Enforce institutional email requirement
        if (!isSchoolEmail(email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Registration requires an institutional email address (${allowedDomainsDescription()}).`,
                },
                { status: 400 },
            );
        }

        const existing = await findUserByEmail(email);
        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: "An account with that email already exists",
                },
                { status: 400 },
            );
        }

        await createUser(email, password);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("registration error", err);
        return NextResponse.json(
            { success: false, error: "Internal error" },
            { status: 500 },
        );
    }
}
