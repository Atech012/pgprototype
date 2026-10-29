'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { staffLogin } from '../../../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await staffLogin(username, password);
    setLoading(false);

    if (res.status === 'success' && res.token) {
      // Store JWT token and user info safely
      localStorage.setItem('peso_token', res.token);
      localStorage.setItem('peso_user', JSON.stringify(res.user || { username }));
      // Redirect to the new admin home hub
      router.push('/admin/home');
    } else {
      setError(res.message || 'Invalid staff credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#059669] text-white font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-2">
            PG
          </div>
          <h2 className="text-2xl font-bold text-[#0B1F3B]">PESO Staff Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Municipality of Guagua • Administrative Access</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0B1F3B] hover:bg-[#1E3A8A] text-white font-semibold rounded text-sm transition"
          >
            {loading ? 'Authenticating...' : 'Login to Admin Portal'}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-800 transition">
            ← Return to Public Portal
          </a>
        </div>
      </div>
    </div>
  );
}