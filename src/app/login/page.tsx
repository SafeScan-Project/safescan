// Client-side login page for user authentication
"use client";

import { useState } from "react"; // React state management
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Password visibility icons
import { signIn } from "next-auth/react"; // NextAuth sign-in
import { useRouter } from "next/navigation"; // Next.js router

// Login form component
export default function LoginPage() {
    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // Handle form submission and authenticate user
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");

        // Attempt sign-in with credentials
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        // Handle authentication result
        if (res?.error) {
            setError(res.error);
        } else {
            router.push("/"); // Redirect on success
        }
    };

    // Render login form UI
    return (
        <div className="login-page max-w-md mx-auto dark:bg-zinc-900 dark:border-zinc-600">
            <h2 className="login-title text-2xl font-bold mb-4">Log in</h2>
            <form onSubmit={handleSubmit} className="login-form space-y-4">
                {/* Email input */}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="home-url-input w-full border rounded px-3 py-2
                         bg-white dark:bg-zinc-800
                         border-gray-300 dark:border-zinc-600
                         text-gray-900 dark:text-gray-100
                         placeholder:text-gray-400 dark:placeholder:text-zinc-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {/* Password input with visibility toggle */}
                <div className="login-password-group relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="home-url-input w-full border rounded px-3 py-2
                             bg-white dark:bg-zinc-800
                             border-gray-300 dark:border-zinc-600
                             text-gray-900 dark:text-gray-100
                             placeholder:text-gray-400 dark:placeholder:text-zinc-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        className="login-password-toggle absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {/* Submit button */}
                <button
                    type="submit"
                    className="login-submit-button w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    Log in
                </button>
            </form>
            {/* Password reset link */}
            <div className="login-forgot-wrap mt-2 text-right">
                <a
                    href="/reset-password"
                    className="login-forgot-link text-blue-600 underline text-sm"
                >
                    Forgot password?
                </a>
            </div>
            {/* Error message display */}
            {error && <p className="login-error mt-4 text-red-600">{error}</p>}
        </div>
    );
}
