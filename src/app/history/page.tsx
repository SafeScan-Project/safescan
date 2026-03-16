'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


interface ScanEntry {
  id: string;
  url: string;
  result: string;
  createdAt: string;
  notes?: string;
}


export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/history')
        .then((r) => r.json())
        .then((data) => {
          setScans(data.scans || []);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  
  async function handleDelete(id: string) {
    if (!window.confirm('Delete this scan?')) return;
    const res = await fetch('/api/history/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setScans((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert('Failed to delete scan');
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto">Loading…</div>;

  
  async function handleEdit(id: string, notes: string | undefined) {
    setEditingId(id);
    setEditValue(notes || '');
  }

  
  async function handleEditSave(id: string) {
    const res = await fetch('/api/history/edit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes: editValue }),
    });
    let ok = false;
    try {
      const data = await res.json();
      ok = res.ok && data.ok;
    } catch {
      ok = false;
    }
    if (ok) {
      setScans((prev) => prev.map((s) => (s.id === id ? { ...s, notes: editValue } : s)));
      setEditingId(null);
    } else {
      alert('Failed to save note');
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scan History</h2>
      {error && <p className="text-red-600">{error}</p>}
      {scans.length === 0 ? (
        <p>No scans recorded yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">URL</th>
              <th className="border p-2">When</th>
              <th className="border p-2">Notes</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-100">
                <td className="border p-2 break-all">{scan.url}</td>
                <td className="border p-2 text-center">
                  {new Date(scan.createdAt).toLocaleString()}
                </td>
                <td className="border p-2">
                  {editingId === scan.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        className="border p-1 rounded text-xs w-full"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="text-green-700 text-xs underline"
                        onClick={() => handleEditSave(scan.id)}
                      >Save</button>
                      <button
                        type="button"
                        className="text-gray-500 text-xs underline"
                        onClick={() => setEditingId(null)}
                      >Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-xs text-gray-700 mr-2">{scan.notes || <span className="italic text-gray-400">(no note)</span>}</span>
                      <button
                        type="button"
                        className="text-blue-600 text-xs underline"
                        onClick={() => handleEdit(scan.id, scan.notes)}
                      >Edit</button>
                    </div>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleDelete(scan.id)}
                    className="text-red-600 underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
