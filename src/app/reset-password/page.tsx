
'use client';
import { useState } from 'react';

export default function ResetRequestPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSent(false);
    const res = await fetch('/api/auth/reset-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      setError('Failed to send reset email');
    }
  }

  return (
    <div className="reset-request-page max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="reset-request-title text-xl font-bold mb-4">Reset Password</h2>
      {sent ? (
        <p className="reset-request-success text-green-700">If your email is registered, a reset link has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="reset-request-form space-y-4">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="reset-request-input w-full border p-2 rounded"
          />
          <button type="submit" className="reset-request-submit-button w-full bg-blue-600 text-white p-2 rounded">Send Reset Link</button>
          {error && <p className="reset-request-error text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
