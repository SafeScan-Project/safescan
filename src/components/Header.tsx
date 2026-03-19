'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  FaBook,
  FaHistory,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaUserPlus,
} from 'react-icons/fa';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="site-header bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="site-header-title text-xl font-bold">
        <Link href="/">SafeScan</Link>
      </h1>
      <nav className="site-header-nav flex items-center gap-4">
        <Link href="/resources" className="site-header-link site-header-link-resources inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded shadow hover:bg-gray-100 transition">
          <FaBook className="text-sky-500" aria-hidden />
          <span>Resources</span>
        </Link>
        {session?.user ? (
          <>
            <Link href="/profile" className="site-header-link site-header-link-profile inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded shadow hover:bg-gray-100 transition">
              <FaUser className="text-cyan-500" aria-hidden />
              <span>Profile</span>
            </Link>
            <Link href="/history" className="site-header-link site-header-link-history inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded shadow hover:bg-gray-100 transition">
              <FaHistory className="text-indigo-500" aria-hidden />
              <span>History</span>
            </Link>
            <Link href="/profile" className="site-header-avatar-link inline-block ml-2">
              <span className="site-header-avatar-wrap" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {session.user.profilePicture ? (
                  <img
                    src={session.user.profilePicture}
                    alt="Profile"
                    className="site-header-avatar-image w-8 h-8 rounded-full object-contain border bg-white"
                    style={{ minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32, display: 'block' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <span className="site-header-avatar-fallback w-8 h-8 rounded-full bg-gray-300 border block" />
                )}
              </span>
            </Link>
            <span
              className="site-header-user-label text-sm font-medium ml-2 cursor-pointer"
              title={session.user.email}
            >
              {session.user.displayName || session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="site-header-signout-button inline-flex items-center gap-2 underline ml-4"
            >
              <FaSignOutAlt className="text-yellow-200" aria-hidden />
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="site-header-link site-header-link-login inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded shadow hover:bg-gray-100 transition">
              <FaSignInAlt className="text-emerald-500" aria-hidden />
              <span>Log in</span>
            </Link>
            <Link href="/register" className="site-header-link site-header-link-register inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded shadow hover:bg-gray-100 transition">
              <FaUserPlus className="text-fuchsia-500" aria-hidden />
              <span>Sign up</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
