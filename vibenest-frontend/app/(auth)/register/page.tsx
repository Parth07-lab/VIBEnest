'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = details, 2 = verify OTP
  const [otp, setOtp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const result = await res.json();
      if (result.success) {
        setStep(2);
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Failed to connect to the registration service.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg('Account verified successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Verification service connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glassmorphism-card p-8 rounded-lg shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Create Account</h2>
          <p className="text-brand-gray text-xs font-ui uppercase tracking-widest">
            {step === 1 ? 'Join VibeNest elite membership' : 'Verify your email address'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded flex items-center gap-2 font-ui animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded flex items-center gap-2 font-ui animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 font-ui text-sm">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-white/70">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajan Kumar"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-white/70">Email Address *</label>
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
              <label className="text-xs uppercase font-bold text-white/70">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-white/70">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
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
                  Register <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4 font-ui text-sm animate-fade-in">
            <p className="text-white/70 text-xs font-body text-center leading-relaxed">
              We have sent a confirmation email to <strong>{email}</strong>. Enter the OTP code to verify your profile. 
              <br />
              <span className="text-brand-gold font-bold">Hint: Seeded OTP is 123456</span>
            </p>
            <div className="space-y-1.5 pt-4">
              <label className="text-xs uppercase font-bold text-white/70 block text-center">OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="input-field text-center text-lg tracking-widest"
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
                'Verify Account'
              )}
            </button>
          </form>
        )}

        <div className="text-center font-ui text-xs text-brand-gray pt-2 border-t border-white/5">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-blue font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
