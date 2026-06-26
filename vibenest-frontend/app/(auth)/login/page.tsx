'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, adminLogin } = useAuthStore();

  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = role === 'user' ? '/api/v1/auth/login' : '/api/v1/auth/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (result.success) {
        if (role === 'user') {
          login(result.data.token, result.data.user);
          router.push('/');
        } else {
          adminLogin(result.data.token, result.data.admin);
          router.push('/admin');
        }
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Failed to connect to the login service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glassmorphism-card p-8 rounded-lg shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Welcome Back</h2>
          <p className="text-brand-gray text-xs font-ui uppercase tracking-widest">Sign in to your VibeNest profile</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded flex items-center gap-2 font-ui">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="flex bg-white/5 p-1 rounded-md font-ui text-xs">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-2.5 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              role === 'user'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2.5 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              role === 'admin'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-ui text-sm">
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-white/70">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'user' ? 'customer@vibenest.com' : 'admin@vibenest.com'}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-bold text-white/70">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand-gold hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-bold uppercase tracking-wider text-xs mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="text-center font-ui text-xs text-brand-gray pt-2 border-t border-white/5">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand-blue font-bold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
