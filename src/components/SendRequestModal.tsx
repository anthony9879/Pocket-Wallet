import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  X, 
  Send, 
  QrCode, 
  Copy, 
  Check, 
  Search, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { TransactionCategory, Contact } from '../types/wallet';

interface SendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'send' | 'request';
  initialRecipient?: Contact | null;
}

const CATEGORIES: TransactionCategory[] = [
  'Transfer',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Travel',
  'Subscriptions'
];

export const SendRequestModal: React.FC<SendRequestModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'send',
  initialRecipient = null,
}) => {
  const { 
    balance, 
    contacts, 
    sendMoney, 
    requestMoney, 
    formatAmount, 
    user, 
    cards, 
    addToast,
    setSelectedTransactionForReceipt 
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'send' | 'request'>(defaultTab);

  // Send Form State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(initialRecipient);
  const [recipientQuery, setRecipientQuery] = useState(initialRecipient ? initialRecipient.handle : '');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Transfer');
  const [note, setNote] = useState('');
  const [fundingSource, setFundingSource] = useState<'balance' | string>('balance');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request Form State
  const [requestAmount, setRequestAmount] = useState('');
  const [requestSender, setRequestSender] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSelectedContact(initialRecipient);
      setRecipientQuery(initialRecipient ? initialRecipient.name : '');
      setGeneratedLink('');
      setAmount('');
      setRequestAmount('');
      setRequestNote('');
    }
  }, [isOpen, defaultTab, initialRecipient]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = fundingSource === 'balance' && numAmount > balance;

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(recipientQuery.toLowerCase()) ||
    c.handle.toLowerCase().includes(recipientQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(recipientQuery.toLowerCase())
  );

  const handleSelectContact = (c: Contact) => {
    setSelectedContact(c);
    setRecipientQuery(c.name);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      addToast('Please enter a valid amount to send', 'error');
      return;
    }
    if (isInsufficient) {
      addToast('Insufficient wallet balance', 'error');
      return;
    }

    const recipientName = selectedContact ? selectedContact.name : (recipientQuery || 'Recipient');
    const recipientHandle = selectedContact ? selectedContact.handle : (recipientQuery.startsWith('@') ? recipientQuery : undefined);
    const recipientAvatar = selectedContact?.avatar;

    setIsSubmitting(true);

    setTimeout(() => {
      const cardId = fundingSource !== 'balance' ? fundingSource : undefined;
      const tx = sendMoney({
        recipientName,
        recipientHandle,
        recipientAvatar,
        amount: numAmount,
        category: selectedCategory,
        note: note || undefined,
        cardId,
      });

      setIsSubmitting(false);
      onClose();
      // Show receipt immediately
      setSelectedTransactionForReceipt(tx);
    }, 600);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reqNum = parseFloat(requestAmount) || 0;
    if (reqNum <= 0) {
      addToast('Please enter an amount to request', 'error');
      return;
    }

    const link = requestMoney({
      senderName: requestSender || 'Anyone',
      amount: reqNum,
      note: requestNote || undefined,
    });

    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard?.writeText(generatedLink);
      setCopiedLink(true);
      addToast('Payment link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('send')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'send'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Send Money
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'request'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Request Money
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'send' ? (
          <form onSubmit={handleSendSubmit} className="p-6 space-y-5">
            {/* Recipient Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Recipient (Contact or PocketPay ID)
              </label>
              
              {selectedContact ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedContact.avatar} 
                      alt={selectedContact.name} 
                      className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{selectedContact.name}</div>
                      <div className="text-xs text-emerald-700 font-mono">{selectedContact.handle}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedContact(null); setRecipientQuery(''); }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search name, @handle, or enter email"
                      value={recipientQuery}
                      onChange={(e) => setRecipientQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                    />
                  </div>

                  {/* Quick Contact Chips */}
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                    {contacts.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectContact(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs text-slate-700 font-medium shrink-0 transition-colors border border-transparent hover:border-emerald-200"
                      >
                        <img src={c.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        <span>{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Amount
                </label>
                <span className="text-xs text-slate-500">
                  Available: <span className="font-semibold text-slate-800">{formatAmount(balance)}</span>
                </span>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                    isInsufficient 
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30' 
                      : 'border-slate-200 focus:ring-emerald-500 bg-slate-50/50'
                  }`}
                  required
                />
              </div>

              {isInsufficient && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Amount exceeds available wallet balance.</span>
                </div>
              )}

              {/* Quick Amount presets */}
              <div className="flex gap-2 mt-2">
                {[10, 25, 50, 100, 250].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Source & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Funding Source
                </label>
                <select
                  value={fundingSource}
                  onChange={(e) => setFundingSource(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="balance">Wallet Balance ({formatAmount(balance)})</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (•••• {c.last4})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Note / Memo (Optional)
              </label>
              <input
                type="text"
                placeholder="What is this transfer for? (e.g. Dinner, rent, gift)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Bottom Send Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || numAmount <= 0 || isInsufficient}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin mr-2">⏳</span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmitting ? 'Transferring...' : `Send ${numAmount > 0 ? formatAmount(numAmount) : ''} Instantly`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero transaction fees · Protected by 256-bit encryption</span>
              </div>
            </div>
          </form>
        ) : (
          /* Request Money Tab */
          <div className="p-6 space-y-5">
            {!generatedLink ? (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Amount to Request
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Request From (Name or handle, optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Miller or @sarah_m"
                    value={requestSender}
                    onChange={(e) => setRequestSender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Reason / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Split concert tickets, dinner bill"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Create Payment Request & QR Code
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-2 space-y-4">
                <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                  {/* Generated QR Code pattern visualization */}
                  <div className="w-44 h-44 bg-slate-900 p-2 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2 bg-white rounded-lg">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            (i % 7 === 0 || i % 5 === 1 || i % 4 === 0 || i === 14 || i === 22)
                              ? 'bg-slate-900'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-1.5 bg-emerald-600 rounded-lg text-white font-bold text-xs shadow-md">
                        PAY
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Requesting {formatAmount(parseFloat(requestAmount) || 0)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Scan with any smartphone camera or Pocket Wallet to pay instantly to {user.handle}.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="bg-transparent text-xs text-slate-600 flex-1 font-mono truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setGeneratedLink('')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Create Another
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
