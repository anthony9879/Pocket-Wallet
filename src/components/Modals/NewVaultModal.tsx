import React, { useState } from 'react';
import { SavingsVault } from '../../types/wallet';
import { X, PiggyBank, Target, Calendar, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVault: (vault: SavingsVault) => void;
}

export const NewVaultModal: React.FC<NewVaultModalProps> = ({
  isOpen,
  onClose,
  onCreateVault,
}) => {
  const [name, setName] = useState('New Savings Goal');
  const [targetAmount, setTargetAmount] = useState('1000');
  const [initialDeposit, setInitialDeposit] = useState('50');
  const [category, setCategory] = useState('Savings');
  const [emoji, setEmoji] = useState('🎯');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [autoRoundup, setAutoRoundup] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const emojis = ['🎯', '✈️', '💻', '🚗', '🏡', '🛡️', '🎓', '💍', '🌴', '🏖️'];

  const handleCreate = () => {
    const target = parseFloat(targetAmount) || 1000;
    const initial = Math.min(parseFloat(initialDeposit) || 0, target);

    const newVault: SavingsVault = {
      id: `v-${Date.now()}`,
      name: name.trim() || 'Savings Goal',
      targetAmount: target,
      currentAmount: initial,
      currency: 'USD',
      category,
      emoji,
      deadline,
      autoRoundup,
      color: '#06b6d4',
    };

    onCreateVault(newVault);

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center ring-8 ring-cyan-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Vault Created!</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              <strong className="text-white">{name}</strong> is live. PocketPay will help track your progress towards ${parseFloat(targetAmount || '0').toFixed(2)}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                <PiggyBank className="w-3.5 h-3.5" /> High-Yield Savings Vault
              </span>
              <h2 className="text-xl font-bold text-white">Create Savings Goal</h2>
              <p className="text-xs text-slate-400">Lock money aside for goals, trips, and emergency funds</p>
            </div>

            {/* Emoji picker */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Choose Icon</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                      emoji === e ? 'bg-cyan-500/20 border-cyan-400 scale-110 shadow-sm' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Goal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dream Vacation, New Car, Emergency"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Target & Initial */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Amount ($)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Deposit ($)</label>
                <input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Auto round-up toggle */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Enable Round-Up Savings</div>
                <div className="text-[11px] text-slate-400">Round card transactions to nearest $1 and deposit change</div>
              </div>
              <input
                type="checkbox"
                checked={autoRoundup}
                onChange={(e) => setAutoRoundup(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 px-4 rounded-2xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Start Saving</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
