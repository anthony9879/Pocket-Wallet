import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Send, 
  QrCode, 
  Users, 
  Search, 
  Check, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  DollarSign, 
  Sparkles, 
  Calculator,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Contact, TransactionCategory } from '../types/wallet';

const CATEGORIES: TransactionCategory[] = [
  'Transfer',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Travel',
  'Subscriptions',
];

export const SendPayView: React.FC = () => {
  const { 
    balance, 
    contacts, 
    cards, 
    sendMoney, 
    requestMoney, 
    formatAmount, 
    user, 
    transactions,
    setSelectedTransactionForReceipt,
    addToast 
  } = useWallet();

  const [activeSubTab, setActiveSubTab] = useState<'send' | 'request' | 'split'>('send');

  // Send State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Transfer');
  const [note, setNote] = useState('');
  const [fundingSource, setFundingSource] = useState<'balance' | string>('balance');
  const [isSending, setIsSending] = useState(false);

  // Request State
  const [reqAmount, setReqAmount] = useState('');
  const [reqPayer, setReqPayer] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Split Bill State
  const [billTotal, setBillTotal] = useState('120.00');
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [splitCount, setSplitCount] = useState<number>(3);
  const [splitTitle, setSplitTitle] = useState('Dinner with Friends');

  // Send calculations
  const numSendAmount = parseFloat(sendAmount) || 0;
  const isInsufficient = fundingSource === 'balance' && numSendAmount > balance;

  // Split calculations
  const numBillTotal = parseFloat(billTotal) || 0;
  const tipAmount = (numBillTotal * tipPercent) / 100;
  const grandTotal = numBillTotal + tipAmount;
  const perPersonAmount = splitCount > 0 ? grandTotal / splitCount : 0;

  const handleSelectContact = (c: Contact) => {
    setSelectedContact(c);
    setRecipientQuery(c.name);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSendAmount <= 0) {
      addToast('Please enter an amount to send', 'error');
      return;
    }
    if (isInsufficient) {
      addToast('Insufficient wallet balance', 'error');
      return;
    }

    const recipientName = selectedContact ? selectedContact.name : (recipientQuery || 'Recipient');
    const recipientHandle = selectedContact ? selectedContact.handle : (recipientQuery.startsWith('@') ? recipientQuery : undefined);
    const recipientAvatar = selectedContact?.avatar;

    setIsSending(true);

    setTimeout(() => {
      const cardId = fundingSource !== 'balance' ? fundingSource : undefined;
      const tx = sendMoney({
        recipientName,
        recipientHandle,
        recipientAvatar,
        amount: numSendAmount,
        category: selectedCategory,
        note: note || undefined,
        cardId,
      });

      setIsSending(false);
      setSendAmount('');
      setNote('');
      setSelectedContact(null);
      setRecipientQuery('');
      setSelectedTransactionForReceipt(tx);
    }, 600);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(reqAmount) || 0;
    if (amt <= 0) {
      addToast('Please enter an amount to request', 'error');
      return;
    }

    const link = requestMoney({
      senderName: reqPayer || 'Anyone',
      amount: amt,
      note: reqNote || undefined,
    });

    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard?.writeText(generatedLink);
      setCopiedLink(true);
      addToast('Payment link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCreateSplitRequests = () => {
    if (perPersonAmount <= 0) return;
    const link = `https://pocketwallet.app/split/${user.handle.replace('@', '')}?total=${grandTotal.toFixed(2)}&each=${perPersonAmount.toFixed(2)}&reason=${encodeURIComponent(splitTitle)}`;
    navigator.clipboard?.writeText(link);
    addToast(`Bill split into ${formatAmount(perPersonAmount)} each! Request link copied.`, 'success');
  };

  // Recent sent transfers
  const sentTransfers = transactions.filter((t) => t.type === 'send').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Send & Request Hub</h2>
        <p className="text-sm text-slate-500">Fast peer-to-peer payments, payment requests, and bill splitting</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveSubTab('send')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'send'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Send Money
        </button>
        <button
          onClick={() => setActiveSubTab('request')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'request'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          Request & QR
        </button>
        <button
          onClick={() => setActiveSubTab('split')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'split'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Split Bill
        </button>
      </div>

      {/* Sub Tab 1: Send Money */}
      {activeSubTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
            <form onSubmit={handleSendSubmit} className="space-y-5">
              {/* Recipient Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                  Recipient
                </label>

                {selectedContact ? (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
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
                        placeholder="Search contact name, @handle, or enter email"
                        value={recipientQuery}
                        onChange={(e) => setRecipientQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                      />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {contacts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectContact(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs text-slate-700 font-medium shrink-0 transition-colors border border-transparent hover:border-emerald-200"
                        >
                          <img src={c.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount input */}
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
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${
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

                <div className="flex gap-2 mt-2.5">
                  {[10, 25, 50, 100, 250].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSendAmount(val.toString())}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      +${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Note / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner, concert tickets, rent split"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending || numSendAmount <= 0 || isInsufficient}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {isSending ? 'Sending Transfer...' : `Send ${numSendAmount > 0 ? formatAmount(numSendAmount) : ''} Instantly`}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Recent recipients & send again */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Recent Recipients</h3>
              <div className="divide-y divide-slate-100">
                {sentTransfers.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {tx.recipientOrSender.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{tx.recipientOrSender}</div>
                        <div className="text-[10px] text-slate-400">{formatAmount(tx.amount)} · {tx.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSendAmount(tx.amount.toString());
                        setRecipientQuery(tx.recipientOrSender);
                        setNote(tx.note || '');
                        addToast(`Pre-filled transfer to ${tx.recipientOrSender}`, 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      Send Again
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                PocketPay Instant Guarantee
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Transfers between Pocket Wallet users are 100% free with instant settlement and 256-bit bank-grade encryption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Request & QR Code */}
      {activeSubTab === 'request' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
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
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Request From (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Chen or @alex_chen"
                  value={reqPayer}
                  onChange={(e) => setReqPayer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Memo / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Movie tickets & snacks"
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  Generate Request & QR Code
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2 space-y-4">
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                <div className="w-48 h-48 bg-slate-900 p-2 rounded-xl flex items-center justify-center relative overflow-hidden">
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
                    <div className="p-2 bg-emerald-600 rounded-lg text-white font-bold text-xs shadow-md">
                      PAY
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  Requesting {formatAmount(parseFloat(reqAmount) || 0)}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Anyone can scan this QR with their camera to pay directly to {user.handle}.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="bg-transparent text-xs text-slate-600 flex-1 font-mono truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => setGeneratedLink('')}
                className="py-2.5 px-6 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Create Another Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub Tab 3: Split Bill Calculator */}
      {activeSubTab === 'split' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Bill Details
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Event / Bill Name
              </label>
              <input
                type="text"
                value={splitTitle}
                onChange={(e) => setSplitTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Bill Subtotal ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={billTotal}
                onChange={(e) => setBillTotal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Tip Percentage ({tipPercent}%)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 10, 15, 18, 20].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipPercent(t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      tipPercent === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Split Between ({splitCount} People)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSplitCount((c) => Math.max(2, c - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-lg"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-slate-900 text-base">
                  {splitCount} people
                </div>
                <button
                  type="button"
                  onClick={() => setSplitCount((c) => Math.min(12, c + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Split Summary Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Split Calculation Breakdown
              </span>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatAmount(numBillTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tip ({tipPercent}%):</span>
                  <span className="font-semibold text-white">{formatAmount(tipAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 text-base font-bold text-white">
                  <span>Total Amount:</span>
                  <span>{formatAmount(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-xs text-emerald-300 uppercase font-semibold block">
                Each Person Owes
              </span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {formatAmount(perPersonAmount)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Divided equally among {splitCount} people
              </span>
            </div>

            <button
              onClick={handleCreateSplitRequests}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Copy Split Request Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
