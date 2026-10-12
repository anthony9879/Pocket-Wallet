import React, { useState } from 'react';
import { VirtualCard } from '../../types/wallet';
import { X, CreditCard, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (card: VirtualCard) => void;
}

export const NewCardModal: React.FC<NewCardModalProps> = ({
  isOpen,
  onClose,
  onCreateCard,
}) => {
  const [name, setName] = useState('Online Shopping');
  const [type, setType] = useState<'virtual' | 'disposable' | 'physical'>('virtual');
  const [spendingLimit, setSpendingLimit] = useState('500');
  const [colorScheme, setColorScheme] = useState<VirtualCard['colorScheme']>('indigo');
  const [brand, setBrand] = useState<'visa' | 'mastercard'>('visa');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const colorThemes: { id: VirtualCard['colorScheme']; name: string; bgClass: string }[] = [
    { id: 'emerald', name: 'Emerald', bgClass: 'from-emerald-600 to-teal-900' },
    { id: 'indigo', name: 'Indigo', bgClass: 'from-indigo-600 to-slate-900' },
    { id: 'violet', name: 'Violet', bgClass: 'from-purple-600 to-indigo-950' },
    { id: 'rose', name: 'Rose Gold', bgClass: 'from-rose-600 to-pink-950' },
    { id: 'amber', name: 'Obsidian Gold', bgClass: 'from-amber-600 to-stone-900' },
    { id: 'slate', name: 'Midnight', bgClass: 'from-slate-700 to-slate-950' },
  ];

  const handleCreate = () => {
    // Generate random card numbers
    const last4 = Math.floor(1000 + Math.random() * 9000);
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const expMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const expYear = String(28 + Math.floor(Math.random() * 3));

    const newCard: VirtualCard = {
      id: `card-${Date.now()}`,
      name: name.trim() || 'Pocket Card',
      type,
      cardNumber: `${brand === 'visa' ? '4111' : '5242'} •••• •••• ${last4}`,
      cardHolder: 'ANTHONY BARCENAS',
      expiry: `${expMonth}/${expYear}`,
      cvv,
      isFrozen: false,
      spendingLimit: parseFloat(spendingLimit) || 500,
      currentSpent: 0,
      onlinePaymentsEnabled: true,
      internationalEnabled: true,
      colorScheme,
      brand,
    };

    onCreateCard(newCard);

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1400);
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

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center ring-8 ring-indigo-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Card Created!</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Your new <strong className="text-white">{name}</strong> is activated and ready for instant Apple Pay / Google Pay or online checkout.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <CreditCard className="w-3.5 h-3.5" /> Instant Card Issuance
              </span>
              <h2 className="text-xl font-bold text-white">Create New Card</h2>
              <p className="text-xs text-slate-400">Generate virtual debit cards with dedicated limits</p>
            </div>

            {/* Card Preview Preview */}
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorThemes.find(c => c.id === colorScheme)?.bgClass} border border-white/20 shadow-lg text-white space-y-3 relative overflow-hidden transition-all duration-300`}>
              <div className="flex justify-between items-center text-xs opacity-90 font-medium tracking-wide">
                <span>{type === 'disposable' ? 'SINGLE-USE DISPOSABLE' : type === 'physical' ? 'POCKET PHYSICAL' : 'POCKET VIRTUAL'}</span>
                <span className="uppercase font-bold tracking-wider">{brand}</span>
              </div>
              <div className="font-mono text-lg font-bold tracking-widest pt-1">
                •••• •••• •••• 9821
              </div>
              <div className="flex justify-between items-end text-xs pt-1">
                <div>
                  <div className="text-[10px] opacity-70">CARDHOLDER</div>
                  <div className="font-semibold">{name || 'ANTHONY BARCENAS'}</div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70">EXPIRES</div>
                  <div className="font-semibold font-mono">10/29</div>
                </div>
              </div>
            </div>

            {/* Card Details Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Card Label / Nickname</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Travel Card, Netflix, Amazon"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Card Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="virtual">Virtual (Reusable)</option>
                    <option value="disposable">Disposable (Auto-burn)</option>
                    <option value="physical">Physical Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Limit ($)</label>
                  <input
                    type="number"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Theme color selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Card Theme</label>
                <div className="flex gap-2">
                  {colorThemes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorScheme(c.id)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.bgClass} border-2 transition-all ${
                        colorScheme === c.id ? 'border-white scale-110 shadow-md ring-2 ring-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Card Network */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Network</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBrand('visa')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      brand === 'visa'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    VISA
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrand('mastercard')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      brand === 'mastercard'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Mastercard
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 px-4 rounded-2xl font-bold bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Issue Card Immediately</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
