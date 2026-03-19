"use client";
export const dynamic = "force-dynamic";
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetConfirmInner() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/reset-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Reset failed');
    }
  }

  if (!token) {
    return <div className="reset-confirm-missing-token max-w-md mx-auto mt-10 p-4 border rounded text-red-600">Missing or invalid reset token.</div>;
  }

  return (
    <div className="reset-confirm-page max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="reset-confirm-title text-xl font-bold mb-4">Set New Password</h2>
      {success ? (
        <p className="reset-confirm-success text-green-700">Your password has been reset. You may now log in.</p>
      ) : (
        <form onSubmit={handleSubmit} className="reset-confirm-form space-y-4">
          <input
            type="password"
            required
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="reset-confirm-password-input w-full border p-2 rounded"
          />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="reset-confirm-confirm-input w-full border p-2 rounded"
          />
          <button type="submit" className="reset-confirm-submit-button w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
          {error && <p className="reset-confirm-error text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default function ResetConfirmPage() {
  return (
    <Suspense>
      <ResetConfirmInner />
    </Suspense>
  );
}
