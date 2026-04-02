import { allowedDomainsDescription, isSchoolEmail } from "lib/school-email";
import { createUser, findUserByEmail } from "lib/user";
import { NextResponse } from "next/server";

interface RegisterBody {
    email?: string;
    password?: string;
    isStudent?: boolean;
}

export async function POST(request: Request) {
    try {
        const body: RegisterBody = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();
        const isStudent = body.isStudent;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 },
            );
        }

        if (isStudent && !isSchoolEmail(email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Must use a valid school email (${allowedDomainsDescription()})`,
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

        await createUser(email, password, isStudent ? "STUDENT" : "USER");
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("registration error", err);
        return NextResponse.json(
            { success: false, error: "Internal error" },
            { status: 500 },
        );
    }
}
