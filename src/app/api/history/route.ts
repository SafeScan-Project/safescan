import { prisma } from "lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);

    // The JWT callback always sets session.user.id — if it's missing the token
    // is malformed and we treat it as unauthenticated.
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 },
        );
    }

    const scans = await prisma.scan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            url: true,
            result: true,
            createdAt: true,
            notes: true,
        },
    });

    return NextResponse.json({ scans });
}
