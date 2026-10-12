import React, { useState } from 'react';
import { SavingsVault } from '../types/wallet';
import { 
  PiggyBank, 
  Plus, 
  Target, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VaultsTabProps {
  vaults: SavingsVault[];
  mainBalance: number;
  onDepositToVault: (vaultId: string, amount: number) => void;
  onWithdrawFromVault: (vaultId: string, amount: number) => void;
  onToggleRoundup: (vaultId: string) => void;
  onOpenNewVaultModal: () => void;
}

export const VaultsTab: React.FC<VaultsTabProps> = ({
  vaults,
  mainBalance,
  onDepositToVault,
  onWithdrawFromVault,
  onToggleRoundup,
  onOpenNewVaultModal,
}) => {
  const [activeVaultAction, setActiveVaultAction] = useState<{ id: string; type: 'deposit' | 'withdraw' } | null>(null);
  const [actionAmount, setActionAmount] = useState('50');

  const totalSaved = vaults.reduce((acc, v) => acc + v.currentAmount, 0);
  const totalTarget = vaults.reduce((acc, v) => acc + v.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleExecuteAction = (vault: SavingsVault) => {
    const amt = parseFloat(actionAmount) || 0;
    if (amt <= 0) return;

    if (activeVaultAction?.type === 'deposit') {
      if (amt > mainBalance) {
        alert('Insufficient main wallet balance for this deposit.');
        return;
      }
      onDepositToVault(vault.id, amt);
      confetti({ particleCount: 50, spread: 50 });
    } else {
      if (amt > vault.currentAmount) {
        alert('Cannot withdraw more than current vault balance.');
        return;
      }
      onWithdrawFromVault(vault.id, amt);
    }

    setActiveVaultAction(null);
    setActionAmount('50');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Savings Vaults & Goals</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              4.5% APY Yield
            </span>
          </div>
          <p className="text-xs text-slate-400">Lock money aside for goals, trips, and emergency funds with automated spare-change roundups</p>
        </div>
        <button
          onClick={onOpenNewVaultModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Vault</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 font-medium">Total In All Vaults</span>
          <div className="text-2xl font-black text-white font-mono mt-1">${totalSaved.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Compounding at 4.5% APY
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 font-medium">Combined Target</span>
          <div className="text-2xl font-black text-white font-mono mt-1">${totalTarget.toLocaleString()}</div>
          <span className="text-[11px] text-cyan-400 mt-1 block">
            {overallProgress}% of all financial targets reached
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 font-medium">Automated Round-Ups</span>
          <div className="text-2xl font-black text-white font-mono mt-1">Active</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Spare change auto-deposited into tagged vaults
          </span>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaults.map((vault) => {
          const progress = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
          const remaining = Math.max(0, vault.targetAmount - vault.currentAmount);
          const isActing = activeVaultAction?.id === vault.id;

          return (
            <div
              key={vault.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Top Row: Icon, Name, Category */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                      {vault.emoji}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-white">{vault.name}</h3>
                      <span className="text-[11px] text-cyan-400 font-semibold">{vault.category}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {progress}%
                  </span>
                </div>

                {/* Amount display */}
                <div className="space-y-1 mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-white font-mono">
                      ${vault.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      Goal: <strong className="text-slate-200">${vault.targetAmount.toLocaleString()}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-right pt-0.5">
                    ${remaining.toLocaleString()} left to goal
                  </div>
                </div>

                {/* Deadline & Round-up info */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  {vault.deadline && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target Date:
                      </span>
                      <span className="text-slate-200 font-medium">{vault.deadline}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-Roundups:
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleRoundup(vault.id)}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors ${
                        vault.autoRoundup
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {vault.autoRoundup ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action form or buttons */}
              {isActing ? (
                <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">
                      {activeVaultAction.type === 'deposit' ? 'Deposit from Wallet' : 'Withdraw to Wallet'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveVaultAction(null)}
                      className="text-slate-400 hover:text-white text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-sm text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-6 pr-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={() => handleExecuteAction(vault)}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Confirm {activeVaultAction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVaultAction({ id: vault.id, type: 'deposit' });
                      setActionAmount('50');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold border border-cyan-500/40 transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVaultAction({ id: vault.id, type: 'withdraw' });
                      setActionAmount('50');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
