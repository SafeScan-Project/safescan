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
