import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, PlusCircle, Building2, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);

  const { bankAccounts, cards, addFunds, formatAmount, addToast } = useWallet();
  const [amount, setAmount] = useState<string>('250');
  const [sourceId, setSourceId] = useState<string>(bankAccounts[0]?.id || 'bank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      addToast('Please enter an amount to deposit', 'error');
      return;
    }

    const selectedBank = bankAccounts.find((b) => b.id === sourceId);
    const selectedCard = cards.find((c) => c.id === sourceId);
    const sourceName = selectedBank
      ? `${selectedBank.bankName} (${selectedBank.accountNumberMasked})`
      : selectedCard
      ? `${selectedCard.name} (•••• ${selectedCard.last4})`
      : 'Linked Bank Account';

    setIsProcessing(true);

    setTimeout(() => {
      addFunds(numAmount, sourceName);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[85dvh] sm:max-h-[88dvh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Add Funds</h3>
              <p className="text-xs text-slate-500">Deposit money into your Pocket Wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="5"
                max="10000"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              {[50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    amount === val.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method / Bank Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Source Account
            </label>
            <div className="space-y-2">
              {bankAccounts.map((bank) => (
                <label
                  key={bank.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    sourceId === bank.id
                      ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="source"
                      value={bank.id}
                      checked={sourceId === bank.id}
                      onChange={() => setSourceId(bank.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{bank.bankName}</div>
                      <div className="text-[11px] text-slate-500">
                        {bank.accountNumberMasked} · Available {formatAmount(bank.balance)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    Instant
                  </span>
                </label>
              ))}

              {cards.filter((c) => !c.isFrozen).map((card) => (
                <label
                  key={card.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    sourceId === card.id
                      ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="source"
                      value={card.id}
                      checked={sourceId === card.id}
                      onChange={() => setSourceId(card.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{card.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {card.brand.toUpperCase()} •••• {card.last4}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Debit
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Funds are immediately credited to your Pocket Wallet balance at zero fee.</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing || numAmount <= 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? 'Processing Deposit...' : `Add ${numAmount > 0 ? formatAmount(numAmount) : ''} to Wallet`}
          </button>
        </form>
      </div>
    </div>
  );
};
