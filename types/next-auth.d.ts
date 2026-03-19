/**
 * Adds `role` to the NextAuth User and Session type declarations.
 * Without this, TypeScript does not know session.user.role exists and
 * the admin export route would not compile.
 */

import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string | null;
    displayName?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      email?: string;
      name?: string | null;
      image?: string | null;
      role?: string | null;
      displayName?: string | null;
      profilePicture?: string | null;
      bio?: string | null;
    };
  }
}
