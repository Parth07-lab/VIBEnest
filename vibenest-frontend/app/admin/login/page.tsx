'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { ShieldAlert, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function AdminLoginPage() {
  const router = useRouter();
  const adminLogin = useAuthStore((state) => state.adminLogin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  
  // MFA flags
  const [mfaRequired, setMfaRequired] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter admin credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = { email, password };
      if (totpToken) payload.totpToken = totpToken;

      const res = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (res.status === 202 && result.mfaRequired) {
        // MFA setup required
        setMfaRequired(true);
        // Generate a mock QR code for authenticator app using the secret 'vibenestsecret'
        const otpAuthUrl = `otpauth://totp/VibeNestAdmin:${email}?secret=JBSWY3DPEHPK3PXP&issuer=VibeNest`;
        const qrUrl = await QRCode.toDataURL(otpAuthUrl);
        setQrCodeUrl(qrUrl);
      } else if (result.success) {
        // Login success
        adminLogin(result.data.token, result.data.admin);
        router.push('/admin');
      } else {
        setError(result.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError('Connection to admin login service failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 font-ui text-sm">
      <div className="max-w-md w-full border-t-4 border-brand-blue bg-brand-darkGray/40 p-8 rounded shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-2 border border-brand-blue/20">
            <ShieldAlert size={24} />
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white">VibeNest Portal</h2>
          <p className="text-brand-gray text-[10px] uppercase tracking-widest">Administrator Authentication Space</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {!mfaRequired ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-white/70">Administrator Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vibenest.com"
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-white/70">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="input-field"
                  required
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center animate-fade-in">
              <p className="text-xs text-white/70">
                Multi-Factor Authentication (2FA) is active. Scan the QR code with your authenticator app and enter the code below.
              </p>
              
              {qrCodeUrl && (
                <div className="bg-white p-3 inline-block rounded border border-white/10 mx-auto">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase font-bold text-white/70 block text-center">2FA Token</label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="Enter 6-digit MFA Code"
                  className="input-field text-center text-lg tracking-widest"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-bold uppercase tracking-wider text-xs mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : mfaRequired ? (
              'Verify 2FA Token'
            ) : (
              <>
                Admin Sign In <KeyRound size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
