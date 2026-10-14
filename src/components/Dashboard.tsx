import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CreditCard, 
  PiggyBank, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Send, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Unlock,
  UserPlus
} from 'lucide-react';
import { Contact } from '../types/wallet';

interface DashboardProps {
  onOpenSend: (recipient?: Contact | null) => void;
  onOpenRequest: () => void;
  onOpenAddFunds: () => void;
  onNavigateTab: (tab: 'overview' | 'send' | 'cards' | 'pockets' | 'activity' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenSend,
  onOpenRequest,
  onOpenAddFunds,
  onNavigateTab,
}) => {
  const { 
    balance, 
    formatAmount, 
    user, 
    cards, 
    pockets, 
    contacts, 
    transactions, 
    toggleFreezeCard,
    setSelectedTransactionForReceipt,
    addContact 
  } = useWallet();

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactHandle, setNewContactHandle] = useState('');

  // Quick stats calculations
  const totalInflow = transactions
    .filter((tx) => tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = transactions
    .filter((tx) => tx.type === 'send' || tx.type === 'card_spend')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const primaryCard = cards[0];

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const cleanHandle = newContactHandle.startsWith('@')
      ? newContactHandle
      : `@${newContactHandle || newContactName.toLowerCase().replace(/\s+/g, '_')}`;

    addContact({
      name: newContactName,
      handle: cleanHandle,
      email: `${newContactName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
    });

    setIsAddContactOpen(false);
    setNewContactName('');
    setNewContactHandle('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Balance Section & Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span>Main Wallet Balance</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            
            <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatAmount(balance)}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +{formatAmount(totalInflow)} in
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                -{formatAmount(totalOutflow)} out
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono">Tier: {user.tier}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenSend()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Send Money
            </button>

            <button
              onClick={onOpenRequest}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              Request / QR
            </button>

            <button
              onClick={onOpenAddFunds}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Quick Pay Contact Avatars Carousel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Quick Send with PocketPay</h3>
            <p className="text-xs text-slate-500">Tap any contact to transfer money in seconds</p>
          </div>
          <button
            onClick={() => setIsAddContactOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onOpenSend(contact)}
              className="flex flex-col items-center gap-2 group shrink-0"
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-emerald-500 transition-all group-hover:scale-105"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                  ⚡
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors text-center w-16 truncate">
                {contact.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Section: Active Cards on Left, Savings Goals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Cards Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pocket Cards</h3>
              <p className="text-xs text-slate-500">{cards.length} active debit cards</p>
            </div>
            <button
              onClick={() => onNavigateTab('cards')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Manage Cards
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {primaryCard && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
              {primaryCard.isFrozen && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-20 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <Lock className="w-4 h-4" />
                  Card is Currently Frozen
                </div>
              )}

              <div className="flex justify-between items-start text-xs text-slate-400">
                <span className="uppercase font-semibold tracking-wider">{primaryCard.name}</span>
                <span className="font-bold text-white italic">{primaryCard.brand.toUpperCase()}</span>
              </div>

              <div className="mt-4 font-mono text-lg tracking-wider text-white/90">
                •••• •••• •••• {primaryCard.last4}
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Spent this month</span>
                  <span className="font-semibold text-white">{formatAmount(primaryCard.currentSpent)}</span>
                </div>
                <button
                  onClick={() => toggleFreezeCard(primaryCard.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  {primaryCard.isFrozen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {primaryCard.isFrozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px] block">Virtual Protection</span>
              <span className="font-semibold text-emerald-600">CVV Auto-refresh</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px] block">Apple / Google Pay</span>
              <span className="font-semibold text-emerald-600">Ready to tap</span>
            </div>
          </div>
        </div>

        {/* Savings Goals / Pockets Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Savings Pockets</h3>
              <p className="text-xs text-slate-500">Automated savings & locked goals</p>
            </div>
            <button
              onClick={() => onNavigateTab('pockets')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View All Goals
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pockets.slice(0, 3).map((pocket) => {
              const pct = Math.min(100, Math.round((pocket.currentAmount / pocket.targetAmount) * 100));
              return (
                <div
                  key={pocket.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{pocket.emoji}</span>
                      <span className="font-semibold text-slate-900">{pocket.title}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatAmount(pocket.currentAmount)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>{pct}% reached</span>
                    <span>Goal: {formatAmount(pocket.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs flex items-center justify-between text-emerald-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Auto-save roundups generated +$38.50 this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Snippet */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest wallet activity and card spends</p>
          </div>
          <button
            onClick={() => onNavigateTab('activity')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map((tx) => {
            const isIncoming = tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw';
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransactionForReceipt(tx)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isIncoming
                        ? 'bg-emerald-50 text-emerald-600'
                        : tx.type === 'card_spend'
                        ? 'bg-slate-100 text-slate-700'
                        : tx.type === 'pocket_transfer'
                        ? 'bg-sky-50 text-sky-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncoming ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'card_spend' ? (
                      <CreditCard className="w-4 h-4" />
                    ) : tx.type === 'pocket_transfer' ? (
                      <PiggyBank className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{tx.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {tx.recipientOrSender} ·{' '}
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold text-xs sm:text-sm ${
                      isIncoming ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncoming ? '+' : '-'}
                    {formatAmount(tx.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Receipt</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Add PocketPay Contact</h4>
            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold uppercase mb-1">PocketPay @handle</label>
                <input
                  type="text"
                  placeholder="@jordan_l"
                  value={newContactHandle}
                  onChange={(e) => setNewContactHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
