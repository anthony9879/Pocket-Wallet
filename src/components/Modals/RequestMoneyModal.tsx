import React, { useState } from 'react';
import { Contact } from '../../types/wallet';
import { X, Users, DollarSign, Check, Copy, Share2, Split, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RequestMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onRequestSent: (title: string, totalAmount: number, splitCount: number) => void;
}

export const RequestMoneyModal: React.FC<RequestMoneyModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onRequestSent,
}) => {
  const [mode, setMode] = useState<'single' | 'split'>('split');
  const [totalAmount, setTotalAmount] = useState('120');
  const [description, setDescription] = useState('Weekend Dinner & Drinks');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(['c-1', 'c-2']);
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(totalAmount) || 0;
  // If splitting, Anthony + selected contacts
  const totalPeople = mode === 'split' ? selectedContactIds.length + 1 : 1;
  const perPersonAmount = totalPeople > 0 ? (numAmount / totalPeople) : 0;

  const toggleContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cid) => cid !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://pocketwallet.me/pay/split?req=${encodeURIComponent(description)}&amount=${perPersonAmount.toFixed(2)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitRequest = () => {
    if (numAmount <= 0) return;

    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.6 },
    });

    setIsSuccess(true);
    onRequestSent(description, numAmount, totalPeople);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center ring-8 ring-cyan-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Requests Sent!</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Requested <span className="text-white font-semibold">${perPersonAmount.toFixed(2)} each</span> from{' '}
              {mode === 'split' ? `${selectedContactIds.length} friends` : 'selected recipient'}.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    mode === 'split'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" /> Split Bill
                </button>
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    mode === 'single'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Single Request
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">
                {mode === 'split' ? 'Split a Bill with Friends' : 'Request Money'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'split'
                  ? 'Calculate equal shares and send instant PocketPay payment requests'
                  : 'Send a payment request with a custom note and link'}
              </p>
            </div>

            {/* Total Amount & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {mode === 'split' ? 'Total Bill Amount' : 'Request Amount'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-2 text-base font-bold text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Purpose / Note</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Dinner, Airbnb, Groceries"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Participant selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  {mode === 'split' ? 'Select Friends to Split With' : 'Request From'}
                </label>
                {mode === 'split' && (
                  <span className="text-xs text-cyan-400 font-medium">
                    {totalPeople} people (You + {selectedContactIds.length})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {contacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        if (mode === 'single') {
                          setSelectedContactIds([contact.id]);
                        } else {
                          toggleContact(contact.id);
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate text-white">{contact.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{contact.handle}</div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split breakdown card */}
            {mode === 'split' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-800/60 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold block">Each Person Pays</span>
                  <div className="text-2xl font-black text-white">${perPersonAmount.toFixed(2)}</div>
                  <span className="text-[11px] text-slate-400">Total ${numAmount.toFixed(2)} divided by {totalPeople}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied' : 'Share Link'}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitRequest}
              disabled={numAmount <= 0 || (mode === 'split' && selectedContactIds.length === 0)}
              className="w-full py-3.5 px-4 rounded-2xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {mode === 'split'
                  ? `Send Split Request ($${perPersonAmount.toFixed(2)} each)`
                  : `Request $${numAmount.toFixed(2)}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
