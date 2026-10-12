import React, { useState, useRef, useEffect } from 'react';
import { VirtualCard } from '../types/wallet';
import { 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Plus, 
  ShieldCheck,
  Sparkles,
  Sliders,
  Pencil
} from 'lucide-react';

interface VirtualCardWalletDeckProps {
  cards: VirtualCard[];
  onToggleFreezeCard?: (cardId: string) => void;
  onUpdateLimit?: (cardId: string, newLimit: number) => void;
  onOpenNewCardModal?: () => void;
  onManageCards?: () => void;
}

export const VirtualCardWalletDeck: React.FC<VirtualCardWalletDeckProps> = ({
  cards,
  onToggleFreezeCard,
  onUpdateLimit,
  onOpenNewCardModal,
  onManageCards,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Spending limit editing state
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState<number>(1000);
  const [savedNotice, setSavedNotice] = useState(false);

  // Swipe / Drag state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Keep index within bounds if cards length changes
  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0) {
      setCurrentIndex(cards.length - 1);
    }
  }, [cards.length, currentIndex]);

  const activeCard = cards[currentIndex] || cards[0];

  // Sync tempLimit when active card changes
  useEffect(() => {
    if (activeCard) {
      setTempLimit(activeCard.spendingLimit);
    }
  }, [activeCard?.id, activeCard?.spendingLimit]);

  const handleSaveLimit = (limitToSave?: number) => {
    const val = limitToSave !== undefined ? limitToSave : tempLimit;
    const finalVal = Math.max(50, Math.min(25000, Number(val) || 100));
    setTempLimit(finalVal);
    if (onUpdateLimit && activeCard) {
      onUpdateLimit(activeCard.id, finalVal);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const handlePresetSelect = (preset: number) => {
    setTempLimit(preset);
    handleSaveLimit(preset);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentX(currentX);
    const diff = currentX - touchStartX;
    setDragOffset(diff * 0.7); // damped drag
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const deltaX = touchCurrentX - touchStartX;
      const swipeThreshold = 45;
      if (deltaX < -swipeThreshold) {
        handleNext();
      } else if (deltaX > swipeThreshold) {
        handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchStartX(e.clientX);
    setTouchCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    const currentX = e.clientX;
    setTouchCurrentX(currentX);
    const diff = currentX - touchStartX;
    setDragOffset(diff * 0.5);
  };

  const handleMouseUp = () => {
    if (isDragging && touchStartX !== null && touchCurrentX !== null) {
      const deltaX = touchCurrentX - touchStartX;
      const swipeThreshold = 50;
      if (deltaX < -swipeThreshold) {
        handleNext();
      } else if (deltaX > swipeThreshold) {
        handlePrev();
      }
    }
    setIsDragging(false);
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const toggleDetails = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCard = (card: VirtualCard, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(card.cardNumber.replace(/\s+/g, ''));
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCardBg = (scheme: VirtualCard['colorScheme']) => {
    switch (scheme) {
      case 'emerald':
        return 'from-emerald-600 via-teal-700 to-slate-900 border-emerald-400/40 shadow-emerald-950/40';
      case 'indigo':
        return 'from-indigo-600 via-blue-800 to-slate-950 border-indigo-400/40 shadow-indigo-950/40';
      case 'violet':
        return 'from-purple-600 via-violet-800 to-slate-950 border-purple-400/40 shadow-purple-950/40';
      case 'rose':
        return 'from-rose-600 via-pink-800 to-slate-950 border-rose-400/40 shadow-rose-950/40';
      case 'amber':
        return 'from-amber-600 via-amber-800 to-slate-950 border-amber-400/40 shadow-amber-950/40';
      default:
        return 'from-slate-700 via-slate-800 to-slate-950 border-slate-500/40 shadow-slate-950/40';
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <CreditCard className="w-10 h-10 text-slate-500" />
        <h3 className="text-sm font-bold text-white">No Virtual Cards Yet</h3>
        <p className="text-xs text-slate-400">Generate an instant disposable or virtual debit card.</p>
        {onOpenNewCardModal && (
          <button
            onClick={onOpenNewCardModal}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Create First Card
          </button>
        )}
      </div>
    );
  }

  const isCardFrozen = activeCard.isFrozen;
  const isDetailsRevealed = !!showDetails[activeCard.id];
  const spendPercent = Math.min(100, Math.round((activeCard.currentSpent / activeCard.spendingLimit) * 100));

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden select-none">
      {/* Top Bar: Title, Cards Count, Prev/Next Arrows */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Virtual Cards</h3>
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            ({currentIndex + 1}/{cards.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Arrow navigation buttons */}
          <button
            onClick={handlePrev}
            aria-label="Previous card"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next card"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {onManageCards && (
            <button
              onClick={onManageCards}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium ml-1.5 transition-colors"
            >
              All Cards
            </button>
          )}
        </div>
      </div>

      {/* Swipeable Interactive Card Deck Area */}
      <div
        className="relative w-full max-w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging || touchStartX !== null ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`relative rounded-2xl p-5 bg-gradient-to-br ${getCardBg(
            activeCard.colorScheme
          )} border shadow-xl text-white flex flex-col justify-between space-y-4 overflow-hidden transition-opacity duration-200 ${
            isCardFrozen ? 'opacity-70 grayscale-[40%]' : ''
          }`}
        >
          {/* Top row: Brand & Card Type Tag */}
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-xs font-bold block truncate max-w-[190px]">{activeCard.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                {activeCard.type === 'disposable'
                  ? 'Burner Card'
                  : activeCard.type === 'physical'
                  ? 'Physical Debit'
                  : 'Pocket Virtual'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isCardFrozen && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-400/30">
                  <Lock className="w-2.5 h-2.5" /> Frozen
                </span>
              )}
              <span className="text-sm font-black tracking-wider uppercase font-mono">{activeCard.brand}</span>
            </div>
          </div>

          {/* EMV Microchip & Contactless Waves */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              {/* EMV Chip */}
              <div className="w-9 h-6.5 rounded-md bg-amber-200/80 border border-amber-300/40 relative overflow-hidden flex flex-col justify-around p-0.5 shadow-inner">
                <div className="w-full h-[1px] bg-amber-800/40" />
                <div className="w-full h-[1px] bg-amber-800/40" />
                <div className="w-full h-[1px] bg-amber-800/40" />
              </div>
              {/* Wireless waves */}
              <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 16.5a5 5 0 0 1 0-7" />
                <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                <path d="M15.5 21.5a12 12 0 0 0 0-19" />
              </svg>
            </div>

            {/* Quick Copy / Reveal shortcuts */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => toggleDetails(activeCard.id, e)}
                title={isDetailsRevealed ? 'Hide card numbers' : 'Reveal card numbers'}
                className="p-1 rounded-lg bg-black/20 hover:bg-black/35 text-white/80 hover:text-white transition-colors"
              >
                {isDetailsRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={(e) => handleCopyCard(activeCard, e)}
                title="Copy card number"
                className="p-1 rounded-lg bg-black/20 hover:bg-black/35 text-white/80 hover:text-white transition-colors"
              >
                {copiedId === activeCard.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Card Number display */}
          <div>
            <div className="font-mono text-base font-bold tracking-widest tabular-nums">
              {isDetailsRevealed ? activeCard.cardNumber : activeCard.cardNumber.replace(/^\d{4}/, '••••')}
            </div>
          </div>

          {/* Bottom Card Row: Cardholder, Expiry, CVV */}
          <div className="flex justify-between items-end text-xs pt-1 border-t border-white/15">
            <div>
              <div className="text-[9px] uppercase tracking-wider opacity-70">Cardholder</div>
              <div className="font-semibold text-xs tracking-wide truncate max-w-[150px]">{activeCard.cardHolder}</div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[9px] uppercase tracking-wider opacity-70">Expires</div>
                <div className="font-mono font-semibold tabular-nums">{activeCard.expiry}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider opacity-70">CVV</div>
                <div className="font-mono font-semibold tabular-nums">
                  {isDetailsRevealed ? activeCard.cvv : '•••'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Swipe Indicator Dots & Quick Actions Bar */}
      <div className="mt-3.5 space-y-2.5">
        {/* Swipe dots & swipe hint */}
        <div className="flex items-center justify-between text-xs">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Switch to ${card.name}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-5 bg-indigo-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] text-slate-500 select-none">Swipe or use arrows</span>
        </div>

        {/* Card Spending Limit Tracker */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
          <div
            onClick={() => onUpdateLimit && setIsEditingLimit(!isEditingLimit)}
            className="flex justify-between items-center text-[11px] cursor-pointer group select-none"
            title="Click to adjust card spending limit"
          >
            <span className="text-slate-400 group-hover:text-slate-200 font-medium transition-colors">
              Monthly Spending Limit
            </span>

            <div className="font-mono tabular-nums text-right">
              <strong className="text-white">${activeCard.currentSpent.toFixed(0)}</strong>
              <span className="text-slate-400"> / </span>
              <span className="text-indigo-300 font-bold group-hover:underline">
                ${activeCard.spendingLimit.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                spendPercent > 90 ? 'bg-rose-500' : spendPercent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${spendPercent}%` }}
            />
          </div>

          {/* Inline Edit Panel when isEditingLimit is toggled */}
          {isEditingLimit && onUpdateLimit && (
            <div className="pt-2 mt-1 border-t border-slate-700/60 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium truncate max-w-[170px]">
                  Adjust Limit:
                </span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums text-xs">
                  ${tempLimit.toLocaleString()}
                </span>
              </div>

              {/* Slider input */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="50"
                  value={tempLimit}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTempLimit(val);
                    onUpdateLimit(activeCard.id, val);
                    setSavedNotice(true);
                    setTimeout(() => setSavedNotice(false), 1500);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Min: $100</span>
                  <span>Max: $10,000</span>
                </div>
              </div>

              {/* Preset quick buttons */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {[500, 1000, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
                      tempLimit === preset
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-700/60'
                    }`}
                  >
                    ${preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>

              {/* Status feedback */}
              {savedNotice && (
                <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 pt-0.5 font-medium">
                  <Check className="w-3 h-3" />
                  <span>Limit updated instantly!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Card Controls: All 3 styled as the exact same button */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {onToggleFreezeCard && (
            <button
              type="button"
              onClick={() => onToggleFreezeCard(activeCard.id)}
              className={`w-full py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                isCardFrozen
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isCardFrozen ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="truncate">Unfreeze</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span className="truncate">Freeze</span>
                </>
              )}
            </button>
          )}

          {onUpdateLimit && (
            <button
              type="button"
              onClick={() => {
                if (isEditingLimit) {
                  handleSaveLimit();
                  setIsEditingLimit(false);
                } else {
                  setIsEditingLimit(true);
                }
              }}
              className={`w-full py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                isEditingLimit
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle spending limit editor"
            >
              {isEditingLimit ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="truncate">Done</span>
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">Limit</span>
                </>
              )}
            </button>
          )}

          {onOpenNewCardModal && (
            <button
              type="button"
              onClick={onOpenNewCardModal}
              className="w-full py-2 px-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Issue a new virtual card"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate">Add Card</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
