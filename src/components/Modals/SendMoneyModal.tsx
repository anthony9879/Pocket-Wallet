import React, { useState } from 'react';
import { Contact, Category } from '../../types/wallet';
import { X, Send, Search, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  availableBalance: number;
  onSendMoney: (params: {
    recipientName: string;
    recipientHandle: string;
    amount: number;
    category: Category;
    note: string;
    avatar?: string;
  }) => void;
}

const CATEGORIES: Category[] = [
  'Transfers',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Travel & Transport',
  'Other',
];

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  contacts,
  availableBalance,
  onSendMoney,
}) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [customRecipient, setCustomRecipient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Category>('Transfers');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const numAmount = parseFloat(amount) || 0;
  const isOverBalance = numAmount > availableBalance;
  const canSubmit = (selectedContact || customRecipient.trim().length > 0) && numAmount > 0 && !isOverBalance;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleSend = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const recipientName = selectedContact ? selectedContact.name : customRecipient.trim();
      const recipientHandle = selectedContact ? selectedContact.handle : `@${customRecipient.trim().replace(/\s+/g, '_').toLowerCase()}`;
      const avatar = selectedContact?.avatar;

      onSendMoney({
        recipientName,
        recipientHandle,
        amount: numAmount,
        category,
        note: note.trim() || 'PocketPay Instant Transfer',
        avatar,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setSelectedContact(null);
        setCustomRecipient('');
        setAmount('');
        setNote('');
        onClose();
      }, 1600);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Transfer Successful!</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Sent <span className="text-white font-semibold">${numAmount.toFixed(2)}</span> to{' '}
              <span className="text-emerald-400">{selectedContact?.name || customRecipient}</span> instantly with zero fees.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Send className="w-3 h-3" /> PocketPay Instant Transfer
              </span>
              <h2 className="text-xl font-bold text-white">Send Money</h2>
              <p className="text-xs text-slate-400">Instant, fee-free payments to any Pocket ID, email, or contact</p>
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Recipient</label>
              {selectedContact ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <div>
                      <div className="font-semibold text-white text-sm">{selectedContact.name}</div>
                      <div className="text-xs text-emerald-400">{selectedContact.handle}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search contacts, @handle, or enter name/email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Frequent contacts chips */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {filteredContacts.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedContact(c)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-xs shrink-0 transition-all hover:border-emerald-500/50"
                      >
                        <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-slate-200 font-medium">{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  {searchQuery && filteredContacts.length === 0 && (
                    <div className="p-3 bg-slate-800/40 border border-dashed border-slate-700 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-300">Send to non-contact: <strong className="text-emerald-400">{searchQuery}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomRecipient(searchQuery);
                        }}
                        className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
                      >
                        Select
                      </button>
                    </div>
                  )}
                  {customRecipient && !selectedContact && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      <span>Sending to custom recipient: <strong>{customRecipient}</strong></span>
                      <button onClick={() => setCustomRecipient('')} className="underline text-slate-400">Clear</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Amount (USD)</label>
                <span className="text-xs text-slate-400">
                  Balance: <strong className="text-white">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-2xl font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full bg-slate-800/90 border rounded-2xl pl-10 pr-4 py-3 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none transition-all ${
                    isOverBalance ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
              </div>
              {isOverBalance && (
                <p className="text-xs text-rose-400 mt-1">Amount exceeds your available balance (${availableBalance.toFixed(2)})</p>
              )}

              {/* Quick Preset Buttons */}
              <div className="flex gap-2 mt-2.5">
                {[10, 25, 50, 100, 250].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Note & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">What's this for?</label>
                <input
                  type="text"
                  placeholder="e.g. Dinner, rent, coffee"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-800/40 rounded-xl text-[11px] text-slate-400 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Protected by PocketPay Zero-Liability Guarantee & 256-bit encryption.</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSend}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                canSubmit && !isSubmitting
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-500/20 active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isSubmitting ? (
                <span>Authorizing Transfer...</span>
              ) : (
                <>
                  <span>Send ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
