'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

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
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (result.success) {
        // Save to Zustand
        login(result.data.token, result.data.user);
        router.push('/');
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

        <form onSubmit={handleSubmit} className="space-y-4 font-ui text-sm">
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-white/70">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@vibenest.com"
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
