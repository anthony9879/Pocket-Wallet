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
  ShieldCheck,
  Download
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const TransactionReceiptModal: React.FC = () => {
  const { selectedTransactionForReceipt, setSelectedTransactionForReceipt, formatAmount, addToast } = useWallet();

  useBodyScrollLock(Boolean(selectedTransactionForReceipt));

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

  const handleDownloadReceipt = () => {
    const receiptContent = [
      '========================================',
      '       POCKET WALLET RECEIPT            ',
      '========================================',
      `Transaction ID: ${tx.referenceNumber}`,
      `Date & Time:    ${new Date(tx.date).toLocaleString()}`,
      `Description:    ${tx.title}`,
      `Counterparty:   ${tx.recipientOrSender}`,
      `Type:           ${tx.type.toUpperCase()}`,
      `Category:       ${tx.category}`,
      `Status:         ${tx.status.toUpperCase()}`,
      `Amount:         ${isIncoming ? '+' : '-'}${formatAmount(tx.amount)}`,
      `Fee:            $0.00`,
      `Total:          ${formatAmount(tx.amount)}`,
      tx.cardLast4 ? `Payment Method: Card ending in •••• ${tx.cardLast4}` : '',
      tx.recipientHandle ? `PocketPay ID:   ${tx.recipientHandle}` : '',
      tx.note ? `Note / Memo:    ${tx.note}` : '',
      '========================================',
      'PocketPay Instant Settlement Protocols  ',
      'Thank you for banking with Pocket Wallet',
      '========================================',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `receipt-${tx.referenceNumber}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 150);
    addToast('Receipt downloaded successfully', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[88dvh] sm:max-h-[92dvh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Pattern */}
        <div className={`p-5 sm:p-6 pb-6 text-center text-white relative shrink-0 ${
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

          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md mb-2 sm:mb-3 ring-4 ring-white/10">
            {tx.type === 'send' && <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            {tx.type === 'receive' && <ArrowDownLeft className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-200" />}
            {tx.type === 'deposit' && <ArrowDownLeft className="w-6 h-6 sm:w-7 sm:h-7 text-teal-200" />}
            {tx.type === 'card_spend' && <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            {tx.type === 'pocket_transfer' && <PiggyBank className="w-6 h-6 sm:w-7 sm:h-7 text-sky-200" />}
          </div>

          <h2 className="text-lg sm:text-xl font-bold truncate px-6">{tx.title}</h2>
          <p className="text-white/80 text-xs sm:text-sm mt-0.5 truncate px-6">{tx.recipientOrSender}</p>

          <div className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isIncoming ? '+' : '-'}{formatAmount(tx.amount)}
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 mt-2 sm:mt-3 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{tx.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
              <span className="text-xs font-semibold text-slate-800">
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
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setSelectedTransactionForReceipt(null)}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs sm:text-sm transition-colors text-center"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
