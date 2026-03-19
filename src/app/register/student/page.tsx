'use client';

import { useState } from 'react';
import zxcvbn from 'zxcvbn';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function StudentRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
    if (!passwordRegex.test(password)) {
      setError('Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }

    const res = await fetch('/api/auth/register/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    const loginRes = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (loginRes?.error) {
      setError('Account created, but failed to log in: ' + loginRes.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="student-register-page max-w-md mx-auto">
      <h2 className="student-register-title text-2xl font-bold mb-4">Student sign up</h2>
      <p className="student-register-subtitle mb-4 text-sm text-gray-600">Use your school email address (for example, .edu) to create a student account.</p>
      <form onSubmit={handleSubmit} className="student-register-form space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@school.edu"
          className="student-register-email-input w-full border rounded px-3 py-2"
          required
        />

        <div className="student-register-password-rules mb-2 text-xs text-gray-600">
          Password must have at least:
          <ul className="list-disc ml-5">
            <li>1 uppercase letter</li>
            <li>1 lowercase letter</li>
            <li>1 number</li>
            <li>1 special character</li>
            <li>8 characters minimum</li>
          </ul>
        </div>

        <div className="student-register-password-group relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordScore(zxcvbn(e.target.value).score);
            }}
            placeholder="Password"
            className="student-register-password-input w-full border rounded px-3 py-2 pr-10"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="student-register-password-toggle absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {password.length > 0 && (
          <div className="student-register-strength-wrap mb-2">
            <div className="student-register-strength-track h-2 w-full rounded bg-gray-200">
              <div
                className={
                  `student-register-strength-fill h-2 rounded transition-all duration-300 ` +
                  (passwordScore === 0 ? 'w-1/5 bg-red-500' :
                   passwordScore === 1 ? 'w-2/5 bg-red-500' :
                   passwordScore === 2 ? 'w-3/5 bg-yellow-400' :
                   passwordScore === 3 ? 'w-4/5 bg-yellow-500' :
                   'w-full bg-green-500')
                }
                style={{}}
              />
            </div>
            <div className="student-register-strength-label text-xs mt-1 font-medium" style={{ color: passwordScore < 2 ? '#dc2626' : passwordScore < 4 ? '#eab308' : '#16a34a' }}>
              {passwordScore === 0 ? 'Very weak' :
                passwordScore === 1 ? 'Weak' :
                passwordScore === 2 ? 'Moderate' :
                passwordScore === 3 ? 'Strong' :
                'Very strong'}
            </div>
          </div>
        )}

        <div className="student-register-confirm-group relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="student-register-confirm-input w-full border rounded px-3 py-2 pr-10"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="student-register-confirm-toggle absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          type="submit"
          className="student-register-submit-button w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Create student account
        </button>
      </form>

      {error && <p className="student-register-error mt-4 text-red-600">{error}</p>}

      <div className="student-register-normal-cta-wrap mt-6 text-center">
        <Link
          href="/register"
          className="student-register-normal-cta inline-block w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
        >
          Not a student? Normal sign up
        </Link>
      </div>
    </div>
  );
}
