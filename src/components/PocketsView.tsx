import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  PiggyBank, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles, 
  Target, 
  Calendar, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { PocketVault } from '../types/wallet';

const EMOJI_OPTIONS = ['🛡️', '🏖️', '✈️', '💻', '🚗', '🏠', '💍', '🎓', '🎁', '⚡', '🎮', '🎿'];

export const PocketsView: React.FC = () => {
  const { 
    pockets, 
    createPocket, 
    depositToPocket, 
    withdrawFromPocket, 
    deletePocket,
    togglePocketRoundUp,
    balance, 
    formatAmount, 
    addToast 
  } = useWallet();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTransferPocket, setActiveTransferPocket] = useState<{
    pocket: PocketVault;
    action: 'deposit' | 'withdraw';
  } | null>(null);

  const [transferAmount, setTransferAmount] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('Savings');
  const [emoji, setEmoji] = useState('🎯');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [autoSaveRoundUp, setAutoSaveRoundUp] = useState(true);

  const totalSaved = pockets.reduce((acc, p) => acc + p.currentAmount, 0);
  const roundUpsCount = pockets.filter((p) => p.autoSaveRoundUp).length;
  const nextTargetGoal = pockets.find((p) => p.currentAmount < p.targetAmount) || pockets[0];
  const nextTargetProgress = nextTargetGoal && nextTargetGoal.targetAmount > 0
    ? Math.min(100, Math.round((nextTargetGoal.currentAmount / nextTargetGoal.targetAmount) * 100))
    : 0;

  const handleCreatePocket = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount) || 0;
    if (!title.trim() || targetNum <= 0) {
      addToast('Please enter a goal title and target amount', 'error');
      return;
    }

    createPocket({
      title,
      targetAmount: targetNum,
      category,
      emoji,
      targetDate,
      color: '#10b981',
      autoSaveEnabled: true,
      autoSaveRoundUp,
    });

    setIsCreateOpen(false);
    setTitle('');
    setTargetAmount('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferPocket) return;

    const amt = parseFloat(transferAmount) || 0;
    if (amt <= 0) {
      addToast('Please enter an amount', 'error');
      return;
    }

    let success = false;
    if (activeTransferPocket.action === 'deposit') {
      success = depositToPocket(activeTransferPocket.pocket.id, amt);
    } else {
      success = withdrawFromPocket(activeTransferPocket.pocket.id, amt);
    }

    if (success) {
      setActiveTransferPocket(null);
      setTransferAmount('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Savings Pockets</h2>
          <p className="text-sm text-slate-500">Dedicated vaults for your goals, emergencies, and purchases</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Create New Pocket
        </button>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-sm border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Saved Across Pockets</span>
            <PiggyBank className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold">{formatAmount(totalSaved)}</div>
          <div className="mt-2 text-xs text-slate-300">
            Across <span className="text-emerald-400 font-semibold">{pockets.length} active vaults</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Spare Change Round-Ups</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900">
              {roundUpsCount > 0 ? `Active on ${roundUpsCount} ${roundUpsCount === 1 ? 'Pocket' : 'Pockets'}` : 'Not Active'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Every card transaction is rounded up to the nearest dollar into savings.</p>
          </div>
          <div className="mt-3 text-xs font-semibold text-emerald-600">
            {roundUpsCount > 0 ? `+${formatAmount(38.5)} rounded this month` : 'Enable round-ups below'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Next Target Goal</span>
            <Target className="w-5 h-5 text-sky-500" />
          </div>
          {nextTargetGoal ? (
            <>
              <div className="mt-2">
                <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{nextTargetGoal.emoji}</span>
                  <span>{nextTargetGoal.title}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {nextTargetGoal.targetDate ? `Target: ${nextTargetGoal.targetDate}` : 'No deadline'} ({nextTargetProgress}% completed)
                </p>
              </div>
              <div className="mt-3 text-xs font-semibold text-sky-600">
                {formatAmount(Math.max(0, nextTargetGoal.targetAmount - nextTargetGoal.currentAmount))} remaining
              </div>
            </>
          ) : (
            <div className="mt-2 text-xs text-slate-500">No active goals remaining</div>
          )}
        </div>
      </div>

      {/* Pockets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pockets.map((pocket) => {
          const progress = Math.min(100, Math.round((pocket.currentAmount / pocket.targetAmount) * 100));
          return (
            <div
              key={pocket.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-3xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    {pocket.emoji}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePocketRoundUp(pocket.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                        pocket.autoSaveRoundUp
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title={pocket.autoSaveRoundUp ? 'Round-ups enabled (Click to toggle)' : 'Enable round-ups for this pocket'}
                    >
                      <Sparkles className="w-3 h-3" />
                      {pocket.autoSaveRoundUp ? 'Round-Up' : 'Off'}
                    </button>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {progress}% Reached
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 text-lg">{pocket.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{pocket.category}</span>
                    {pocket.targetDate && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {pocket.targetDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount display */}
                <div className="mt-5 flex justify-between items-baseline">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatAmount(pocket.currentAmount)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Goal: <span className="font-semibold text-slate-700">{formatAmount(pocket.targetAmount)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveTransferPocket({ pocket, action: 'deposit' });
                    setTransferAmount('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setActiveTransferPocket({ pocket, action: 'withdraw' });
                    setTransferAmount('');
                  }}
                  disabled={pocket.currentAmount <= 0}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Withdraw
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${pocket.title}"? Any remaining balance of ${formatAmount(pocket.currentAmount)} will be refunded to your main wallet balance.`)) {
                      deletePocket(pocket.id);
                    }
                  }}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                  title="Delete Pocket"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Deposit/Withdraw Modal */}
      {activeTransferPocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeTransferPocket.pocket.emoji}</span>
                <h3 className="font-bold text-slate-900 text-base">
                  {activeTransferPocket.action === 'deposit' ? 'Deposit to' : 'Withdraw from'}{' '}
                  {activeTransferPocket.pocket.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTransferPocket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-500 mb-1">
                  <span>Amount</span>
                  <span>
                    {activeTransferPocket.action === 'deposit'
                      ? `Wallet Balance: ${formatAmount(balance)}`
                      : `Pocket Balance: ${formatAmount(activeTransferPocket.pocket.currentAmount)}`}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 text-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[25, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTransferAmount(preset.toString())}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    +${preset}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Confirm {activeTransferPocket.action === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Pocket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Create Savings Pocket</h3>
                <p className="text-xs text-slate-500">Lock money away toward a specific life goal</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePocket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 uppercase mb-1">Pocket Icon</label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`text-2xl p-2 rounded-xl border transition-all shrink-0 ${
                        emoji === em ? 'border-emerald-500 bg-emerald-50 scale-110' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 uppercase mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. New Laptop, Paris Vacation, House Downpayment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 uppercase mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <input
                  type="checkbox"
                  id="roundup"
                  checked={autoSaveRoundUp}
                  onChange={(e) => setAutoSaveRoundUp(e.target.checked)}
                  className="text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="roundup" className="cursor-pointer text-slate-700">
                  <div className="font-semibold text-xs text-slate-900">Enable Spare Change Round-Ups</div>
                  <div className="text-[11px] text-slate-500">Automatically transfer change from every card purchase here.</div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Create Pocket Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
