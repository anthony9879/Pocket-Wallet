import React, { useState } from 'react';
import { Transaction } from '../../types/wallet';
import { X, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownLeft, FileText, Download, Share2, Tag, Edit3, Check } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateNote?: (id: string, newNote: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onUpdateNote,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(transaction?.note || '');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!transaction) return null;

  const isPositive = transaction.amount > 0;
  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSaveNote = () => {
    if (onUpdateNote) {
      onUpdateNote(transaction.id, noteText);
    }
    setIsEditingNote(false);
  };

  const handleDownloadReceipt = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Amount */}
        <div className="flex flex-col items-center text-center pt-2 pb-5 border-b border-slate-800">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isPositive ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
          </div>

          <div className="text-3xl font-black tracking-tight text-white">
            {isPositive ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </div>
          <span className="text-xs text-slate-400 mt-0.5">{transaction.currency}</span>

          <h3 className="text-base font-semibold text-slate-200 mt-2">{transaction.title}</h3>

          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                transaction.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {transaction.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> Pending
                </>
              )}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="py-4 space-y-3 text-xs border-b border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Recipient / Sender</span>
            <span className="font-semibold text-white">{transaction.recipientOrSender}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Date & Time</span>
            <span className="text-slate-200">{formattedDate}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Category</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-medium text-slate-300">
              {transaction.category}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Reference No.</span>
            <span className="font-mono text-slate-300 font-semibold">{transaction.referenceNumber}</span>
          </div>

          {transaction.cardId && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payment Instrument</span>
              <span className="text-slate-300 font-medium">Pocket Platinum Card (...8829)</span>
            </div>
          )}

          {/* Note section */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400">Note</span>
              {!isEditingNote && (
                <button
                  type="button"
                  onClick={() => setIsEditingNote(true)}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSaveNote}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
              </div>
            ) : (
              <p className="text-slate-300 italic bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                "{transaction.note || 'No notes attached'}"
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex gap-3">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Receipt Saved!' : 'Download Receipt'}</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`Transaction ${transaction.referenceNumber}: ${transaction.title} for $${transaction.amount}`);
              alert('Transaction details copied to clipboard!');
            }}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center transition-colors"
            title="Share Details"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
