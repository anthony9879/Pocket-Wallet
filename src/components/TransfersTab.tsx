import React, { useState } from 'react';
import { Transaction, Contact, Category } from '../types/wallet';
import { 
  Send, 
  Split, 
  QrCode, 
  Search, 
  Download, 
  Star, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface TransfersTabProps {
  contacts: Contact[];
  transactions: Transaction[];
  onOpenSend: () => void;
  onOpenRequest: () => void;
  onOpenQR: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onQuickSendContact: (contact: Contact, amount: number) => void;
  onToggleFavoriteContact: (id: string) => void;
}

export const TransfersTab: React.FC<TransfersTabProps> = ({
  contacts,
  transactions,
  onOpenSend,
  onOpenRequest,
  onOpenQR,
  onSelectTransaction,
  onQuickSendContact,
  onToggleFavoriteContact,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [contactSearch, setContactSearch] = useState('');
  const [exportNotice, setExportNotice] = useState(false);

  const categories = ['All', 'Transfers', 'Food & Dining', 'Shopping', 'Entertainment', 'Income & Salary', 'Bills & Utilities', 'Savings'];

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        tx.title.toLowerCase().includes(q) ||
        tx.recipientOrSender.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filter contacts
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.handle.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleExportCSV = () => {
    // Generate CSV data and trigger download
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

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Transfers & Peer-to-Peer Payments</h2>
          <p className="text-xs text-slate-400">Send money instantly, split group bills, or request payments with zero fees</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenSend}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>
          <button
            onClick={onOpenRequest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Bill</span>
          </button>
          <button
            onClick={onOpenQR}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>QR Scanner</span>
          </button>
        </div>
      </div>

      {/* Contacts & Frequent Beneficiaries Directory */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Pocket Contacts</h3>
            <span className="text-xs text-slate-400">({contacts.length} saved)</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 relative group"
            >
              <button
                type="button"
                onClick={() => onToggleFavoriteContact(contact.id)}
                className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-amber-400 transition-colors"
                title={contact.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
              >
                <Star className={`w-3.5 h-3.5 ${contact.favorite ? 'text-amber-400 fill-amber-400' : ''}`} />
              </button>

              <div className="flex items-center gap-3">
                <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-700" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{contact.name}</div>
                  <div className="text-[11px] text-emerald-400 font-medium truncate">{contact.handle}</div>
                </div>
              </div>

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

      {/* Comprehensive Statement & Transaction History */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-white">Full Transaction Ledger</h3>
            <p className="text-xs text-slate-400">View details, receipts, reference numbers, or export CSV statement</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{exportNotice ? 'Statement Downloaded!' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filter bar & Category chips */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  selectedCategory === cat
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Detailed Table / List */}
        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No transactions found matching your criteria.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.amount > 0;
              const formattedDate = new Date(tx.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3.5 px-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                        <span>{tx.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                          ({tx.referenceNumber})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300">{tx.recipientOrSender}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
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
                      className={`text-sm font-bold font-mono ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 justify-end text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tx.status}</span>
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
