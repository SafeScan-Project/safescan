# SafeScan

A beginner-friendly web application that makes it easy to scan website URLs for common security issues. The first iteration focuses on a simple, URL-based scanner with clear, actionable results.

## Vision

Provide a fast, simple way to scan website URLs and common web security issues in a clear, beginner-friendly format.

### Target groups

- College and university students learning web development
- Beginner developers testing personal or portfolio websites

### Needs

- Quickly check whether a website has common security issues
- Understand scan results without deep security knowledge
- Identify obvious problems before submitting or sharing a website
- Get clear, actionable feedback instead of technical reports

## Getting Started

First, run the development server:

```bash
npm run dev
# or
# yarn dev
# or
# pnpm dev
# or
# bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### API

The app exposes a simple POST endpoint at `/api/scan` that accepts a JSON body `{ "url": "https://..." }`.
It performs basic checks (HTTPS usage and response headers) and returns a JSON report.

An authentication system is now in place; students must register with a `.edu` email and password to scan.

- Registration: `POST /api/auth/register` (see `src/app/api/auth/register/route.ts`)
- Authentication is handled by [NextAuth](https://next-auth.js.org/) using the credentials provider.
- Protected pages redirect users to `/login`/`/register` and the header shows login state.

Feel free to peek at the auth-related files in `src/app/api/auth` and the UI components under `src/app/login`, `src/app/register`, and `src/components/Header.tsx`.

## Dependencies

```bash
npm install next-auth bcryptjs @prisma/client
npm install -D prisma
```

(These packages power authentication, password hashing, and the SQLite database via Prisma.)

### Database

A lightweight SQLite database is used for user accounts and scan history. The Prisma schema is defined in `prisma/schema.prisma`, and the connection string is set in `.env`.

To create or update the database schema run:

```bash
npx prisma db push
```

You can also inspect or migrate the schema using the Prisma CLI or Studio.

### Scan history (student feature)

Authenticated users have their scan results recorded automatically. After logging in you can view past submissions via the **History** link in the header. This keeps your previous URLs private and accessible only to you.

The registration form now accepts any valid email address (no longer limited to .edu domains).

The history page is implemented as a server component: it uses `getServerSession` on the server to lookup the current user and fetch their scans from the database. If the user is not signed in the page will redirect to `/login` before rendering. This approach eliminates client-side authentication glitches and keeps the page fast and secure. For programmatic access you can still call the `GET /api/history` endpoint directly.

Logout is available via the header button; once signed out you cannot access history until you sign in again.

## Next steps

- Add more student-only features and gate them behind the logged‑in state
- Expand the `/api/scan` handler with additional checks (security headers, open directories, etc.)
- Improve frontend result display with pass/warn/issue indicators
- Add input validation and nicer error handling

---

(Remaining boilerplate omitted.)
