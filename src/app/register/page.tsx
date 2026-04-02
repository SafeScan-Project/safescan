"use client";

import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="max-w-md mx-auto py-10 text-black dark:text-white">
            <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
            <RegisterForm isStudent={false} />

            <div className="mt-6 text-center">
                <Link
                    href="/register/student"
                    className="inline-block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Student? Sign up here
                </Link>
            </div>
        </div>
    );
}
