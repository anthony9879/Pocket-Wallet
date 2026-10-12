import React, { useState } from 'react';
import { VirtualCard } from '../types/wallet';
import { 
  CreditCard, 
  Plus, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Globe, 
  ShoppingBag, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CardsTabProps {
  cards: VirtualCard[];
  onToggleFreezeCard: (cardId: string) => void;
  onUpdateLimit: (cardId: string, newLimit: number) => void;
  onToggleOnlinePayments: (cardId: string) => void;
  onToggleInternational: (cardId: string) => void;
  onRegenerateDisposable: (cardId: string) => void;
  onOpenNewCardModal: () => void;
}

export const CardsTab: React.FC<CardsTabProps> = ({
  cards,
  onToggleFreezeCard,
  onUpdateLimit,
  onToggleOnlinePayments,
  onToggleInternational,
  onRegenerateDisposable,
  onOpenNewCardModal,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [showSensitiveDetails, setShowSensitiveDetails] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const toggleShowDetails = (id: string) => {
    setShowSensitiveDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getCardBg = (scheme: VirtualCard['colorScheme']) => {
    switch (scheme) {
      case 'emerald':
        return 'from-emerald-600 via-teal-700 to-slate-900 border-emerald-400/30';
      case 'indigo':
        return 'from-indigo-600 via-blue-800 to-slate-950 border-indigo-400/30';
      case 'violet':
        return 'from-purple-600 via-violet-800 to-slate-950 border-purple-400/30';
      case 'rose':
        return 'from-rose-600 via-pink-800 to-slate-950 border-rose-400/30';
      case 'amber':
        return 'from-amber-600 via-stone-800 to-slate-950 border-amber-400/30';
      default:
        return 'from-slate-700 via-slate-800 to-slate-950 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Pocket Cards Hub</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {cards.length} Cards
            </span>
          </div>
          <p className="text-xs text-slate-400">Physical & virtual debit cards with granular spending controls and instant burn protection</p>
        </div>
        <button
          onClick={onOpenNewCardModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Virtual Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Card Selector and Interactive Card Presentation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Tabs Carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {cards.map((card) => {
              const isSelected = card.id === selectedCard?.id;
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 font-bold shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{card.name}</span>
                  {card.isFrozen && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" title="Frozen" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Card Presentation */}
          {selectedCard && (
            <div className="relative">
              <div
                className={`relative w-full aspect-[1.58/1] max-w-lg mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${getCardBg(
                  selectedCard.colorScheme
                )} border shadow-2xl text-white flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  selectedCard.isFrozen ? 'opacity-70 grayscale-[50%]' : ''
                }`}
              >
                {/* Chip and Network Logo */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* EMV Chip */}
                    <div className="w-11 h-8 rounded-lg bg-amber-200/80 border border-amber-300/40 relative overflow-hidden flex flex-col justify-around p-1 shadow-inner">
                      <div className="w-full h-[1px] bg-amber-700/40" />
                      <div className="w-full h-[1px] bg-amber-700/40" />
                      <div className="w-full h-[1px] bg-amber-700/40" />
                    </div>
                    {/* Contactless symbol */}
                    <div className="text-white/70">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8.5 16.5a5 5 0 0 1 0-7" />
                        <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                        <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase tracking-widest block opacity-75">
                      {selectedCard.type === 'disposable'
                        ? 'BURNER CARD'
                        : selectedCard.type === 'physical'
                        ? 'PHYSICAL DEBIT'
                        : 'POCKET VIRTUAL'}
                    </span>
                    <span className="text-lg font-black tracking-wider uppercase">{selectedCard.brand}</span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-white drop-shadow">
                    {showSensitiveDetails[selectedCard.id]
                      ? selectedCard.cardNumber.replace(/•/g, '4') // realistic mock reveal
                      : selectedCard.cardNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleShowDetails(selectedCard.id)}
                      className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 underline"
                    >
                      {showSensitiveDetails[selectedCard.id] ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Reveal CVV & Full Number
                        </>
                      )}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedCard.cardNumber.replace(/\s+/g, ''), 'number')}
                      className="text-[11px] text-white/80 hover:text-white flex items-center gap-1"
                    >
                      {copiedField === 'number' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'number' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Holder, Expiry, CVV */}
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <div className="text-[10px] uppercase opacity-75 font-medium">CARDHOLDER</div>
                    <div className="font-bold tracking-wide">{selectedCard.cardHolder}</div>
                  </div>

                  <div className="flex gap-5">
                    <div>
                      <div className="text-[10px] uppercase opacity-75 font-medium">EXPIRES</div>
                      <div className="font-mono font-bold">{selectedCard.expiry}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase opacity-75 font-medium">CVV</div>
                      <div className="font-mono font-bold">
                        {showSensitiveDetails[selectedCard.id] ? selectedCard.cvv : '•••'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frozen Overlay Badge */}
                {selectedCard.isFrozen && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                    <Lock className="w-8 h-8 text-rose-400" />
                    <span className="font-bold text-sm tracking-wide text-white uppercase bg-rose-600/80 px-3 py-1 rounded-full border border-rose-400">
                      Card is Frozen
                    </span>
                  </div>
                )}
              </div>

              {/* Disposable Card Burn Action */}
              {selectedCard.type === 'disposable' && (
                <div className="mt-3 p-3 rounded-2xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-violet-300">
                    <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Single-use burner card regenerates automatically after purchase.</span>
                  </div>
                  <button
                    onClick={() => {
                      onRegenerateDisposable(selectedCard.id);
                      confetti({ particleCount: 40, spread: 45 });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Card Controls & Security */}
        {selectedCard && (
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Card Controls: {selectedCard.name}</span>
              </h3>

              {/* Freeze toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedCard.isFrozen ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {selectedCard.isFrozen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {selectedCard.isFrozen ? 'Card Frozen' : 'Card Active'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedCard.isFrozen ? 'All transactions are blocked' : 'Instant freeze if misplaced'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFreezeCard(selectedCard.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCard.isFrozen
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {selectedCard.isFrozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>

              {/* Monthly Spending Limit Slider */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Monthly Spending Limit</span>
                  <span className="font-mono font-bold text-emerald-400">${selectedCard.spendingLimit}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={selectedCard.spendingLimit}
                  onChange={(e) => onUpdateLimit(selectedCard.id, parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Spent: ${selectedCard.currentSpent.toFixed(2)}</span>
                  <span>Max: $10,000</span>
                </div>
              </div>

              {/* Online Transactions Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-700/60 text-slate-300 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Online Transactions</div>
                    <div className="text-[11px] text-slate-400">Allow web & in-app checkouts</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={selectedCard.onlinePaymentsEnabled}
                  onChange={() => onToggleOnlinePayments(selectedCard.id)}
                  className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* International Payments Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-700/60 text-slate-300 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">International Payments</div>
                    <div className="text-[11px] text-slate-400">Zero foreign transaction fees</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={selectedCard.internationalEnabled}
                  onChange={() => onToggleInternational(selectedCard.id)}
                  className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Apple Pay / Google Pay button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Card ${selectedCard.name} is synchronized with Apple Wallet & Google Pay!`);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-slate-950 text-white text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Add to Apple Pay / Google Wallet</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
