/**
 * Updated to carry the new `role` field through the JWT and into
 * session.user.  Previously the session only held id, email, and profile
 * fields — without role, the admin export route could not check access.
 * Also removed the now-unused isStudent flag from the token.
 */
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail } from "../../../../../lib/user";
import bcrypt from "bcryptjs";
import NextAuth, { SessionStrategy } from "next-auth";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(
                credentials: Record<"email" | "password", string> | undefined,
                _req: any,
            ) {
                if (!credentials?.email || !credentials.password) return null;

                const user = await findUserByEmail(
                    credentials.email.toLowerCase(),
                );
                if (!user) return null;

                const valid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash,
                );
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    displayName: user.displayName,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                };
            },
        }),
    ],
    session: { strategy: "jwt" as SessionStrategy },
    callbacks: {
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role ?? "USER";
                token.displayName = user.displayName ?? null;
                token.profilePicture = user.profilePicture ?? null;
                token.bio = user.bio ?? null;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            session.user = {
                id: token.id,
                email: token.email,
                role: token.role ?? "USER",
                displayName: token.displayName ?? null,
                profilePicture: token.profilePicture ?? null,
                bio: token.bio ?? null,
            };
            return session;
        },
    },
    pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
