import React, { useState } from 'react';
import { VirtualCard } from '../types/wallet';
import { 
  CreditCard, 
  Plus, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  ShoppingBag, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CardsTabProps {
  cards: VirtualCard[];
  onToggleFreezeCard?: (cardId: string) => void;
  onUpdateLimit?: (cardId: string, newLimit: number) => void;
  onToggleOnlinePayments: (cardId: string) => void;
  onToggleInternational: (cardId: string) => void;
  onRegenerateDisposable: (cardId: string) => void;
  onOpenNewCardModal: () => void;
}

export const CardsTab: React.FC<CardsTabProps> = ({
  cards,
  onToggleOnlinePayments,
  onToggleInternational,
  onRegenerateDisposable,
  onOpenNewCardModal,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [showSensitiveDetails, setShowSensitiveDetails] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [syncedWalletCardId, setSyncedWalletCardId] = useState<string | null>(null);

  // Swipe state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const currentIndex = cards.findIndex((c) => c.id === selectedCard?.id);

  const handlePrevCard = () => {
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
    setSelectedCardId(cards[nextIdx].id);
  };

  const handleNextCard = () => {
    const nextIdx = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
    setSelectedCardId(cards[nextIdx].id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentX(currentX);
    setDragOffset((currentX - touchStartX) * 0.7);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const deltaX = touchCurrentX - touchStartX;
      if (deltaX < -45) handleNextCard();
      else if (deltaX > 45) handlePrevCard();
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

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
    <div className="space-y-6 w-full max-w-full overflow-hidden">
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
        {/* Left Column: Interactive Card Presentation */}
        <div className="lg:col-span-7 space-y-4">
          {/* Interactive Card Presentation with Swipe */}
          {selectedCard && (
            <div className="relative group overflow-hidden rounded-3xl max-w-full">
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  transform: `translateX(${dragOffset}px)`,
                  transition: touchStartX !== null ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={`relative w-full aspect-[1.58/1] max-w-lg mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${getCardBg(
                  selectedCard.colorScheme
                )} border shadow-2xl text-white flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${
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

              {/* Card Swipe & Quick Switcher Controls */}
              <div className="flex items-center justify-between pt-3 px-1 text-xs text-slate-400">
                <button
                  onClick={handlePrevCard}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {cards.map((card, idx) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        selectedCard.id === card.id ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Select ${card.name}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextCard}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  aria-label="Next card"
                >
                  <span className="text-[11px] font-medium hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Card Controls: {selectedCard.name}</span>
              </h3>

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
                    setSyncedWalletCardId(selectedCard.id);
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                    setTimeout(() => setSyncedWalletCardId(null), 3000);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    syncedWalletCardId === selectedCard.id
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-900/20'
                      : 'bg-black hover:bg-slate-950 text-white border-slate-700 active:scale-98'
                  }`}
                >
                  {syncedWalletCardId === selectedCard.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Synced with Apple & Google Wallet!</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Add to Apple Pay / Google Wallet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
