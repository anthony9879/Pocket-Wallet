import React, { useState } from 'react';
import { Transaction, VirtualCard, SavingsVault, Contact, UserProfile, PerkOffer } from '../types/wallet';
import { 
  Send, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  QrCode, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  Split,
  Search,
  Users,
  Star,
  Download,
  CheckCircle2,
  Filter,
  Zap,
  Gift,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { VirtualCardWalletDeck } from './VirtualCardWalletDeck';
import confetti from 'canvas-confetti';

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
  perks?: PerkOffer[];
  onTogglePerk?: (perkId: string) => void;
  onRedeemCashback?: (amount: number) => void;
  onOpenSend: () => void;
  onOpenAddMoney: () => void;
  onOpenRequest: () => void;
  onOpenQR: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onQuickSendContact: (contact: Contact, amount: number) => void;
  setActiveTab: (tab: string) => void;
  onToggleFreezeCard?: (cardId: string) => void;
  onUpdateLimit?: (cardId: string, newLimit: number) => void;
  onOpenNewCardModal?: () => void;
  onToggleFavoriteContact?: (id: string) => void;
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
  perks = [],
  onTogglePerk,
  onRedeemCashback,
  onOpenSend,
  onOpenAddMoney,
  onOpenRequest,
  onOpenQR,
  onSelectTransaction,
  onQuickSendContact,
  setActiveTab,
  onToggleFreezeCard,
  onUpdateLimit,
  onOpenNewCardModal,
  onToggleFavoriteContact,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [txSearch, setTxSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [isPerksHubOpen, setIsPerksHubOpen] = useState(false);
  const [redeemedNotice, setRedeemedNotice] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Primary balance
  const currentBalance = balances[activeCurrency] || 0;

  // Monthly stats
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Category options for statement filtering
  const categories = ['All', 'Transfers', 'Food & Dining', 'Shopping', 'Entertainment', 'Income & Salary', 'Bills & Utilities', 'Savings'];

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'All' && t.category !== filterType) return false;
    if (txSearch) {
      const q = txSearch.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.recipientOrSender.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.referenceNumber.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    if (showOnlyFavorites && !c.favorite) return false;
    if (!contactSearch) return true;
    const q = contactSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q);
  });

  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BTC: '₿ ',
  };

  const symbol = currencySymbols[activeCurrency] || '$';

  // Referral link
  const referralLink = `https://pocketpay.me/join/${user.handle.replace('@', '')}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleRedeem = () => {
    if (user.cashbackPoints <= 0 || !onRedeemCashback) return;

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });

    onRedeemCashback(user.cashbackPoints);
    setRedeemedNotice(true);
    setTimeout(() => setRedeemedNotice(false), 3000);
  };

  // Export CSV Statement
  const handleExportCSV = () => {
    const headers = ['Reference', 'Title', 'Recipient/Sender', 'Amount', 'Currency', 'Category', 'Date', 'Status', 'Note'];
    const rows = filteredTransactions.map((tx) => [
      tx.referenceNumber,
      `"${tx.title}"`,
      `"${tx.recipientOrSender}"`,
      tx.amount,
      tx.currency,
      tx.category,
      tx.timestamp,
      tx.status,
      `"${tx.note || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pocket_wallet_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const activeBoostsCount = perks.filter(p => p.isActive).length;

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Hero Grid: Balance, Fast Transfers & Swipeable Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wallet Balance & Quick Actions Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
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
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono tabular-nums">
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
                <span className="text-sm font-semibold text-slate-400">{activeCurrency}</span>
              </div>

              {/* Monthly Flow summary */}
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Income this month: <strong className="text-white font-mono tabular-nums">${totalIncome.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Spent this month: <strong className="text-white font-mono tabular-nums">${totalExpenses.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Transfer & Action Button Bar */}
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
                <span>QR Scanner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Swipeable Virtual Cards Deck in Wallet */}
        <VirtualCardWalletDeck
          cards={cards}
          onToggleFreezeCard={onToggleFreezeCard}
          onUpdateLimit={onUpdateLimit}
          onOpenNewCardModal={onOpenNewCardModal}
          onManageCards={() => setActiveTab('cards')}
        />
      </div>

      {/* Merged P2P Transfers & Beneficiaries Hub */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Peer-to-Peer Transfers & Contacts</h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">({contacts.length})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter favorites toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
                showOnlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites</span>
            </button>

            {/* Contacts search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search friend..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Contacts Grid with 1-Tap Quick Pay & Favorite Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 relative group"
            >
              {onToggleFavoriteContact && (
                <button
                  type="button"
                  onClick={() => onToggleFavoriteContact(contact.id)}
                  className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-amber-400 transition-colors"
                  title={contact.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
                >
                  <Star className={`w-3.5 h-3.5 ${contact.favorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
              )}

              <div className="flex items-center gap-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-700"
                />
                <div className="min-w-0 pr-5">
                  <div className="text-xs font-bold text-white truncate">{contact.name}</div>
                  <div className="text-[11px] text-emerald-400 font-medium truncate">{contact.handle}</div>
                </div>
              </div>

              {/* 1-Tap Pay Action Presets */}
              <div className="pt-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => onQuickSendContact(contact, 25)}
                  className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold border border-emerald-500/30 transition-all active:scale-95"
                >
                  Send $25
                </button>
                <button
                  type="button"
                  onClick={onOpenSend}
                  className="py-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[11px] font-medium transition-colors"
                  title="Custom Amount"
                >
                  Custom
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Row: Savings Vaults Preview & Fully Integrated Perks Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Vaults Snapshot */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Savings Goals & Vaults</h3>
            </div>
            <button
              onClick={() => setActiveTab('savings-insights')}
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
                  onClick={() => setActiveTab('savings-insights')}
                  className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{vault.emoji}</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono tabular-nums">{progress}%</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate">{vault.name}</div>
                    <div className="text-xs text-slate-400 font-mono tabular-nums">
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

        {/* Pocket Perks & Claimable Cashback Hub (Integrated into Wallet) */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Pocket Perks & Cashback</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Live Rewards
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                ${user.cashbackPoints.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Available cash back from merchant boosters</p>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">Active Boosts</span>
              <span className="font-bold text-emerald-400">{activeBoostsCount} merchants enabled</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {/* 1-Tap Instant Redeem to Balance Button */}
            <button
              onClick={handleRedeem}
              disabled={user.cashbackPoints <= 0}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                user.cashbackPoints > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{redeemedNotice ? 'Redeemed to Wallet Balance!' : 'Redeem to Wallet Balance'}</span>
            </button>

            {/* Toggle Merchant Boosters & Referral hub */}
            <button
              onClick={() => setIsPerksHubOpen(!isPerksHubOpen)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isPerksHubOpen ? 'Hide Merchant Boosts' : 'View Boosts & $15 Referral'}</span>
              {isPerksHubOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Perks & Referral Hub (Accessible right inside the Wallet menu) */}
      {isPerksHubOpen && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-base text-white">Merchant Boosters & Cash Deals</h3>
              </div>
              <p className="text-xs text-slate-400">Activate boosts before paying with your Pocket Card for instant cashback credits</p>
            </div>
            <button
              onClick={() => setIsPerksHubOpen(false)}
              className="text-xs text-slate-400 hover:text-white self-start sm:self-auto underline"
            >
              Close Boosts
            </button>
          </div>

          {/* Boosters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {perks.map((perk) => (
              <div
                key={perk.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  perk.isActive
                    ? 'bg-slate-800/80 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">
                        {perk.logo}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{perk.merchant}</h4>
                        <span className="text-[11px] text-slate-400">{perk.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {perk.cashbackPercent}% Back
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{perk.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{perk.expiresIn}</span>
                  {onTogglePerk && (
                    <button
                      type="button"
                      onClick={() => onTogglePerk(perk.id)}
                      className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                        perk.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {perk.isActive ? 'Boost Active' : 'Activate Boost'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Referral Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Give $15, Get $15 Referral Reward</h4>
              </div>
              <p className="text-xs text-slate-300 max-w-lg">
                Share your invite link with friends. When they activate their Pocket Wallet, both accounts get an instant $15 cash bonus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 truncate max-w-xs">
                {referralLink}
              </div>
              <button
                onClick={handleCopyReferral}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors"
              >
                {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReferral ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Statement & Transaction Ledger */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-white">Transaction Ledger & History</h3>
            <p className="text-xs text-slate-400">Real-time ledger of debits, credits, transfers & auto-savings</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export CSV statement button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{exportNotice ? 'Statement Downloaded!' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  filterType === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, note, title..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full sm:w-60 bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Transaction list items */}
        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions match your search filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
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
                      <img src={tx.avatar} alt={tx.recipientOrSender} className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-700" />
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
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                        <span>{tx.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline tabular-nums">
                          ({tx.referenceNumber})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300">{tx.recipientOrSender}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {tx.category}
                        </span>
                        {tx.note && (
                          <span className="italic text-slate-400 truncate max-w-xs hidden md:inline">
                            "{tx.note}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono tabular-nums ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {hideBalance ? '•••' : `${isIncome ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <div className="flex items-center gap-1 justify-end text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
