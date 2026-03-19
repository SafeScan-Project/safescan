import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(_req) {
        // Token is guaranteed present here because of the `authorized` callback below.
        // Add any extra per-route logic here if needed (role checks etc.)
        return NextResponse.next();
    },
    {
        callbacks: {
            // Return true only when the user has a valid JWT token.
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    },
);

// Apply only to the routes that require a session.
// The matcher runs before any page component renders, so there's never a flash.
export const config = {
    matcher: ["/history/:path*", "/profile/:path*"],
};
