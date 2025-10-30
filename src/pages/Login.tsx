import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // role is inferred automatically by email during login
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    try {
      await login(email, password);
      // read saved user from localStorage (login stores it) to decide redirect
      try {
        const raw = localStorage.getItem('app_user');
        if (raw) {
          const u = JSON.parse(raw) as any;
          if (u?.role === 'admin') {
            navigate('/upload');
            return;
          }
        }
      } catch (e) {
        // fall back
      }
      navigate('/');
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" />

        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" />

        {/* Role is determined automatically by email. */}

        <div className="flex items-center justify-between">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Sign in</button>
          <button type="button" onClick={() => { setEmail(''); setPassword(''); }} className="text-sm text-gray-600">Reset</button>
        </div>
      </form>
    </div>
  );
}
