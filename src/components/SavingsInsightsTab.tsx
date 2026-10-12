import React, { useState } from 'react';
import { SavingsVault, Transaction, Budget } from '../types/wallet';
import { 
  PiggyBank, 
  Plus, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Sparkles, 
  PieChart, 
  AlertTriangle, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavingsInsightsTabProps {
  vaults: SavingsVault[];
  mainBalance: number;
  transactions: Transaction[];
  budgets: Budget[];
  onDepositToVault: (vaultId: string, amount: number) => void;
  onWithdrawFromVault: (vaultId: string, amount: number) => void;
  onToggleRoundup: (vaultId: string) => void;
  onOpenNewVaultModal: () => void;
  onUpdateBudget: (category: string, newLimit: number) => void;
}

export const SavingsInsightsTab: React.FC<SavingsInsightsTabProps> = ({
  vaults,
  mainBalance,
  transactions,
  budgets,
  onDepositToVault,
  onWithdrawFromVault,
  onToggleRoundup,
  onOpenNewVaultModal,
  onUpdateBudget,
}) => {
  const [activeVaultAction, setActiveVaultAction] = useState<{ id: string; type: 'deposit' | 'withdraw' } | null>(null);
  const [actionAmount, setActionAmount] = useState('50');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimitVal, setNewLimitVal] = useState<string>('500');

  // Vault Totals
  const totalSaved = vaults.reduce((acc, v) => acc + v.currentAmount, 0);
  const totalTarget = vaults.reduce((acc, v) => acc + v.targetAmount, 0);
  const overallVaultProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Cash Flow & Spending Totals
  const categoryTotals: { [key: string]: number } = {};
  let totalSpent = 0;
  let totalEarned = 0;

  transactions.forEach((tx) => {
    if (tx.amount < 0) {
      const amt = Math.abs(tx.amount);
      totalSpent += amt;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
    } else {
      totalEarned += tx.amount;
    }
  });

  const categories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
  const netRetained = Math.max(0, totalEarned - totalSpent);

  // Budget Totals
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const budgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);

  // Subscriptions
  const subscriptions = [
    { name: 'Netflix Premium', amount: 22.99, cycle: 'Monthly', nextBill: 'Nov 6', icon: '🍿' },
    { name: 'Spotify Individual', amount: 11.99, cycle: 'Monthly', nextBill: 'Nov 14', icon: '🎧' },
    { name: 'Equinox Gym Pass', amount: 45.00, cycle: 'Monthly', nextBill: 'Nov 1', icon: '🏋️' },
    { name: 'Apple iCloud 2TB', amount: 9.99, cycle: 'Monthly', nextBill: 'Oct 28', icon: '☁️' },
  ];
  const totalSubscriptions = subscriptions.reduce((acc, s) => acc + s.amount, 0);

  // Handlers
  const handleExecuteVaultAction = (vault: SavingsVault) => {
    const amt = parseFloat(actionAmount) || 0;
    if (amt <= 0) return;

    if (activeVaultAction?.type === 'deposit') {
      if (amt > mainBalance) {
        alert('Insufficient main wallet balance for this deposit.');
        return;
      }
      onDepositToVault(vault.id, amt);
      confetti({ particleCount: 45, spread: 50 });
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

  const handleSaveBudget = (cat: string) => {
    const val = parseFloat(newLimitVal) || 500;
    onUpdateBudget(cat, val);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Savings & Budgets</h1>
            <span className="text-xs text-emerald-400 font-medium">· 4.5% APY</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Manage goal vaults, monthly spending guardrails, and recurring bills</p>
        </div>

        <button
          onClick={onOpenNewVaultModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm active:scale-95 transition-all self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Vault</span>
        </button>
      </div>

      {/* 3 Core Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Saved */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Saved in Vaults</span>
            <PiggyBank className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            ${totalSaved.toLocaleString()}
          </div>
          <p className="text-[11px] text-cyan-400 font-medium">
            {overallVaultProgress}% of total target reached
          </p>
        </div>

        {/* Monthly Budget Health */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Budget Guardrail</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            ${budgetRemaining.toFixed(0)} <span className="text-xs font-normal text-slate-400">left</span>
          </div>
          <p className="text-[11px] text-slate-400">
            ${totalBudgetSpent.toFixed(0)} spent of ${totalBudgetLimit.toFixed(0)} limit
          </p>
        </div>

        {/* Cash Flow Retention */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Net Cashflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            +${netRetained.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            In: ${totalEarned.toFixed(0)} · Out: ${totalSpent.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Section 1: Savings Vaults */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-white">Savings Goals ({vaults.length})</h2>
          <span className="text-xs text-slate-400">Wallet Balance: ${mainBalance.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vaults.map((vault) => {
            const progress = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
            const remaining = Math.max(0, vault.targetAmount - vault.currentAmount);
            const isActing = activeVaultAction?.id === vault.id;

            return (
              <div
                key={vault.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700/60">
                        {vault.emoji}
                      </span>
                      <div>
                        <h3 className="font-semibold text-sm text-white">{vault.name}</h3>
                        <span className="text-[11px] text-slate-400">{vault.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 font-mono tabular-nums">
                      {progress}%
                    </span>
                  </div>

                  {/* Amount & Progress */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-lg font-bold text-white font-mono tabular-nums">
                        ${vault.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-mono tabular-nums">
                        of ${vault.targetAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                      <span>${remaining.toLocaleString()} left</span>
                      <button
                        type="button"
                        onClick={() => onToggleRoundup(vault.id)}
                        className={`hover:underline flex items-center gap-1 ${vault.autoRoundup ? 'text-emerald-400' : 'text-slate-500'}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {vault.autoRoundup ? 'Roundups ON' : 'Roundups OFF'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isActing ? (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">
                        {activeVaultAction.type === 'deposit' ? 'Deposit' : 'Withdraw'}
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
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="1"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-3 py-1 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      onClick={() => handleExecuteVaultAction(vault)}
                      className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVaultAction({ id: vault.id, type: 'deposit' });
                        setActionAmount('50');
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all flex items-center justify-center gap-1"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Deposit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVaultAction({ id: vault.id, type: 'withdraw' });
                        setActionAmount('50');
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Budgets & Recurring Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budgets */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Monthly Category Budgets</h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ${totalBudgetSpent.toFixed(0)} of ${totalBudgetLimit.toFixed(0)}
            </span>
          </div>

          <div className="space-y-3">
            {budgets.map((b) => {
              const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const isOver = b.spent > b.limit;
              const isClose = percent >= 80;
              const isEditing = editingCategory === b.category;

              return (
                <div key={b.category} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-white">{b.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono tabular-nums ${isOver ? 'text-rose-400 font-bold' : isClose ? 'text-amber-400' : 'text-slate-400'}`}>
                        ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(b.category);
                            setNewLimitVal(b.limit.toString());
                          }}
                          className="text-[11px] text-slate-500 hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="number"
                        value={newLimitVal}
                        onChange={(e) => setNewLimitVal(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white font-mono tabular-nums"
                      />
                      <button
                        onClick={() => handleSaveBudget(b.category)}
                        className="px-2.5 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-500' : isClose ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscriptions & Recurring Bills */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Recurring Subscriptions</h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums">${totalSubscriptions.toFixed(2)}/mo</span>
          </div>

          <div className="space-y-2">
            {subscriptions.map((sub, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sub.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-white">{sub.name}</div>
                    <div className="text-[11px] text-slate-500">Next bill: {sub.nextBill}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-white font-mono tabular-nums">
                  ${sub.amount.toFixed(2)}<span className="text-[10px] text-slate-500 font-normal">/mo</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick breakdown footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Active Pocket Cards linked</span>
            <span className="text-emerald-400 font-medium">Auto-renew protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
