// User profile page for editing display name, profile picture, and bio
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProfileEditPage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState({
    displayName: "",
    profilePicture: "",
    bio: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (session?.user) {
      setForm({
        displayName: session.user.displayName || "",
        profilePicture: session.user.profilePicture || "",
        bio: session.user.bio || "",
      });
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("Profile updated!");
      await update({
        displayName: form.displayName,
        profilePicture: form.profilePicture,
        bio: form.bio,
      });
    } else {
      let errorMsg = "Failed to update profile.";
      try {
        const data = await res.json();
        if (data?.error) errorMsg += ` ${data.error}`;
        if (data?.details) errorMsg += ` (${data.details})`;
      } catch {}
      setStatus(errorMsg);
    }
  };

  return (
    <div className="profile-page max-w-lg mx-auto mt-10 p-6 border rounded bg-white dark:bg-zinc-900">
      <h1 className="profile-title text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="profile-form space-y-4">
        <div className="profile-field">
          <label className="profile-label block font-medium">Display Name</label>
          <input
            type="text"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            className="profile-display-name-input w-full border rounded px-3 py-2"
          />
        </div>

        <div className="profile-field">
          <label className="profile-label block font-medium">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append("file", file);
              setStatus("Uploading image...");

              const res = await fetch("/api/profile/upload-image", {
                method: "POST",
                body: formData,
              });

              if (res.ok) {
                const data = await res.json();
                setForm((f) => ({ ...f, profilePicture: data.url }));
                setStatus("Image uploaded!");
              } else {
                setStatus("Failed to upload image.");
              }
            }}
            className="profile-picture-input w-full border rounded px-3 py-2"
          />
          {form.profilePicture && (
            <div className="profile-picture-preview-wrap flex justify-center mt-2">
              <img
                src={form.profilePicture}
                alt="Profile Preview"
                className="profile-picture-preview w-24 h-24 rounded-full object-cover border"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}
        </div>

        <div className="profile-field">
          <label className="profile-label block font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="profile-bio-input w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="profile-submit-button bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>

      {status && <div className="profile-status mt-4 text-center">{status}</div>}
    </div>
  );
}
