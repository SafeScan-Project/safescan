"use client";

import RegisterForm from "@/components/RegisterForm";

export default function StudentRegisterPage() {
    return (
        <div className="max-w-md mx-auto py-10">
            <h2 className="text-2xl font-bold mb-2">Student Registration</h2>
            <p className="text-sm text-gray-600 mb-6 font-medium">
                Use your school email to access student-only features.
            </p>
            <RegisterForm isStudent={true} />
        </div>
    );
}
