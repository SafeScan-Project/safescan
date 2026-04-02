"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch current data to pre-fill the form
    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setDisplayName(data.user.displayName || "");
                    setBio(data.user.bio || "");
                }
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName, bio }),
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
                // Refresh session data to reflect changes globally
                await update();
                router.push("/profile");
            } else {
                setMessage("Failed to update profile.");
            }
        } catch (err) {
            setMessage("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 border rounded bg-white dark:bg-zinc-900">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-black dark:text-white"
                        placeholder="Your name"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-black dark:text-white h-32"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/profile")}
                        className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {message && (
                <p
                    className={`mt-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
