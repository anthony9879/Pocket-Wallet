import React, { useState } from 'react';
import { Transaction, Budget } from '../types/wallet';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  CreditCard,
  Plus,
  ArrowRight
} from 'lucide-react';

interface AnalyticsTabProps {
  transactions: Transaction[];
  budgets: Budget[];
  onUpdateBudget: (category: string, newLimit: number) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  transactions,
  budgets,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimitVal, setNewLimitVal] = useState<string>('500');

  // Calculate actual category spending from negative amounts
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

  // Subscriptions mock list
  const subscriptions = [
    { name: 'Netflix 4K Premium', amount: 22.99, cycle: 'Monthly', nextBill: 'Nov 6, 2026', icon: '🍿' },
    { name: 'Spotify Individual', amount: 11.99, cycle: 'Monthly', nextBill: 'Nov 14, 2026', icon: '🎧' },
    { name: 'Equinox Gym Pass', amount: 45.00, cycle: 'Monthly', nextBill: 'Nov 1, 2026', icon: '🏋️' },
    { name: 'Apple iCloud 2TB', amount: 9.99, cycle: 'Monthly', nextBill: 'Oct 28, 2026', icon: '☁️' },
  ];

  const handleSaveBudget = (cat: string) => {
    const val = parseFloat(newLimitVal) || 500;
    onUpdateBudget(cat, val);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h2 className="text-xl font-bold text-white">Financial Insights & Budgets</h2>
        <p className="text-xs text-slate-400">Track your cash velocity, spending patterns, monthly budget limits, and subscriptions</p>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Inflow</span>
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">${totalEarned.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Salary, transfers, & cashbacks</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Outflow</span>
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">${totalSpent.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Card payments, bills, & transfers</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Net Savings Margin</span>
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ${Math.max(0, totalEarned - totalSpent).toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-400">
            {totalEarned > 0 ? `${Math.round(((totalEarned - totalSpent) / totalEarned) * 100)}% retained` : 'Positive cashflow'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Spending by Category</h3>
            </div>
            <span className="text-xs text-slate-400">This Month</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{cat}</span>
                    <span className="text-slate-300 font-mono font-bold">
                      ${amount.toFixed(2)} <span className="text-slate-500 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Limit Tracker */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-base text-white">Monthly Budget Limits</h3>
            </div>
            <span className="text-xs text-slate-400">Target Guardrails</span>
          </div>

          <div className="space-y-4">
            {budgets.map((b) => {
              const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const isOver = b.spent > b.limit;
              const isClose = percent >= 80;
              const isEditing = editingCategory === b.category;

              return (
                <div key={b.category} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-white">{b.category}</span>
                      <span className="text-slate-400 block text-[11px]">
                        ${b.spent.toFixed(0)} of ${b.limit.toFixed(0)} spent
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isOver
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isClose
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {percent}%
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(b.category);
                            setNewLimitVal(b.limit.toString());
                          }}
                          className="text-slate-400 hover:text-white underline text-[11px]"
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
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <button
                        onClick={() => handleSaveBudget(b.category)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
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
      </div>

      {/* Subscriptions & Recurring Charges Tracker */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-base text-white">Active Subscriptions & Recurring Bills</h3>
          </div>
          <span className="text-xs text-slate-400">Auto-detected from Pocket Cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subscriptions.map((sub, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-slate-700/60">{sub.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{sub.name}</div>
                  <div className="text-[11px] text-slate-400">{sub.cycle}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-xs">
                <span className="text-slate-400">Next: {sub.nextBill}</span>
                <span className="font-bold font-mono text-white">${sub.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
