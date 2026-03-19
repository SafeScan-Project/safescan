"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ProfileUser = {
  email?: string | null;
  displayName?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.ok && data?.user) {
          setUser(data.user);
        } else if (session?.user) {
          setUser(session.user);
        }
      })
      .catch(() => {
        if (mounted && session?.user) {
          setUser(session.user);
        }
      });

    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <div className="profile-view-page max-w-lg mx-auto mt-10 p-6 border rounded bg-white dark:bg-zinc-900">
      <h1 className="profile-view-title text-2xl font-bold mb-4">Profile</h1>

      {user?.profilePicture && (
        <div className="profile-view-avatar-wrap flex justify-center mb-4">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="profile-view-avatar w-36 h-36 rounded-full object-cover border"
          />
        </div>
      )}

      <div className="profile-view-row mb-2">
        <span className="profile-view-label font-medium">Display Name: </span>
        <span className="profile-view-value">
          {user?.displayName || (
            <span className="profile-view-empty text-gray-500">Not set</span>
          )}
        </span>
      </div>

      <div className="profile-view-row mb-2">
        <span className="profile-view-label font-medium">Email: </span>
        <span className="profile-view-value">{user?.email}</span>
      </div>

      <div className="profile-view-row mb-4">
        <span className="profile-view-label font-medium">Bio: </span>
        <span className="profile-view-value">
          {user?.bio || (
            <span className="profile-view-empty text-gray-500">Not set</span>
          )}
        </span>
      </div>

      <Link
        href="/profile/edit"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Edit Profile
      </Link>
    </div>
  );
}
