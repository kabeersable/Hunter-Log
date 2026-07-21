import React, { useState } from 'react';
import { useHunter } from '../context/HunterContext';
import { CheckCircle2, X, AlertCircle, FileCheck } from 'lucide-react';

export const ProofModal: React.FC = () => {
  const { proofModalLog, closeProofModal, submitProof, state } = useHunter();
  const [proofText, setProofText] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!proofModalLog) return null;

  const task = state.tasks.find((t) => t.id === proofModalLog.routineTaskId);
  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim()) {
      setErrorMsg('SYSTEM ERROR: Proof input cannot be empty. Mandatory metric required.');
      return;
    }
    setErrorMsg('');
    submitProof(proofText, isPartial);
  };

  const xpAmount = isPartial ? Math.floor(task.xpReward / 2) : task.xpReward;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="system-box w-full max-w-md p-6 shadow-cyan-glow">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-system-cyan/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-system font-extrabold text-sm text-cyan-400 tracking-wider">
              [SYSTEM VERIFICATION PROTOCOL]
            </h3>
          </div>
          <button
            onClick={closeProofModal}
            className="text-slate-400 hover:text-slate-100 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info */}
        <div className="bg-system-bg p-3 border border-system-border mb-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {task.type} QUEST VERIFICATION
          </div>
          <div className="font-system font-bold text-slate-100 text-base mt-1">
            {task.title}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-mono">
            <span className="text-cyan-300">Target: <strong className="text-white">{task.target}</strong></span>
            <span className="text-slate-400">Stat: <strong className="text-cyan-400">{task.statTrained}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Proof Input */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
              <span>ENTER VERIFICATION PROOF (Required):</span>
              <span className="text-[10px] text-cyan-400">Number / Time / Result</span>
            </label>
            <input
              type="text"
              value={proofText}
              onChange={(e) => {
                setProofText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={`e.g. Completed ${task.target} at 8:00 AM`}
              autoFocus
              className="w-full bg-system-bg border border-system-cyan/40 p-2.5 rounded font-mono text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Partial Completion Checkbox */}
          <div className="bg-slate-900/60 p-3 border border-slate-800 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="partialToggle"
                checked={isPartial}
                onChange={(e) => setIsPartial(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 bg-slate-950 border-slate-700 rounded cursor-pointer"
              />
              <label htmlFor="partialToggle" className="text-xs font-mono text-slate-300 cursor-pointer">
                Partial Completion (Award 50% XP)
              </label>
            </div>
            <div className="text-xs font-mono font-bold text-gold-glow">
              +{xpAmount} XP
            </div>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeProofModal}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-system font-extrabold text-xs tracking-wider rounded shadow-cyan-glow transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              SUBMIT PROOF & CLAIM XP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
