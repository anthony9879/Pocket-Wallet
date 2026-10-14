import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  PiggyBank, 
  Calendar, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { TransactionType, TransactionCategory } from '../types/wallet';

export const ActivityView: React.FC = () => {
  const { transactions, formatAmount, setSelectedTransactionForReceipt, addToast } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.recipientOrSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === 'all' ||
        (filterType === 'send' && tx.type === 'send') ||
        (filterType === 'receive' && (tx.type === 'receive' || tx.type === 'deposit')) ||
        (filterType === 'card' && tx.type === 'card_spend') ||
        (filterType === 'savings' && tx.type === 'pocket_transfer');

      const matchesCategory =
        filterCategory === 'all' || tx.category === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, filterType, filterCategory]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    });
    return { income, expense };
  }, [transactions]);

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Title', 'Party', 'Category', 'Amount', 'Currency', 'Status', 'Note'];
    const rows = filteredTransactions.map((tx) => [
      tx.referenceNumber,
      tx.date,
      tx.type,
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${tx.recipientOrSender.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount.toFixed(2),
      tx.currency,
      tx.status,
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pocket-wallet-statement-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Account statement downloaded as CSV', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity & Statements</h2>
          <p className="text-sm text-slate-500">Track all money transfers, card purchases, and deposits</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Statement (.CSV)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Inflow / Deposits</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              +{formatAmount(stats.income)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Outflow / Spending</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              -{formatAmount(stats.expense)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, contact, note, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="send">Sent Transfers</option>
            <option value="receive">Received & Top-ups</option>
            <option value="card">Card Purchases</option>
            <option value="savings">Pockets / Vaults</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="Transfer">Transfer</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Income">Income</option>
            <option value="Subscriptions">Subscriptions</option>
            <option value="Savings">Savings</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No transactions found</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncoming = tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw';
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransactionForReceipt(tx)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
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
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : tx.type === 'card_spend' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : tx.type === 'pocket_transfer' ? (
                      <PiggyBank className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{tx.title}</h4>
                      <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                      <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                        {tx.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{tx.recipientOrSender}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {tx.cardLast4 && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-mono text-[11px]">•••• {tx.cardLast4}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={`font-extrabold text-sm sm:text-base tabular-nums ${
                        isIncoming ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                      {tx.referenceNumber}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
