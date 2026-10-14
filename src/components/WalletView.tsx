import React, { useState, useMemo, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CreditCard, 
  PiggyBank, 
  ChevronLeft,
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  QrCode, 
  Lock, 
  Unlock, 
  UserPlus,
  X,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { Contact } from '../types/wallet';
import { UserAvatar } from './UserAvatar';
import { TabType } from './BottomNav';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ExportTransactionsModal } from './ExportTransactionsModal';
import { downloadTransactionsCSV } from '../utils/exportTransactions';

interface WalletViewProps {
  onOpenSendModal: (recipient?: Contact | null) => void;
  onOpenRequestModal: () => void;
  onOpenAddFundsModal: () => void;
  onNavigateTab: (tab: TabType) => void;
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

export const WalletView: React.FC<WalletViewProps> = ({
  onOpenSendModal,
  onOpenRequestModal,
  onOpenAddFundsModal,
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
    addContact,
    currency,
    addToast,
  } = useWallet();

  // Quick Contact Addition State
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactHandle, setNewContactHandle] = useState('');

  // Transaction History Export & Display State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useBodyScrollLock(isAddContactOpen || isExportModalOpen);

  // Calculations
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

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardSwipeTouchStart = useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (cards.length > 0 && activeCardIndex >= cards.length) {
      setActiveCardIndex(Math.max(0, cards.length - 1));
    }
  }, [cards.length, activeCardIndex]);

  const displayedCard = cards[activeCardIndex] || cards[0];

  const walletCardDragStart = useRef<{ x: number; time: number } | null>(null);

  const handleCardTouchStart = (e: React.TouchEvent) => {
    cardSwipeTouchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (!cardSwipeTouchStart.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = cardSwipeTouchStart.current.x - endX;
    const diffY = Math.abs(cardSwipeTouchStart.current.y - endY);

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        setActiveCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
      } else {
        setActiveCardIndex((prev) => Math.max(0, prev - 1));
      }
    }
    cardSwipeTouchStart.current = null;
  };

  const handleCardMouseDown = (e: React.MouseEvent) => {
    walletCardDragStart.current = { x: e.clientX, time: Date.now() };
  };

  const handleCardMouseUp = (e: React.MouseEvent) => {
    if (!walletCardDragStart.current) return;
    const diffX = walletCardDragStart.current.x - e.clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        setActiveCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
      } else {
        setActiveCardIndex((prev) => Math.max(0, prev - 1));
      }
    }
    walletCardDragStart.current = null;
  };

  const getCardGradient = (scheme?: string) => {
    switch (scheme) {
      case 'emerald':
        return 'from-emerald-700 via-teal-800 to-emerald-950 text-white';
      case 'slate':
        return 'from-slate-900 via-slate-800 to-zinc-950 text-white';
      case 'violet':
        return 'from-violet-800 via-purple-900 to-indigo-950 text-white';
      case 'amber':
        return 'from-amber-600 via-orange-700 to-stone-900 text-white';
      case 'rose':
        return 'from-rose-700 via-pink-800 to-rose-950 text-white';
      case 'ocean':
        return 'from-blue-700 via-cyan-800 to-slate-900 text-white';
      default:
        return 'from-slate-900 via-slate-800 to-slate-950 text-white';
    }
  };

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
    <div className="space-y-8 animate-fade-in">
      {/* 1. Hero Balance Showcase with Instant Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-900">
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Total Wallet Balance
            </div>
            
            <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight font-sans tabular-nums">
              {formatAmount(balance)}
            </div>

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

          {/* Action CTAs: Send, Request, Add Funds */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenSendModal(null)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </button>

            <button
              onClick={onOpenRequestModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs whitespace-nowrap backdrop-blur-md transition-all active:scale-95 border border-white/10"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Request / QR</span>
            </button>

            <button
              onClick={onOpenAddFundsModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs whitespace-nowrap backdrop-blur-md transition-all active:scale-95 border border-white/10"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overview Main Content */}
      <div className="space-y-8">
        {/* Quick Pay Contacts */}
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
                onClick={() => onOpenSendModal(contact)}
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

        {/* Pocket Card & Spending Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pocket Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pocket Card</h3>
                <p className="text-xs text-slate-500">
                  {cards.length} active debit cards · Card {activeCardIndex + 1} of {cards.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {cards.length > 1 && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      onClick={() => setActiveCardIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeCardIndex === 0}
                      aria-label="Previous card"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveCardIndex((prev) => Math.min(cards.length - 1, prev + 1))}
                      disabled={activeCardIndex === cards.length - 1}
                      aria-label="Next card"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => onNavigateTab('cards')}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {displayedCard ? (
              <div 
                onTouchStart={handleCardTouchStart}
                onTouchEnd={handleCardTouchEnd}
                onMouseDown={handleCardMouseDown}
                onMouseUp={handleCardMouseUp}
                className={`p-6 rounded-2xl bg-gradient-to-br ${getCardGradient(displayedCard.colorScheme)} text-white shadow-md relative overflow-hidden border border-white/10 select-none cursor-grab active:cursor-grabbing transition-all duration-300`}
              >
                {displayedCard.isFrozen && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-20 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                    <Lock className="w-4 h-4" />
                    <span>Card is Frozen</span>
                  </div>
                )}

                <div className="flex justify-between items-start text-xs text-slate-300">
                  <span className="uppercase font-semibold tracking-wider text-[11px]">{displayedCard.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded uppercase font-medium">{displayedCard.type}</span>
                    <span className="font-bold text-white tracking-widest text-sm">{displayedCard.brand.toUpperCase()}</span>
                  </div>
                </div>

                <div className="mt-5 font-mono text-xl tracking-widest text-white/95 font-semibold">
                  •••• •••• •••• {displayedCard.last4}
                </div>

                <div className="mt-5 flex justify-between items-end text-xs">
                  <div>
                    <span className="text-[10px] text-white/70 uppercase tracking-wider block">Monthly Spent</span>
                    <span className="font-bold text-white text-sm tabular-nums">{formatAmount(displayedCard.currentSpent)}</span>
                    <span className="text-white/60 text-[11px] ml-1">/ {formatAmount(displayedCard.monthlyLimit)}</span>
                  </div>
                  <button
                    onClick={() => toggleFreezeCard(displayedCard.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {displayedCard.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{displayedCard.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center py-7">
                <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No active cards</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Add a virtual card to start making payments</p>
                <button
                  onClick={() => onNavigateTab('cards')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Create Virtual Card
                </button>
              </div>
            )}

            {/* Pagination dots & swipe hint */}
            {cards.length > 1 && (
              <div className="flex items-center justify-between -mt-2 px-1 text-xs text-slate-400">
                <span className="text-[11px] inline-flex items-center gap-1">
                  <span>↔</span> Swipe to view
                </span>
                <div className="flex items-center gap-1.5">
                  {cards.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCardIndex(i)}
                      aria-label={`View ${c.name}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeCardIndex === i ? 'w-5 bg-slate-900' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
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
                <span className="font-semibold text-emerald-600">Apple & Google Pay</span>
              </div>
            </div>
          </div>

          {/* Outflow Breakdown */}
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

        {/* Pockets Snapshot & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pockets */}
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

          {/* Recent Transactions List with Download/Export Options */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Tap any transaction to view official receipt</p>
              </div>

              {/* Action Buttons: Quick Download CSV and Custom Export */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (transactions.length === 0) {
                      addToast('No transactions to download', 'info');
                      return;
                    }
                    downloadTransactionsCSV(transactions, currency);
                    addToast(`Downloaded ${transactions.length} transactions as CSV`, 'success');
                  }}
                  title="Instant 1-Click CSV Download"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  title="Download and customize transaction statement"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Download History</span>
                  <span className="sm:hidden">Export</span>
                </button>

                <span className="text-xs font-semibold text-slate-400 ml-1">
                  {transactions.length} total
                </span>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No transactions recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Send, request, or add funds to see your activity here.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {(showAllTransactions ? transactions : transactions.slice(0, 6)).map((tx) => {
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

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold text-xs sm:text-sm tabular-nums ${
                              isIncoming ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {isIncoming ? '+' : '-'}
                            {formatAmount(tx.amount)}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {transactions.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition-colors mt-2"
                  >
                    {showAllTransactions
                      ? 'Show Less (6 Transactions)'
                      : `View All (${transactions.length} Transactions)`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[88dvh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between shrink-0">
              <h4 className="font-bold text-slate-900 text-base">Add Pocket Contact</h4>
              <button
                onClick={() => setIsAddContactOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs overflow-y-auto flex-1 pr-0.5">
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

      {/* Export Transactions Modal */}
      <ExportTransactionsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
