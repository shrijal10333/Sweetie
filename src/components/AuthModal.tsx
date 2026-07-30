import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, CheckCircle2, LogOut, ArrowRight, Settings, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  isAdmin: boolean;
  onLoginSuccess: (user: UserType) => void;
  onAdminToken: (token: string, user: UserType) => void;
  onLogout: () => void;
  onOpenAdminDashboard?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAdmin,
  onLoginSuccess,
  onAdminToken,
  onLogout,
  onOpenAdminDashboard,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail(''); setPassword(''); setName('');
    setError(null); setSuccessMsg(null); setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) { setError('Please fill in all required fields.'); return; }
    if (mode === 'register' && !name) { setError('Please enter your full name.'); return; }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    setLoading(true);

    try {
      // 1️⃣ Always try admin login first
      const adminResp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (adminResp.ok) {
        const { token } = await adminResp.json();
        const adminUser: UserType = { id: 'admin-001', name: 'Admin', email: cleanEmail, isAdmin: true };
        onAdminToken(token, adminUser);
        setSuccessMsg('Admin login successful! Redirecting...');
        setTimeout(() => { resetForm(); onClose(); if (onOpenAdminDashboard) onOpenAdminDashboard(); }, 700);
        return;
      }

      // 2️⃣ Customer register
      if (mode === 'register') {
        const regResp = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: cleanEmail, password: cleanPassword }),
        });
        const regData = await regResp.json();
        if (!regResp.ok) { setError(regData.error || 'Registration failed.'); setLoading(false); return; }

        const user: UserType = { id: regData.user.id, name: regData.user.name, email: regData.user.email, isAdmin: false };
        onLoginSuccess(user);
        setSuccessMsg(`Account created! Welcome, ${user.name}! 💕`);
        setTimeout(() => { resetForm(); onClose(); }, 900);
        return;
      }

      // 3️⃣ Customer login — must have registered first
      const loginResp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const loginData = await loginResp.json();
      if (!loginResp.ok) { setError(loginData.error || 'Login failed.'); setLoading(false); return; }

      const user: UserType = { id: loginData.user.id, name: loginData.user.name, email: loginData.user.email, isAdmin: false };
      onLoginSuccess(user);
      setSuccessMsg(`Welcome back, ${user.name}! 💕`);
      setTimeout(() => { resetForm(); onClose(); }, 900);

    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-pink-100 overflow-hidden">

        {/* Header */}
        <div className="p-6 bg-[#DB2777] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-200">Cherry Lush Store Account</span>
            <h2 className="font-serif font-bold text-2xl leading-tight">
              {currentUser ? `Hello, ${currentUser.name}` : 'Welcome Back'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged-in state */}
        {currentUser ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-[#DB2777] mx-auto flex items-center justify-center text-[#DB2777]">
              {isAdmin ? <ShieldCheck className="w-8 h-8" /> : <User className="w-8 h-8" />}
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-gray-900">{currentUser.name}</h3>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
              {isAdmin && (
                <span className="inline-block mt-2 bg-[#DB2777] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Store Admin & Owner
                </span>
              )}
            </div>

            {isAdmin && onOpenAdminDashboard && (
              <button
                onClick={() => { onClose(); onOpenAdminDashboard(); }}
                className="w-full bg-[#DB2777] hover:bg-[#be185d] text-white font-bold py-3.5 rounded-full shadow-md flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <Settings className="w-4 h-4" /><span>Open Admin Dashboard</span>
              </button>
            )}

            <button
              onClick={() => { onLogout(); resetForm(); }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-full flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" /><span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium flex items-center gap-2">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required placeholder="Your name" value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#DB2777]" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required placeholder="you@gmail.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#DB2777]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#DB2777]" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#DB2777] hover:bg-[#be185d] disabled:opacity-60 text-white font-bold py-3.5 rounded-full shadow-md text-xs transition-colors flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
                  : <><span>{mode === 'login' ? 'Login' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <div className="text-center text-xs text-gray-500">
              {mode === 'login' ? (
                <p>New here?{' '}
                  <button type="button" onClick={() => { setMode('register'); setError(null); }}
                    className="text-[#DB2777] font-bold hover:underline">Create an account</button>
                </p>
              ) : (
                <p>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(null); }}
                    className="text-[#DB2777] font-bold hover:underline">Login</button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
