import React from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  PiggyBank, 
  CheckCircle, 
  Clock, 
  Share2, 
  Printer, 
  Copy,
  ShieldCheck 
} from 'lucide-react';

export const TransactionReceiptModal: React.FC = () => {
  const { selectedTransactionForReceipt, setSelectedTransactionForReceipt, formatAmount, addToast } = useWallet();

  if (!selectedTransactionForReceipt) return null;

  const tx = selectedTransactionForReceipt;
  const isIncoming = tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw';

  const copyRef = () => {
    navigator.clipboard?.writeText(tx.referenceNumber);
    addToast('Reference number copied to clipboard', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Pattern */}
        <div className={`p-6 pb-8 text-center text-white relative ${
          isIncoming 
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700' 
            : tx.type === 'pocket_transfer'
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        }`}>
          <button
            onClick={() => setSelectedTransactionForReceipt(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md mb-3 ring-4 ring-white/10">
            {tx.type === 'send' && <ArrowUpRight className="w-7 h-7 text-white" />}
            {tx.type === 'receive' && <ArrowDownLeft className="w-7 h-7 text-emerald-200" />}
            {tx.type === 'deposit' && <ArrowDownLeft className="w-7 h-7 text-teal-200" />}
            {tx.type === 'card_spend' && <CreditCard className="w-7 h-7 text-white" />}
            {tx.type === 'pocket_transfer' && <PiggyBank className="w-7 h-7 text-sky-200" />}
          </div>

          <h2 className="text-xl font-bold">{tx.title}</h2>
          <p className="text-white/80 text-sm mt-0.5">{tx.recipientOrSender}</p>

          <div className="mt-4 text-3xl font-extrabold tracking-tight">
            {isIncoming ? '+' : '-'}{formatAmount(tx.amount)}
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{tx.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Transaction ID</span>
              <button 
                onClick={copyRef} 
                className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
              >
                {tx.referenceNumber}
                <Copy className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-medium text-slate-800">
                {new Date(tx.date).toLocaleString(undefined, { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Category</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                {tx.category}
              </span>
            </div>

            {tx.cardLast4 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  Card ending in •••• {tx.cardLast4}
                </span>
              </div>
            )}

            {tx.recipientHandle && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">PocketPay ID</span>
                <span className="font-medium text-emerald-600 font-mono">
                  {tx.recipientHandle}
                </span>
              </div>
            )}

            {tx.note && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Note / Memo
                </span>
                <p className="text-sm text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                  "{tx.note}"
                </p>
              </div>
            )}
          </div>

          {/* Breakdown summary */}
          <div className="px-2 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Transfer Subtotal</span>
              <span>{formatAmount(tx.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Network & Processing Fee</span>
              <span className="text-emerald-600 font-medium">Free ($0.00)</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-base">
              <span>Total Settled</span>
              <span>{formatAmount(tx.amount)}</span>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified & encrypted through PocketPay instant settlement protocols.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={() => setSelectedTransactionForReceipt(null)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium text-sm transition-colors text-center"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
