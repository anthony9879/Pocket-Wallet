import React, { useState } from 'react';
import { X, PlusCircle, Building2, CreditCard, Smartphone, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (amount: number, method: string) => void;
  currentBalance: number;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  onAddMoney,
  currentBalance,
}) => {
  const [amount, setAmount] = useState('100');
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'debit' | 'apple_pay'>('bank');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const canSubmit = numAmount > 0;

  const methods = [
    {
      id: 'bank' as const,
      name: 'Chase Checking (...4491)',
      type: 'Bank Account',
      fee: 'Free • Instant',
      icon: Building2,
    },
    {
      id: 'debit' as const,
      name: 'Visa Debit (...8829)',
      type: 'Debit Card',
      fee: 'Free • Instant',
      icon: CreditCard,
    },
    {
      id: 'apple_pay' as const,
      name: 'Apple Pay / Google Pay',
      type: 'One-Tap Wallet',
      fee: 'Free • Instant',
      icon: Smartphone,
    },
  ];

  const handleDeposit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const methodName = methods.find((m) => m.id === selectedMethod)?.name || 'Linked Account';
      onAddMoney(numAmount, methodName);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setAmount('100');
        onClose();
      }, 1500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

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
            <h3 className="text-2xl font-bold text-white">Deposit Confirmed!</h3>
            <p className="text-slate-400 text-sm">
              Added <span className="text-emerald-400 font-semibold">${numAmount.toFixed(2)}</span> to your Pocket Wallet. Funds are available immediately.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <PlusCircle className="w-3.5 h-3.5" /> Instant Reload
              </span>
              <h2 className="text-xl font-bold text-white">Add Money to Wallet</h2>
              <p className="text-xs text-slate-400">Transfer funds immediately from your connected accounts</p>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Amount</label>
                <span className="text-xs text-slate-400">
                  Current: <strong className="text-white">${currentBalance.toFixed(2)}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-2xl font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-3 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Presets */}
              <div className="flex gap-2 mt-2.5">
                {[50, 100, 250, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      amount === val.toString()
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding source options */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Fund From</label>
              <div className="space-y-2">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{method.name}</div>
                          <div className="text-xs text-slate-400">{method.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 justify-end">
                          <Zap className="w-3 h-3" /> {method.fee}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-800/40 rounded-xl text-[11px] text-slate-400 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>FDIC insured up to $250,000 through partner banking institutions.</span>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                canSubmit && !isSubmitting
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-500/20 active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isSubmitting ? 'Processing Deposit...' : `Add $${numAmount.toFixed(2)} to Pocket Wallet`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
