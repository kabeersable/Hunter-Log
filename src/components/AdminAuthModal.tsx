import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import { Lock, KeyRound, X, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { authenticateAdmin, isAdmin, logoutAdmin } = useHunter();
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateAdmin(passcode)) {
      setErrorMsg('');
      setPasscode('');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('ACCESS DENIED: Invalid System Admin Passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="system-box w-full max-w-sm p-6 shadow-cyan-glow">
        <div className="flex items-center justify-between border-b border-system-cyan/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="font-system font-extrabold text-xs text-cyan-400 tracking-wider">
              [ADMIN SYSTEM CLEARANCE]
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAdmin ? (
          <div className="space-y-4 text-center font-mono text-xs">
            <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded text-cyan-300 flex items-center justify-center gap-2 font-bold">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              ADMIN CLEARANCE ACTIVE
            </div>
            <p className="text-slate-400 text-[11px]">
              You have full administrative privileges to load personal datasets and modify master system routines.
            </p>
            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="w-full py-2.5 bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-system font-extrabold text-xs rounded transition-all"
            >
              LOCK ADMIN ACCESS
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 font-mono text-xs">
            <p className="text-slate-400 text-[11px]">
              Enter administrative passcode to unlock personal master routine datasets and admin clearance.
            </p>

            <div>
              <label className="block text-slate-300 mb-1.5 flex items-center gap-1 font-bold">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                PASSCODE / PIN:
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter secret passcode..."
                autoFocus
                className="w-full bg-system-bg border border-system-cyan/40 p-2.5 rounded text-slate-100 text-sm tracking-widest focus:outline-none focus:border-cyan-400"
              />
            </div>

            {errorMsg && (
              <div className="text-[11px] text-red-400 bg-red-950/60 border border-red-800 p-2 rounded flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-xs rounded shadow-cyan-glow"
              >
                AUTHENTICATE
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
