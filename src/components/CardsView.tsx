import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  CreditCard, 
  Plus, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldAlert, 
  Wifi, 
  Sliders, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, BankAccount } from '../types/wallet';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const CardsView: React.FC = () => {
  const { 
    cards, 
    toggleFreezeCard, 
    addNewCard, 
    updateCardLimit, 
    deleteCard,
    toggleCardFeature,
    bankAccounts, 
    addBankAccount, 
    setPrimaryBankAccount,
    removeBankAccount,
    formatAmount, 
    user, 
    addToast 
  } = useWallet();

  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [pinPromptCardId, setPinPromptCardId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [copiedCardNumber, setCopiedCardNumber] = useState(false);

  // New Card Modal State
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardBrand, setNewCardBrand] = useState<'visa' | 'mastercard'>('visa');
  const [newCardType, setNewCardType] = useState<'virtual' | 'physical'>('virtual');
  const [newCardColor, setNewCardColor] = useState<Card['colorScheme']>('emerald');
  const [newCardLimit, setNewCardLimit] = useState(1500);

  // Limit Edit State
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [editLimitValue, setEditLimitValue] = useState<number>(2000);

  // Connect Bank Modal
  const [isConnectBankOpen, setIsConnectBankOpen] = useState(false);
  const [bankName, setBankName] = useState('Wells Fargo');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings'>('Checking');

  // Removal Confirmation Modals
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [bankToRemove, setBankToRemove] = useState<BankAccount | null>(null);

  useBodyScrollLock(
    isNewCardModalOpen || 
    isConnectBankOpen || 
    Boolean(pinPromptCardId) || 
    Boolean(cardToDelete) || 
    Boolean(bankToRemove)
  );

  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const activeIndex = Math.max(0, cards.findIndex((c) => c.id === selectedCardId));
  const activeCard = cards[activeIndex] || cards[0];

  useEffect(() => {
    if (cards.length > 0 && !cards.some((c) => c.id === selectedCardId)) {
      setSelectedCardId(cards[0].id);
    } else if (cards.length === 0 && selectedCardId) {
      setSelectedCardId('');
    }
  }, [cards, selectedCardId]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToCard = (index: number) => {
    if (index < 0 || index >= cards.length) return;
    const target = cards[index];
    if (!target) return;

    setSelectedCardId(target.id);
    setRevealedCardId(null);
    setIsEditingLimit(false);

    if (cardsScrollRef.current) {
      isProgrammaticScroll.current = true;
      const container = cardsScrollRef.current;
      const cardEls = container.querySelectorAll<HTMLElement>('[data-card-item]');
      const targetCard = cardEls[index];
      if (targetCard) {
        const scrollTarget = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth',
        });
      }
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 400);
    }
  };

  const syncActiveCardFromScroll = () => {
    if (!cardsScrollRef.current) return;
    const container = cardsScrollRef.current;
    const center = container.scrollLeft + container.clientWidth / 2;
    const cardEls = container.querySelectorAll<HTMLElement>('[data-card-item]');
    if (!cardEls.length) return;

    let closestIndex = 0;
    let minDistance = Infinity;

    cardEls.forEach((el, idx) => {
      const elCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(center - elCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    if (cards[closestIndex] && cards[closestIndex].id !== selectedCardId) {
      setSelectedCardId(cards[closestIndex].id);
      setRevealedCardId(null);
      setIsEditingLimit(false);
    }
  };

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    // Debounce to ensure fluid 60fps scrolling without rendering re-trigger hiccups
    scrollTimeoutRef.current = setTimeout(() => {
      syncActiveCardFromScroll();
    }, 60);
  };

  // Mouse drag handlers for desktop smooth dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardsScrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.pageX - cardsScrollRef.current.offsetLeft;
    dragScrollLeft.current = cardsScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !cardsScrollRef.current) return;
    const x = e.pageX - cardsScrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.2;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    cardsScrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (hasDragged.current) {
      syncActiveCardFromScroll();
    }
  };

  const handleRevealClick = (cardId: string) => {
    if (revealedCardId === cardId) {
      setRevealedCardId(null);
    } else {
      setPinPromptCardId(cardId);
      setPinInput('');
      setPinError(false);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === user.pinCode || pinInput === '1234') {
      setRevealedCardId(pinPromptCardId);
      setPinPromptCardId(null);
      setPinInput('');
      setPinError(false);
      addToast('Card details revealed', 'info');
    } else {
      setPinError(true);
    }
  };

  const handleCopyNumber = (cardNumber: string) => {
    navigator.clipboard?.writeText(cardNumber);
    setCopiedCardNumber(true);
    addToast('Card number copied to clipboard!');
    setTimeout(() => setCopiedCardNumber(false), 2000);
  };

  const handleSaveLimit = () => {
    if (activeCard) {
      updateCardLimit(activeCard.id, editLimitValue);
      setIsEditingLimit(false);
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) {
      addToast('Please enter a card nickname', 'error');
      return;
    }

    const rand16 = '4' + Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
    const last4 = rand16.slice(-4);
    const expM = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const expY = '29';
    const cvv = String(Math.floor(100 + Math.random() * 899));

    const issuedCard = addNewCard({
      name: newCardName,
      cardNumber: rand16,
      last4,
      expMonth: expM,
      expYear: expY,
      cvv,
      type: newCardType,
      brand: newCardBrand,
      isFrozen: false,
      monthlyLimit: newCardLimit,
      colorScheme: newCardColor,
    });

    setSelectedCardId(issuedCard.id);
    setRevealedCardId(null);
    setIsNewCardModalOpen(false);
    setNewCardName('');
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    const masked = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
    addBankAccount({
      bankName,
      accountType,
      accountNumberMasked: masked,
      balance: Math.floor(2000 + Math.random() * 10000),
      isPrimary: false,
    });
    setIsConnectBankOpen(false);
  };

  const handleConfirmDeleteCard = () => {
    if (!cardToDelete) return;
    const deletingId = cardToDelete.id;
    deleteCard(deletingId);
    const remaining = cards.filter((c) => c.id !== deletingId);
    if (remaining.length > 0) {
      const deletedIdx = cards.findIndex((c) => c.id === deletingId);
      const nextCard = remaining[Math.min(deletedIdx, remaining.length - 1)];
      setSelectedCardId(nextCard.id);
    } else {
      setSelectedCardId('');
    }
    setCardToDelete(null);
    setRevealedCardId(null);
  };

  const handleConfirmRemoveBank = () => {
    if (!bankToRemove) return;
    removeBankAccount(bankToRemove.id);
    setBankToRemove(null);
  };

  const getCardGradient = (scheme: Card['colorScheme']) => {
    switch (scheme) {
      case 'emerald':
        return 'from-emerald-700 via-teal-800 to-emerald-950 text-white';
      case 'slate':
        return 'from-slate-900 via-slate-800 to-zinc-950 text-white';
      case 'violet':
        return 'from-violet-800 via-purple-900 to-indigo-950 text-white';
      case 'amber':
        return 'from-amber-600 via-orange-700 to-stone-900 text-white';
      case 'rose':
        return 'from-rose-700 via-pink-800 to-rose-950 text-white';
      case 'ocean':
        return 'from-blue-700 via-cyan-800 to-slate-900 text-white';
      default:
        return 'from-slate-900 via-slate-800 to-slate-950 text-white';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Title and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cards & Accounts</h2>
          <p className="text-sm text-slate-500">Manage virtual & physical cards, spending limits, and security</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConnectBankOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            Connect Bank
          </button>
          <button
            onClick={() => setIsNewCardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            New Virtual Card
          </button>
        </div>
      </div>

      {/* Main Grid: Card Viewer on Left, Details & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Card Stage */}
        <div className="lg:col-span-7 space-y-4">
          {cards.length === 0 ? (
            <div className="max-w-md mx-auto lg:mx-0 p-8 rounded-3xl bg-white border border-dashed border-slate-300 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No cards in your wallet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                You currently have no active cards. Issue a virtual Visa or Mastercard in seconds with customized limits and instant controls.
              </p>
              <button
                onClick={() => setIsNewCardModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Card</span>
              </button>
            </div>
          ) : (
            <>
              {/* Swipe Indicator & Pagination Controls Bar */}
              <div className="max-w-md mx-auto lg:mx-0 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Card {activeIndex + 1} of {cards.length}
                  </span>
                  {cards.length > 1 && (
                    <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                      <span>↔</span> Swipe to view
                    </span>
                  )}
                </div>

                {cards.length > 1 && (
                  <div className="flex items-center gap-2">
                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1.5 mr-1">
                      {cards.map((card, idx) => (
                        <button
                          key={card.id}
                          onClick={() => scrollToCard(idx)}
                          aria-label={`Jump to ${card.name}`}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            activeIndex === idx
                              ? 'w-6 bg-slate-900'
                              : 'w-2 bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Prev / Next buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => scrollToCard(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        aria-label="Previous card"
                        className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollToCard(activeIndex + 1)}
                        disabled={activeIndex === cards.length - 1}
                        aria-label="Next card"
                        className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

          {/* Swipeable Cards Carousel Stage */}
          <div
            ref={cardsScrollRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 no-scrollbar touch-pan-x select-none max-w-md mx-auto lg:mx-0 cursor-grab active:cursor-grabbing"
            style={{ 
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {cards.map((card, idx) => {
              const isActive = card.id === activeCard?.id;
              return (
                <div
                  key={card.id}
                  data-card-item
                  data-card-index={idx}
                  onClick={() => {
                    if (!hasDragged.current && !isActive) scrollToCard(idx);
                  }}
                  className={`snap-center shrink-0 w-full max-w-md transition-all duration-300 ${
                    isActive ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-75 hover:opacity-90 cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${getCardGradient(
                      card.colorScheme
                    )} shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10`}
                  >
                    {/* Frosted Glass Overlay if Frozen */}
                    {card.isFrozen && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white">
                        <div className="p-3 bg-white/10 rounded-full mb-2">
                          <Lock className="w-8 h-8 text-sky-300" />
                        </div>
                        <span className="font-bold text-base tracking-wider uppercase">Card Frozen</span>
                        <span className="text-xs text-white/70 mt-1">Transactions are temporarily blocked</span>
                      </div>
                    )}

                    {/* Decorative background curves */}
                    <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-xl pointer-events-none" />
                    <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-lg pointer-events-none" />

                    {/* Card Top Row: Brand & Wireless chip */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-3">
                        {/* EMV Chip */}
                        <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/40 shadow-inner relative flex items-center justify-center">
                          <div className="w-7 h-5 border border-amber-600/30 rounded-sm" />
                        </div>
                        <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] uppercase tracking-wider text-white/60 font-medium block">
                          {card.type}
                        </span>
                        <span className="font-bold text-sm tracking-wide text-white">
                          PocketPay
                        </span>
                      </div>
                    </div>

                    {/* Card Middle: 16-digit Number */}
                    <div className="z-10 my-auto py-3">
                      <div className="font-mono text-lg sm:text-2xl tracking-widest text-white/95 font-semibold flex items-center justify-between">
                        {revealedCardId === card.id ? (
                          card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()
                        ) : (
                          <>
                            <span>••••</span>
                            <span>••••</span>
                            <span>••••</span>
                            <span>{card.last4}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Row: Holder, Expiry, CVV & Brand Logo */}
                    <div className="flex items-end justify-between z-10 text-xs">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">
                          Cardholder
                        </div>
                        <div className="font-medium text-white tracking-wide text-sm truncate max-w-[140px] sm:max-w-none">
                          {user.name.toUpperCase()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-5">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">
                            Expires
                          </div>
                          <div className="font-medium text-white tracking-wide">
                            {card.expMonth}/{card.expYear}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">
                            CVV
                          </div>
                          <div className="font-mono font-medium text-white tracking-wide">
                            {revealedCardId === card.id ? card.cvv : '•••'}
                          </div>
                        </div>

                        <div className="font-bold text-lg italic tracking-tight text-white/90">
                          {card.brand === 'visa' ? 'VISA' : 'Mastercard'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Action Quick Bar (Acts on Currently Viewed Card) */}
          {activeCard && (
            <div className="max-w-md mx-auto lg:mx-0 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <button
                onClick={() => handleRevealClick(activeCard.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {revealedCardId === activeCard.id ? (
                  <>
                    <EyeOff className="w-4 h-4 text-slate-500" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-emerald-600" />
                    Reveal CVV / Details
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyNumber(activeCard.cardNumber)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {copiedCardNumber ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    Copy Card Number
                  </>
                )}
              </button>

              <button
                onClick={() => toggleFreezeCard(activeCard.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeCard.isFrozen
                    ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {activeCard.isFrozen ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unfreeze Card
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Freeze Card
                  </>
                )}
              </button>

              <button
                onClick={() => setCardToDelete(activeCard)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors ml-auto sm:ml-0"
                title="Remove virtual card"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>

        {/* Right Column: Card Controls, Spending Limits & Linked Banks */}
        <div className="lg:col-span-5 space-y-6">
          {activeCard ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Monthly Spending Limit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control how much this card can spend each month</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-baseline mb-2 text-sm">
                  <span className="font-semibold text-slate-900">
                    {formatAmount(activeCard.currentSpent)}
                  </span>
                  <span className="text-slate-500 text-xs">
                    Limit: <span className="font-medium text-slate-800">{formatAmount(activeCard.monthlyLimit)}</span>
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      activeCard.currentSpent / activeCard.monthlyLimit > 0.85
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (activeCard.currentSpent / activeCard.monthlyLimit) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                  <span>
                    {Math.round((activeCard.currentSpent / activeCard.monthlyLimit) * 100)}% utilized
                  </span>
                  <span>
                    Remaining: {formatAmount(Math.max(0, activeCard.monthlyLimit - activeCard.currentSpent))}
                  </span>
                </div>
              </div>

              {/* Edit Limit Toggle / Slider */}
              {!isEditingLimit ? (
                <button
                  onClick={() => {
                    setEditLimitValue(activeCard.monthlyLimit);
                    setIsEditingLimit(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Sliders className="w-4 h-4 text-slate-500" />
                  Adjust Spending Limit
                </button>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">New Monthly Limit</span>
                    <span className="font-bold text-emerald-600 text-sm">${editLimitValue}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="10000"
                    step="100"
                    value={editLimitValue}
                    onChange={(e) => setEditLimitValue(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingLimit(false)}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveLimit}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      Save Limit
                    </button>
                  </div>
                </div>
              )}

              {/* Security Status Card */}
              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeCard.onlinePaymentsEnabled !== false ? 'text-emerald-500' : 'text-slate-300'}`} />
                    Online Payments
                  </span>
                  <button
                    onClick={() => toggleCardFeature(activeCard.id, 'online')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      activeCard.onlinePaymentsEnabled !== false ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        activeCard.onlinePaymentsEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeCard.internationalRoamingEnabled !== false ? 'text-emerald-500' : 'text-slate-300'}`} />
                    International Roaming
                  </span>
                  <button
                    onClick={() => toggleCardFeature(activeCard.id, 'roaming')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      activeCard.internationalRoamingEnabled !== false ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        activeCard.internationalRoamingEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeCard.fraudGuardEnabled !== false ? 'text-emerald-500' : 'text-slate-300'}`} />
                    Fraud Guard AI Protection
                  </span>
                  <button
                    onClick={() => toggleCardFeature(activeCard.id, 'fraudGuard')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      activeCard.fraudGuardEnabled !== false ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        activeCard.fraudGuardEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center py-7">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Card Controls Inactive</h4>
              <p className="text-xs text-slate-400 mt-1">Issue a new card to set spending limits and security protections.</p>
            </div>
          )}

          {/* Linked Bank Accounts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Linked Bank Accounts</h3>
              <span className="text-xs text-slate-400 font-medium">ACH Direct</span>
            </div>

            <div className="space-y-2.5">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No linked bank accounts</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Connect an account to fund transfers via ACH</p>
                  <button
                    onClick={() => setIsConnectBankOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Connect Bank
                  </button>
                </div>
              ) : (
                bankAccounts.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{bank.bankName}</span>
                          {bank.isPrimary && (
                            <span className="text-[11px] text-emerald-600 font-medium">
                              · Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {bank.accountType} · {bank.accountNumberMasked}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {formatAmount(bank.balance)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!bank.isPrimary && bankAccounts.length > 1 && (
                          <button
                            onClick={() => setPrimaryBankAccount(bank.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                            title="Set as primary payout bank"
                          >
                            Make Primary
                          </button>
                        )}
                        <button
                          onClick={() => setBankToRemove(bank)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Disconnect bank account"
                          aria-label={`Disconnect ${bank.bankName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security PIN verification modal */}
      {pinPromptCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center space-y-4 max-h-[88dvh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Enter Pocket PIN</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your 4-digit security PIN to reveal card details and CVV (Default: 1234)
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-32 mx-auto text-center tracking-widest text-2xl font-bold py-2 border-b-2 border-emerald-500 focus:outline-none"
              />

              {pinError && (
                <p className="text-xs text-rose-500 font-medium">Incorrect PIN. Try 1234</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPinPromptCardId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Virtual Card Modal */}
      {isNewCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[88dvh] sm:max-h-[90dvh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center shrink-0 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Create New Card</h3>
                <p className="text-xs text-slate-500">Generate an instant virtual card with custom limits</p>
              </div>
              <button
                onClick={() => setIsNewCardModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Card Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Travel Card, Gym & Subs, SaaS"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Card Brand
                  </label>
                  <select
                    value={newCardBrand}
                    onChange={(e) => setNewCardBrand(e.target.value as 'visa' | 'mastercard')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="visa">Visa Debit</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value as 'virtual' | 'physical')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="virtual">Virtual (Instant)</option>
                    <option value="physical">Physical Card</option>
                  </select>
                </div>
              </div>

              {/* Color Scheme Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                  Card Style Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {(['emerald', 'slate', 'violet', 'amber', 'rose', 'ocean'] as Card['colorScheme'][]).map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCardColor(color)}
                        className={`h-9 rounded-xl border-2 transition-all ${
                          newCardColor === color ? 'border-slate-900 scale-105' : 'border-transparent'
                        } ${
                          color === 'emerald'
                            ? 'bg-emerald-600'
                            : color === 'slate'
                            ? 'bg-slate-800'
                            : color === 'violet'
                            ? 'bg-violet-600'
                            : color === 'amber'
                            ? 'bg-amber-600'
                            : color === 'rose'
                            ? 'bg-rose-600'
                            : 'bg-blue-600'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Initial Monthly Limit (${newCardLimit})
                </label>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={newCardLimit}
                  onChange={(e) => setNewCardLimit(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Issue Card Instantly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Bank Account Modal */}
      {isConnectBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[88dvh] sm:max-h-[90dvh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center shrink-0 mb-3">
              <h3 className="font-bold text-slate-900 text-base">Connect Bank via Plaid</h3>
              <button 
                onClick={() => setIsConnectBankOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBank} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block font-semibold text-slate-500 uppercase mb-1">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  <option value="Wells Fargo">Wells Fargo</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Citibank">Citibank</option>
                  <option value="Capital One">Capital One</option>
                  <option value="Silicon Valley Bank">Silicon Valley Bank</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 uppercase mb-1">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as 'Checking' | 'Savings')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  <option value="Checking">Checking Account</option>
                  <option value="Savings">Savings Account</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted connection with instant micro-deposit verification.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Link Bank Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation Modal */}
      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center space-y-4 max-h-[88dvh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Remove Card</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800 font-semibold">"{cardToDelete.name}"</strong>?
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{cardToDelete.name}</div>
                  <div className="text-[11px] text-slate-500">{cardToDelete.brand.toUpperCase()} · •••• {cardToDelete.last4}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {cardToDelete.type}
              </span>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
              This card will be permanently deactivated and removed from your wallet.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Yes, Remove Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Bank Confirmation Modal */}
      {bankToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center space-y-4 max-h-[88dvh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Disconnect Bank</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to disconnect <strong className="text-slate-800 font-semibold">{bankToRemove.bankName}</strong>?
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{bankToRemove.bankName}</div>
                  <div className="text-[11px] text-slate-500">{bankToRemove.accountType} · {bankToRemove.accountNumberMasked}</div>
                </div>
              </div>
              <span className="font-mono font-semibold text-slate-700 text-xs">
                {formatAmount(bankToRemove.balance)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ACH direct transfers and payouts associated with this account will be stopped.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setBankToRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveBank}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
