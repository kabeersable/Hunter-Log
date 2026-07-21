import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Shield, LogIn, UserPlus, AlertCircle, CheckCircle2, KeyRound, Database } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!configured) {
        // Dev fallback if Supabase credentials not set yet in .env.local
        setErrorMsg('Supabase URL & Anon Key not configured in .env.local yet. Please update .env.local.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSuccessMsg('SYSTEM ACCESS GRANTED. Synchronizing Hunter Cloud State...');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!configured) {
        setErrorMsg('Supabase URL & Anon Key not configured in .env.local yet. Please update .env.local.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        setSuccessMsg('Account created! Initializing Supabase RLS database session...');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create Supabase account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-system-bg relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -bottom-32 -right-32 pointer-events-none" />

      {/* Main System Window Box */}
      <div className="system-box w-full max-w-md p-6 sm:p-8 shadow-cyan-glow relative z-10 space-y-6 border border-cyan-500/40">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-full text-cyan-400 shadow-cyan-glow mb-1">
            <Shield className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase flex items-center justify-center gap-1">
              <Database className="w-3.5 h-3.5" />
              [SUPABASE CLOUD AUTHENTICATION]
            </span>
            <h1 className="font-system font-black text-2xl sm:text-3xl text-slate-100 tracking-wider">
              HUNTER LOG
            </h1>
            <p className="text-xs font-mono text-slate-400 max-w-xs mx-auto">
              Real-Time Cross-Device Routine & Progression Sync.
            </p>
          </div>
        </div>

        {!configured && (
          <div className="bg-amber-950/60 border border-amber-600/60 p-3 rounded font-mono text-xs text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" /> SUPABASE SETUP REQUIRED
            </div>
            <p className="text-[11px] text-amber-200/80">
              Please enter your Supabase URL and Anon Key in <code className="bg-black/40 px-1 py-0.5 rounded">.env.local</code> to activate live cloud database sync.
            </p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-system-card p-1 border border-slate-800 rounded font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-center rounded transition-all flex items-center justify-center gap-1.5 font-bold ${
              tab === 'login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-cyan-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-center rounded transition-all flex items-center justify-center gap-1.5 font-bold ${
              tab === 'signup'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-purple-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>SIGN UP</span>
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">EMAIL ADDRESS:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@domain.com"
                required
                autoFocus
                className="w-full bg-system-bg border border-cyan-500/40 p-3 rounded text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-system-bg border border-cyan-500/40 p-3 rounded text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-xs text-green-400 bg-green-950/60 border border-green-800 p-2.5 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-sm tracking-wider rounded shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  AUTHENTICATE CLOUD SESSION →
                </>
              )}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">EMAIL ADDRESS:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@domain.com"
                required
                autoFocus
                className="w-full bg-system-bg border border-purple-500/40 p-3 rounded text-slate-100 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">CREATE SECURE PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full bg-system-bg border border-purple-500/40 p-3 rounded text-slate-100 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 placeholder:text-slate-600"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-xs text-green-400 bg-green-950/60 border border-green-800 p-2.5 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-system font-extrabold text-sm tracking-wider rounded shadow-purple-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  CREATE SUPABASE ACCOUNT →
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 text-center text-[10px] font-mono text-slate-600">
          <span>Row Level Security (RLS) Encrypted Matrix • v2.0.0</span>
        </div>
      </div>
    </div>
  );
};
