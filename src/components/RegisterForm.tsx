"use client";

import { useState } from "react";
import zxcvbn from "zxcvbn";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface RegisterFormProps {
    isStudent?: boolean;
}

export default function RegisterForm({ isStudent = false }: RegisterFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordScore, setPasswordScore] = useState(0);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
        if (!passwordRegex.test(password)) {
            setError(
                "Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
            );
            return;
        }

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, isStudent }), // Passed to API
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Registration failed");
        } else {
            const loginRes = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });
            if (loginRes?.error) {
                setError("Account created, but failed to log in");
            } else {
                router.push("/");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                    isStudent
                        ? "your-school-email@college.ca"
                        : "example@email.com"
                }
                className="w-full border rounded px-3 py-2 text-black dark:text-white"
                required
            />

            <div className="register-password-group relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordScore(zxcvbn(e.target.value).score);
                    }}
                    placeholder="Password"
                    className="w-full border rounded px-3 py-2 pr-10 text-black dark:text-white"
                    required
                />
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((v) => !v)}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            {password.length > 0 && (
                <div className="h-2 w-full rounded bg-gray-200 mt-2">
                    <div
                        className={`h-2 rounded transition-all duration-300 ${
                            passwordScore < 2
                                ? "bg-red-500"
                                : passwordScore < 4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                        }`}
                        style={{ width: `${(passwordScore + 1) * 20}%` }}
                    />
                </div>
            )}

            <div className="register-confirm-group relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full border rounded px-3 py-2 pr-10 text-black dark:text-white"
                    required
                />
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {isStudent ? "Register as Student" : "Create Account"}
            </button>
            {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
        </form>
    );
}
