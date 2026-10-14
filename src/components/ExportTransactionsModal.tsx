import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle2, 
  Filter, 
  Calendar,
  Layers
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { downloadTransactionsCSV, downloadTransactionsJSON } from '../utils/exportTransactions';

interface ExportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportTransactionsModal: React.FC<ExportTransactionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions, currency, formatAmount, addToast } = useWallet();
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | 'year'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'pocket'>('all');
  const [isExporting, setIsExporting] = useState(false);

  useBodyScrollLock(isOpen);

  // Filtered transactions based on selected options
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);

      // Date range filtering
      if (dateRange === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (txDate < thirtyDaysAgo) return false;
      } else if (dateRange === '90d') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (txDate < ninetyDaysAgo) return false;
      } else if (dateRange === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        if (txDate < startOfYear) return false;
      }

      // Type filtering
      const isIncoming = tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw';
      if (typeFilter === 'income' && !isIncoming) return false;
      if (typeFilter === 'expense' && (isIncoming || tx.type === 'pocket_transfer')) return false;
      if (typeFilter === 'pocket' && tx.type !== 'pocket_transfer') return false;

      return true;
    });
  }, [transactions, dateRange, typeFilter]);

  const totalVolume = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [filteredTransactions]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (filteredTransactions.length === 0) {
      addToast('No transactions match the selected filters', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const filename = `pocket-wallet-${dateRange}-${today}.${format}`;

      if (format === 'csv') {
        downloadTransactionsCSV(filteredTransactions, currency, filename);
        addToast(`Downloaded ${filteredTransactions.length} transactions as CSV`, 'success');
      } else {
        downloadTransactionsJSON(filteredTransactions, filename);
        addToast(`Exported ${filteredTransactions.length} transactions as JSON`, 'success');
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 400);
    } catch {
      setIsExporting(false);
      addToast('Failed to download transaction history', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90dvh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Download History</h3>
              <p className="text-xs text-slate-500">Export statement & transactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-0.5 text-xs">
          {/* Format Selection */}
          <div>
            <label className="block font-semibold text-slate-600 uppercase mb-1.5">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  format === 'csv'
                    ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${format === 'csv' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>CSV Spreadsheet</span>
                    {format === 'csv' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Excel, Sheets, Numbers</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  format === 'json'
                    ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${format === 'json' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>JSON Raw Data</span>
                    {format === 'json' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Structured backup</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block font-semibold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Timeframe</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all' as const, label: 'All Time' },
                { id: '30d' as const, label: 'Last 30D' },
                { id: '90d' as const, label: 'Last 90D' },
                { id: 'year' as const, label: 'This Year' },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setDateRange(range.id)}
                  className={`py-2 px-2 rounded-xl text-center font-medium transition-all text-xs ${
                    dateRange === range.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block font-semibold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Transaction Type</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all' as const, label: 'All Transactions' },
                { id: 'income' as const, label: 'Credits & Inflow' },
                { id: 'expense' as const, label: 'Expenses & Debits' },
                { id: 'pocket' as const, label: 'Pocket Savings' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTypeFilter(type.id)}
                  className={`py-2 px-3 rounded-xl text-left font-medium transition-all text-xs border ${
                    typeFilter === type.id
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Preview Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-semibold text-slate-900 text-xs">
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'} Ready
                </div>
                <div className="text-[11px] text-slate-500">
                  Total Volume: {formatAmount(totalVolume)}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white border border-slate-200 text-slate-700">
              {format.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2.5 pt-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={filteredTransactions.length === 0 || isExporting}
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Downloading...' : `Download ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
