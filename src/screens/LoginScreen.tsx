import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useHunter } from '../context/HunterContext';
import { Shield, LogIn, UserPlus, AlertCircle, CheckCircle2, KeyRound, Database } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { loginWithUserSession } = useHunter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const configured = isSupabaseConfigured();

  // Format username or email into valid Supabase auth email
  const formatAuthEmail = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) return trimmed;
    return `${trimmed.toLowerCase()}@hunterlog.com`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const emailToUse = formatAuthEmail(userInput);

    try {
      // 1. Check Master Admin Credentials local match
      const cleanInput = userInput.trim().toLowerCase();
      if ((cleanInput === 'admin_hunter_9247' || cleanInput === 'admin_hunter_9247@hunterlog.com') && password === 'Xk7#mQp2!vT9$wRz4Lc@') {
        loginWithUserSession({
          username: 'admin_hunter_9247',
          passwordHash: 'admin_hash',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });

        setSuccessMsg('MASTER ADMIN CLEARANCE UNLOCKED. Loading Master Routine...');
        
        // Attempt background Supabase Auth provisioning
        if (configured) {
          supabase.auth.signInWithPassword({ email: emailToUse, password }).then(({ error }) => {
            if (error) {
              supabase.auth.signUp({ email: emailToUse, password });
            }
          });
        }
        setLoading(false);
        return;
      }

      // 2. Attempt Supabase Auth Sign In
      let { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      // 3. Auto-signup fallback if account does not exist in Supabase Auth yet
      if (error && (error.message.includes('Invalid login credentials') || error.message.includes('user_not_found'))) {
        const signUpRes = await supabase.auth.signUp({
          email: emailToUse,
          password,
        });

        if (signUpRes.data.session) {
          setSuccessMsg('ACCOUNT INITIALIZED & AUTHENTICATED.');
          setLoading(false);
          return;
        } else if (signUpRes.error) {
          setErrorMsg(signUpRes.error.message);
          setLoading(false);
          return;
        }
      }

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSuccessMsg('SYSTEM ACCESS GRANTED. Synchronizing Hunter Cloud State...');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const emailToUse = formatAuthEmail(userInput);

    try {
      if (!configured) {
        setErrorMsg('Supabase URL & Anon Key not configured in .env.local yet.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailToUse,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        setSuccessMsg('Account created successfully! Logging into cloud matrix...');
        await supabase.auth.signInWithPassword({
          email: emailToUse,
          password,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
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
              [SYSTEM GATEKEEPER PROTOCOL]
            </span>
            <h1 className="font-system font-black text-2xl sm:text-3xl text-slate-100 tracking-wider">
              HUNTER LOG
            </h1>
            <p className="text-xs font-mono text-slate-400 max-w-xs mx-auto">
              Real-Time Cross-Device Routine & Progression Sync.
            </p>
          </div>
        </div>

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

        {/* Form 1: SIGN IN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">USERNAME OR EMAIL:</label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter username or email"
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
                placeholder="Enter password"
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
                  AUTHENTICATE & ENTER →
                </>
              )}
            </button>
          </form>
        )}

        {/* Form 2: SIGN UP */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">USERNAME OR EMAIL:</label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Choose username or email"
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
                  CREATE ACCOUNT PROTOCOL →
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
