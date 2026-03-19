
// Client-side registration page for new user sign-up
'use client';


import { useState } from 'react'; // React state management
import zxcvbn from 'zxcvbn'; // Password strength estimation
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Password visibility icons
import { useRouter } from 'next/navigation'; // Next.js router
import { signIn } from 'next-auth/react'; // NextAuth sign-in
import Link from 'next/link';


// Registration form component
export default function RegisterPage() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();


  // Handle form submission and register user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
    if (!passwordRegex.test(password)) {
      setError('Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }

    // Send registration request to API
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registration failed');
    } else {
      // Auto-login after successful registration
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
    }
  };

  // Render registration form UI
  return (
    <div className="register-page max-w-md mx-auto">
      <h2 className="register-title text-2xl font-bold mb-4">Sign up</h2>
      <form onSubmit={handleSubmit} className="register-form space-y-4">
        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="register-email-input w-full border rounded px-3 py-2"
          required
        />
        {/* Password requirements info */}
        <div className="register-password-rules mb-2 text-xs text-gray-600">
          Password must have at least:
          <ul className="list-disc ml-5">
            <li>1 uppercase letter</li>
            <li>1 lowercase letter</li>
            <li>1 number</li>
            <li>1 special character</li>
            <li>8 characters minimum</li>
          </ul>
        </div>
        {/* Password input with strength meter */}
        <div className="register-password-group relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordScore(zxcvbn(e.target.value).score);
            }}
            placeholder="Password"
            className="register-password-input w-full border rounded px-3 py-2 pr-10"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="register-password-toggle absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="register-strength-wrap mb-2">
            <div className="register-strength-track h-2 w-full rounded bg-gray-200">
              <div
                className={
                  `register-strength-fill h-2 rounded transition-all duration-300 ` +
                  (passwordScore === 0 ? 'w-1/5 bg-red-500' :
                   passwordScore === 1 ? 'w-2/5 bg-red-500' :
                   passwordScore === 2 ? 'w-3/5 bg-yellow-400' :
                   passwordScore === 3 ? 'w-4/5 bg-yellow-500' :
                   'w-full bg-green-500')
                }
                style={{}}
              />
            </div>
            <div className="register-strength-label text-xs mt-1 font-medium" style={{ color: passwordScore < 2 ? '#dc2626' : passwordScore < 4 ? '#eab308' : '#16a34a' }}>
              {passwordScore === 0 ? 'Very weak' :
                passwordScore === 1 ? 'Weak' :
                passwordScore === 2 ? 'Moderate' :
                passwordScore === 3 ? 'Strong' :
                'Very strong'}
            </div>
          </div>
        )}
        {/* Confirm password input with visibility toggle */}
        <div className="register-confirm-group relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="register-confirm-input w-full border rounded px-3 py-2 pr-10"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="register-confirm-toggle absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {/* Submit button */}
        <button
          type="submit"
          className="register-submit-button w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Create account
        </button>
      </form>
      {/* Error message display */}
      {error && <p className="register-error mt-4 text-red-600">{error}</p>}

      <div className="register-student-cta-wrap mt-6 text-center">
        <Link
          href="/register/student"
          className="register-student-cta inline-block w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
        >
          Student? Sign up here
        </Link>
      </div>
    </div>
  );
}
