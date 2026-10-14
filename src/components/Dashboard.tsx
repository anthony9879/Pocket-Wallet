import React, { useState, useMemo } from 'react';
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
  Send, 
  QrCode, 
  Lock, 
  Unlock,
  UserPlus,
  PieChart,
  Shield,
  X
} from 'lucide-react';
import { Contact, TransactionCategory } from '../types/wallet';
import { UserAvatar } from './UserAvatar';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface DashboardProps {
  onOpenSend: (recipient?: Contact | null) => void;
  onOpenRequest: () => void;
  onOpenAddFunds: () => void;
  onNavigateTab: (tab: 'overview' | 'send' | 'cards' | 'pockets' | 'activity' | 'settings') => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-amber-500',
  'Shopping': 'bg-purple-500',
  'Subscriptions': 'bg-blue-500',
  'Entertainment': 'bg-rose-500',
  'Bills & Utilities': 'bg-orange-500',
  'Travel': 'bg-emerald-500',
  'Savings': 'bg-teal-500',
  'Transfer': 'bg-slate-500',
};

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

  useBodyScrollLock(isAddContactOpen);

  // Quick stats calculations
  const totalInflow = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const totalOutflow = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'send' || tx.type === 'card_spend')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Spending breakdown by category
  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter(
      (tx) => tx.type === 'send' || tx.type === 'card_spend'
    );
    const map = new Map<string, number>();
    let total = 0;

    expenses.forEach((tx) => {
      total += tx.amount;
      map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
    });

    if (total === 0) return [];

    return Array.from(map.entries())
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: Math.round((amt / total) * 100),
        color: CATEGORY_COLORS[cat] || 'bg-slate-500',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

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
      avatar: '',
    });

    setIsAddContactOpen(false);
    setNewContactName('');
    setNewContactHandle('');
  };

  return (
    <div className="space-y-8">
      {/* 1. Hero Balance Banner & Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-900">
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Total Available Balance
            </div>
            
            <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight font-sans tabular-nums">
              {formatAmount(balance)}
            </div>

            {/* Unboxed clean metadata with · separators */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +{formatAmount(totalInflow)} in
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                -{formatAmount(totalOutflow)} out
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">{user.tier} Tier</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Zero Fees</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenSend()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </button>

            <button
              onClick={onOpenRequest}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs whitespace-nowrap backdrop-blur-md transition-all active:scale-95 border border-white/10"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Request / QR</span>
            </button>

            <button
              onClick={onOpenAddFunds}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs whitespace-nowrap backdrop-blur-md transition-all active:scale-95 border border-white/10"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Send to Contacts Carousel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Quick Pay Contacts</h3>
            <p className="text-xs text-slate-500">Tap any friend to transfer funds instantly</p>
          </div>
          <button
            onClick={() => setIsAddContactOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onOpenSend(contact)}
              className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none"
            >
              <div className="relative">
                <UserAvatar
                  name={contact.name}
                  avatar={contact.avatar}
                  size="lg"
                  className="group-hover:scale-105 transition-transform ring-2 ring-transparent group-hover:ring-emerald-500"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] text-emerald-400 font-bold shadow-xs">
                  ⚡
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors text-center w-18 truncate">
                {contact.name.split(' ')[0]}
              </span>
            </button>
          ))}

          {/* Quick Add Contact Button in Carousel */}
          <button
            onClick={() => setIsAddContactOpen(true)}
            className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-600 transition-colors text-center w-18 truncate">
              New
            </span>
          </button>
        </div>
      </div>

      {/* 3. Two Column Section: Pocket Card Snapshot & Spending Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Primary Card Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pocket Card</h3>
              <p className="text-xs text-slate-500">{cards.length} active debit cards linked</p>
            </div>
            <button
              onClick={() => onNavigateTab('cards')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>Manage Cards</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {primaryCard && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden border border-slate-800">
              {primaryCard.isFrozen && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-20 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <Lock className="w-4 h-4" />
                  <span>Card is Frozen</span>
                </div>
              )}

              <div className="flex justify-between items-start text-xs text-slate-400">
                <span className="uppercase font-semibold tracking-wider text-[11px]">{primaryCard.name}</span>
                <span className="font-bold text-white tracking-widest text-sm">{primaryCard.brand.toUpperCase()}</span>
              </div>

              <div className="mt-5 font-mono text-xl tracking-widest text-white/95 font-semibold">
                •••• •••• •••• {primaryCard.last4}
              </div>

              <div className="mt-5 flex justify-between items-end text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Monthly Spent</span>
                  <span className="font-bold text-white text-sm tabular-nums">{formatAmount(primaryCard.currentSpent)}</span>
                  <span className="text-slate-400 text-[11px] ml-1">/ {formatAmount(primaryCard.monthlyLimit)}</span>
                </div>
                <button
                  onClick={() => toggleFreezeCard(primaryCard.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {primaryCard.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{primaryCard.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 text-[11px] block">Virtual Protection</span>
              <span className="font-semibold text-slate-900">Dynamic CVV Guard</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 text-[11px] block">Digital Wallets</span>
              <span className="font-semibold text-emerald-600">Apple & Google Pay Ready</span>
            </div>
          </div>
        </div>

        {/* Spending Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Outflow Breakdown</h3>
              <p className="text-xs text-slate-500">Expenses grouped by transaction category</p>
            </div>
            <span className="text-xs font-semibold font-mono text-slate-500">
              {formatAmount(totalOutflow)} total
            </span>
          </div>

          {/* Multi-segment progress bar */}
          <div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {categoryBreakdown.map((item) => (
                <div
                  key={item.category}
                  className={`${item.color} h-full transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.category}: ${item.percentage}%`}
                />
              ))}
            </div>

            {/* Category breakdown items list */}
            <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
              {categoryBreakdown.slice(0, 6).map((item) => (
                <div
                  key={item.category}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                    <span className="text-slate-700 font-medium truncate">{item.category}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatAmount(item.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">Estimated Monthly Savings Rate:</span>
            <span className="font-bold text-emerald-600">
              {totalInflow > 0 ? Math.max(0, Math.round(((totalInflow - totalOutflow) / totalInflow) * 100)) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Two Column Section: Savings Goals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Savings Goals Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Savings Pockets</h3>
              <p className="text-xs text-slate-500">Target vaults & locked savings</p>
            </div>
            <button
              onClick={() => onNavigateTab('pockets')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>View All</span>
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
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatAmount(pocket.currentAmount)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>{pct}% reached</span>
                    <span>Goal: {formatAmount(pocket.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigateTab('pockets')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>Manage Savings Goals</span>
          </button>
        </div>

        {/* Recent Transactions List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Tap any transaction to view official receipt</p>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>View Statement</span>
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
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer rounded-2xl px-2 transition-colors"
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
                      <div className="text-[11px] text-slate-500">
                        <span>{tx.recipientOrSender}</span>
                        <span aria-hidden="true" className="mx-1">·</span>
                        <span>
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold text-xs sm:text-sm tabular-nums ${
                        isIncoming ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tx.referenceNumber.split('-').slice(0, 2).join('-')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base">Add Pocket Contact</h4>
              <button
                onClick={() => setIsAddContactOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
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
