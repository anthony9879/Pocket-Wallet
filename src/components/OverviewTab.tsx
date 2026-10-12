import React, { useState } from 'react';
import { Transaction, VirtualCard, SavingsVault, Contact, UserProfile } from '../types/wallet';
import { 
  Send, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  QrCode, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Zap,
  ArrowRight,
  Split,
  Search
} from 'lucide-react';

interface OverviewTabProps {
  user: UserProfile;
  balances: { [key: string]: number };
  activeCurrency: string;
  setActiveCurrency: (curr: string) => void;
  hideBalance: boolean;
  transactions: Transaction[];
  cards: VirtualCard[];
  vaults: SavingsVault[];
  contacts: Contact[];
  onOpenSend: () => void;
  onOpenAddMoney: () => void;
  onOpenRequest: () => void;
  onOpenQR: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onQuickSendContact: (contact: Contact, amount: number) => void;
  setActiveTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  balances,
  activeCurrency,
  setActiveCurrency,
  hideBalance,
  transactions,
  cards,
  vaults,
  contacts,
  onOpenSend,
  onOpenAddMoney,
  onOpenRequest,
  onOpenQR,
  onSelectTransaction,
  onQuickSendContact,
  setActiveTab,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [txSearch, setTxSearch] = useState('');

  // Primary balance
  const currentBalance = balances[activeCurrency] || 0;

  // Monthly stats
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'in' && t.amount < 0) return false;
    if (filterType === 'out' && t.amount > 0) return false;
    if (txSearch) {
      const match =
        t.title.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.recipientOrSender.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(txSearch.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BTC: '₿ ',
  };

  const symbol = currencySymbols[activeCurrency] || '$';

  return (
    <div className="space-y-6">
      {/* Hero Grid: Balance & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wallet Balance Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
          {/* Subtle glowing orb */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Available Balance</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                  </span>
                </div>

                {/* Multi-currency tabs */}
                <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60">
                  {['USD', 'EUR', 'GBP', 'BTC'].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setActiveCurrency(curr)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeCurrency === curr
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big amount display */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                  {hideBalance ? (
                    '••••••••'
                  ) : (
                    <>
                      {symbol}
                      {currentBalance.toLocaleString('en-US', {
                        minimumFractionDigits: activeCurrency === 'BTC' ? 4 : 2,
                        maximumFractionDigits: activeCurrency === 'BTC' ? 4 : 2,
                      })}
                    </>
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-400">{activeCurrency}</span>
              </div>

              {/* Monthly Flow badge */}
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Income this month: <strong className="text-white">${totalIncome.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Spent this month: <strong className="text-white">${totalExpenses.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={onOpenSend}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Money</span>
              </button>
              <button
                onClick={onOpenRequest}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/90 text-white font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
              >
                <Split className="w-4 h-4 text-cyan-400" />
                <span>Split / Request</span>
              </button>
              <button
                onClick={onOpenAddMoney}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/90 text-white font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Money</span>
              </button>
              <button
                onClick={onOpenQR}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/90 text-white font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pocket Card Glance Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Active Pocket Card</h3>
            </div>
            <button
              onClick={() => setActiveTab('cards')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Card Replica */}
          {cards[0] && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs opacity-85 font-medium">
                <span>{cards[0].name}</span>
                <span className="uppercase font-bold tracking-wider">{cards[0].brand}</span>
              </div>
              <div className="font-mono text-base font-bold tracking-widest pt-2">
                {cards[0].cardNumber}
              </div>
              <div className="flex justify-between items-end text-xs pt-2">
                <div>
                  <div className="text-[10px] opacity-75">HOLDER</div>
                  <div className="font-bold">{cards[0].cardHolder}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] opacity-75">MONTHLY LIMIT</div>
                  <div className="font-bold">${cards[0].spendingLimit}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Freeze / Unlock Protection
            </span>
            <span className="text-emerald-400 font-medium">Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Send to Frequent Contacts */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Quick Instant Pay</h3>
            <span className="text-xs text-slate-400 hidden sm:inline">• 1-tap transfers to friends</span>
          </div>
          <button
            onClick={onOpenSend}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            + Custom Transfer
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {contacts.slice(0, 5).map((contact) => (
            <div
              key={contact.id}
              className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 flex flex-col items-center text-center group transition-all"
            >
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover mb-2 ring-2 ring-slate-700 group-hover:ring-emerald-500 transition-all"
              />
              <span className="text-xs font-bold text-white truncate w-full">{contact.name.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-400 truncate w-full mb-2">{contact.handle}</span>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1 w-full">
                {[15, 30].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onQuickSendContact(contact, amt)}
                    className="flex-1 py-1 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-[11px] font-bold text-slate-200 transition-all active:scale-90"
                    title={`Send $${amt} to ${contact.name}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Row: Savings Vaults Preview & Cashback Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Vaults Snapshot */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Savings Goals & Vaults</h3>
            </div>
            <button
              onClick={() => setActiveTab('vaults')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View All ({vaults.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {vaults.map((vault) => {
              const progress = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
              return (
                <div
                  key={vault.id}
                  onClick={() => setActiveTab('vaults')}
                  className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{vault.emoji}</span>
                    <span className="text-xs font-bold text-cyan-400">{progress}%</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate">{vault.name}</div>
                    <div className="text-xs text-slate-400">
                      ${vault.currentAmount.toLocaleString()} of ${vault.targetAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-full bg-slate-700/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perks & Rewards Snapshot */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Pocket Perks</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Cashback Available
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-white font-mono">${user.cashbackPoints.toFixed(2)}</div>
              <p className="text-xs text-slate-400">Earned from 5% boost on groceries and dining</p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">Active Boosts</span>
              <span className="font-bold text-emerald-400">3 merchants enabled</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('rewards')}
            className="mt-4 w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Redeem Points & Explore Perks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Real-time ledger of debits, credits, transfers & auto-savings</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter transactions..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  filterType === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('in')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  filterType === 'in' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400'
                }`}
              >
                In
              </button>
              <button
                onClick={() => setFilterType('out')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  filterType === 'out' ? 'bg-slate-700 text-rose-400' : 'text-slate-400'
                }`}
              >
                Out
              </button>
            </div>
          </div>
        </div>

        {/* Transaction list items */}
        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions match your search filter.
            </div>
          ) : (
            filteredTransactions.slice(0, 8).map((tx) => {
              const isIncome = tx.amount > 0;
              const formattedDate = new Date(tx.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-800/40 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {tx.avatar ? (
                      <img src={tx.avatar} alt={tx.recipientOrSender} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isIncome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {tx.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{tx.recipientOrSender}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {tx.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {hideBalance ? '•••' : `${isIncome ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{tx.currency}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredTransactions.length > 8 && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab('transfers')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              <span>View full transaction statement</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
