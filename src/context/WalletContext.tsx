import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Currency, 
  Transaction, 
  Card, 
  BankAccount, 
  PocketVault, 
  Contact, 
  WalletUser, 
  TransactionCategory 
} from '../types/wallet';
import { 
  initialUser, 
  initialCards, 
  initialBankAccounts, 
  initialPockets, 
  initialContacts, 
  initialTransactions 
} from '../data/initialData';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface WalletContextType {
  balance: number;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatAmount: (amount: number, overrideCurrency?: Currency) => string;
  user: WalletUser;
  updateUser: (u: Partial<WalletUser>) => void;
  
  cards: Card[];
  toggleFreezeCard: (cardId: string) => void;
  addNewCard: (card: Omit<Card, 'id' | 'createdAt' | 'currentSpent'>) => Card;
  updateCardLimit: (cardId: string, newLimit: number) => void;
  deleteCard: (cardId: string) => void;
  toggleCardFeature: (cardId: string, feature: 'online' | 'roaming' | 'fraudGuard') => void;
  
  bankAccounts: BankAccount[];
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  setPrimaryBankAccount: (bankId: string) => void;
  removeBankAccount: (bankId: string) => void;
  
  pockets: PocketVault[];
  createPocket: (pocket: Omit<PocketVault, 'id' | 'currentAmount'>) => void;
  depositToPocket: (pocketId: string, amount: number) => boolean;
  withdrawFromPocket: (pocketId: string, amount: number) => boolean;
  deletePocket: (pocketId: string) => void;
  togglePocketRoundUp: (pocketId: string) => void;
  
  contacts: Contact[];
  addContact: (c: Omit<Contact, 'id' | 'initials' | 'recent'>) => void;
  
  transactions: Transaction[];
  sendMoney: (data: {
    recipientName: string;
    recipientHandle?: string;
    recipientAvatar?: string;
    amount: number;
    category: TransactionCategory;
    note?: string;
    cardId?: string;
  }) => Transaction;
  
  addFunds: (amount: number, sourceName: string) => Transaction;
  
  requestMoney: (data: {
    senderName: string;
    amount: number;
    note?: string;
  }) => string; // returns simulated payment link
  
  selectedTransactionForReceipt: Transaction | null;
  setSelectedTransactionForReceipt: (tx: Transaction | null) => void;
  
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.20,
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('pocket_wallet_balance');
    return saved ? JSON.parse(saved) : 4850.25;
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('pocket_wallet_currency');
    return saved ? (saved as Currency) : 'USD';
  });

  const [user, setUser] = useState<WalletUser>(() => {
    const saved = localStorage.getItem('pocket_wallet_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('pocket_wallet_cards');
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('pocket_wallet_banks');
    return saved ? JSON.parse(saved) : initialBankAccounts;
  });

  const [pockets, setPockets] = useState<PocketVault[]>(() => {
    const saved = localStorage.getItem('pocket_wallet_pockets');
    return saved ? JSON.parse(saved) : initialPockets;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('pocket_wallet_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pocket_wallet_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [selectedTransactionForReceipt, setSelectedTransactionForReceipt] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('pocket_wallet_balance', JSON.stringify(balance));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_banks', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_pockets', JSON.stringify(pockets));
  }, [pockets]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('pocket_wallet_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    addToast(`Display currency changed to ${c}`, 'info');
  };

  const formatAmount = (amount: number, overrideCurrency?: Currency): string => {
    const curr = overrideCurrency || currency;
    const symbol = CURRENCY_SYMBOLS[curr];
    const rate = CURRENCY_RATES[curr];
    const converted = curr === 'USD' ? amount : amount * rate;
    
    if (curr === 'JPY') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const updateUser = (u: Partial<WalletUser>) => {
    setUser((prev) => ({ ...prev, ...u }));
    addToast('Profile updated successfully');
  };

  const toggleFreezeCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const nextState = !card.isFrozen;
          addToast(nextState ? `Card •••• ${card.last4} has been frozen` : `Card •••• ${card.last4} unfrozen and active`, nextState ? 'info' : 'success');
          return { ...card, isFrozen: nextState };
        }
        return card;
      })
    );
  };

  const addNewCard = (newCardData: Omit<Card, 'id' | 'createdAt' | 'currentSpent'>): Card => {
    const newCard: Card = {
      ...newCardData,
      id: 'card_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      currentSpent: 0,
      onlinePaymentsEnabled: true,
      internationalRoamingEnabled: true,
      fraudGuardEnabled: true,
    };
    setCards((prev) => [newCard, ...prev]);
    addToast(`New ${newCard.brand.toUpperCase()} card created!`, 'success');
    return newCard;
  };

  const updateCardLimit = (cardId: string, newLimit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, monthlyLimit: newLimit } : c))
    );
    addToast('Card spending limit updated', 'success');
  };

  const deleteCard = (cardId: string) => {
    setCards((prev) => {
      if (prev.length <= 1) {
        addToast('Cannot delete the only remaining card', 'error');
        return prev;
      }
      const card = prev.find((c) => c.id === cardId);
      addToast(`Removed ${card?.name || 'Card'}`, 'info');
      return prev.filter((c) => c.id !== cardId);
    });
  };

  const toggleCardFeature = (cardId: string, feature: 'online' | 'roaming' | 'fraudGuard') => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const fieldMap = {
            online: 'onlinePaymentsEnabled',
            roaming: 'internationalRoamingEnabled',
            fraudGuard: 'fraudGuardEnabled',
          } as const;
          const key = fieldMap[feature];
          const current = card[key] !== false; // default true
          const nextVal = !current;
          addToast(
            `${feature === 'online' ? 'Online Payments' : feature === 'roaming' ? 'International Roaming' : 'Fraud Guard AI'} ${nextVal ? 'enabled' : 'disabled'} for ${card.name}`,
            nextVal ? 'success' : 'info'
          );
          return { ...card, [key]: nextVal };
        }
        return card;
      })
    );
  };

  const addBankAccount = (bankData: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = {
      ...bankData,
      id: 'bnk_' + Math.random().toString(36).substring(2, 9),
    };
    setBankAccounts((prev) => [...prev, newBank]);
    addToast(`Connected ${newBank.bankName}`, 'success');
  };

  const setPrimaryBankAccount = (bankId: string) => {
    setBankAccounts((prev) =>
      prev.map((b) => ({ ...b, isPrimary: b.id === bankId }))
    );
    addToast('Primary bank account updated', 'success');
  };

  const removeBankAccount = (bankId: string) => {
    setBankAccounts((prev) => {
      if (prev.length <= 1) {
        addToast('At least one bank account must remain linked', 'error');
        return prev;
      }
      const removed = prev.find((b) => b.id === bankId);
      const remaining = prev.filter((b) => b.id !== bankId);
      if (removed?.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      addToast(`Disconnected ${removed?.bankName || 'Bank'}`, 'info');
      return remaining;
    });
  };

  const createPocket = (pocketData: Omit<PocketVault, 'id' | 'currentAmount'>) => {
    const newPocket: PocketVault = {
      ...pocketData,
      id: 'pkt_' + Math.random().toString(36).substring(2, 9),
      currentAmount: 0,
    };
    setPockets((prev) => [...prev, newPocket]);
    addToast(`Pocket "${newPocket.title}" created!`, 'success');
  };

  const depositToPocket = (pocketId: string, amount: number): boolean => {
    if (amount <= 0 || balance < amount) {
      addToast('Insufficient wallet balance to transfer to pocket', 'error');
      return false;
    }

    const pocket = pockets.find((p) => p.id === pocketId);
    if (!pocket) return false;

    setBalance((prev) => prev - amount);
    setPockets((prev) =>
      prev.map((p) => (p.id === pocketId ? { ...p, currentAmount: p.currentAmount + amount } : p))
    );

    const tx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      type: 'pocket_transfer',
      title: `Saved to ${pocket.title}`,
      recipientOrSender: `${pocket.title} Vault`,
      amount,
      currency: 'USD',
      category: 'Savings',
      date: new Date().toISOString(),
      status: 'completed',
      pocketId,
      note: `Deposited funds to ${pocket.title}`,
      referenceNumber: `PKT-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}`,
      fee: 0,
    };

    setTransactions((prev) => [tx, ...prev]);
    addToast(`Deposited $${amount.toFixed(2)} to ${pocket.title}`, 'success');
    return true;
  };

  const withdrawFromPocket = (pocketId: string, amount: number): boolean => {
    const pocket = pockets.find((p) => p.id === pocketId);
    if (!pocket) return false;

    if (amount <= 0 || pocket.currentAmount < amount) {
      addToast(`Cannot withdraw more than pocket balance ($${pocket.currentAmount.toFixed(2)})`, 'error');
      return false;
    }

    setPockets((prev) =>
      prev.map((p) => (p.id === pocketId ? { ...p, currentAmount: p.currentAmount - amount } : p))
    );
    setBalance((prev) => prev + amount);

    const tx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      type: 'withdraw',
      title: `Withdrew from ${pocket.title}`,
      recipientOrSender: `${pocket.title} Vault`,
      amount,
      currency: 'USD',
      category: 'Savings',
      date: new Date().toISOString(),
      status: 'completed',
      pocketId,
      note: `Transferred funds back to main wallet balance`,
      referenceNumber: `PKT-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}`,
      fee: 0,
    };

    setTransactions((prev) => [tx, ...prev]);
    addToast(`Withdrew $${amount.toFixed(2)} back to main wallet`, 'success');
    return true;
  };

  const deletePocket = (pocketId: string) => {
    const pocket = pockets.find((p) => p.id === pocketId);
    if (!pocket) return;

    // Refund any remaining funds back to wallet balance
    if (pocket.currentAmount > 0) {
      setBalance((prev) => prev + pocket.currentAmount);
      addToast(`Refunded $${pocket.currentAmount.toFixed(2)} from ${pocket.title} back to wallet`, 'info');
    }
    setPockets((prev) => prev.filter((p) => p.id !== pocketId));
    addToast(`Deleted pocket "${pocket.title}"`, 'info');
  };

  const togglePocketRoundUp = (pocketId: string) => {
    setPockets((prev) =>
      prev.map((p) => {
        if (p.id === pocketId) {
          const next = !p.autoSaveRoundUp;
          addToast(`Round-ups ${next ? 'enabled' : 'disabled'} for ${p.title}`, 'info');
          return { ...p, autoSaveRoundUp: next };
        }
        return p;
      })
    );
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'initials' | 'recent'>) => {
    const initials = contactData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newContact: Contact = {
      ...contactData,
      id: 'cnt_' + Math.random().toString(36).substring(2, 9),
      initials,
      recent: true,
    };

    setContacts((prev) => [newContact, ...prev]);
    addToast(`Added ${newContact.name} to contacts`);
  };

  const sendMoney = ({
    recipientName,
    recipientHandle,
    recipientAvatar,
    amount,
    category,
    note,
    cardId,
  }: {
    recipientName: string;
    recipientHandle?: string;
    recipientAvatar?: string;
    amount: number;
    category: TransactionCategory;
    note?: string;
    cardId?: string;
  }): Transaction => {
    setBalance((prev) => prev - amount);

    let cardLast4: string | undefined;
    if (cardId) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        cardLast4 = card.last4;
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, currentSpent: c.currentSpent + amount } : c))
        );
      }
    }

    const tx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      type: 'send',
      title: `Transfer to ${recipientName}`,
      recipientOrSender: recipientName,
      recipientHandle,
      avatar: recipientAvatar,
      amount,
      currency: 'USD',
      category,
      date: new Date().toISOString(),
      status: 'completed',
      note: note || 'PocketPay Instant Transfer',
      cardLast4,
      referenceNumber: `PKT-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}`,
      fee: 0,
    };

    setTransactions((prev) => [tx, ...prev]);
    addToast(`Sent $${amount.toFixed(2)} to ${recipientName}!`, 'success');
    return tx;
  };

  const addFunds = (amount: number, sourceName: string): Transaction => {
    setBalance((prev) => prev + amount);

    const tx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      type: 'deposit',
      title: `Top-up from ${sourceName}`,
      recipientOrSender: sourceName,
      amount,
      currency: 'USD',
      category: 'Income',
      date: new Date().toISOString(),
      status: 'completed',
      note: 'Instant balance top-up via linked account',
      referenceNumber: `PKT-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}`,
      fee: 0,
    };

    setTransactions((prev) => [tx, ...prev]);
    addToast(`Added $${amount.toFixed(2)} to Pocket Wallet!`, 'success');
    return tx;
  };

  const requestMoney = ({
    senderName,
    amount,
    note,
  }: {
    senderName: string;
    amount: number;
    note?: string;
  }): string => {
    const paymentLink = `https://pocketwallet.app/pay/${user.handle.replace('@', '')}?amt=${amount}&note=${encodeURIComponent(note || 'Payment request')}`;
    addToast(`Payment request for $${amount.toFixed(2)} created! Link copied.`, 'success');
    return paymentLink;
  };

  const resetAllData = () => {
    setBalance(4850.25);
    setCurrencyState('USD');
    setUser(initialUser);
    setCards(initialCards);
    setBankAccounts(initialBankAccounts);
    setPockets(initialPockets);
    setContacts(initialContacts);
    setTransactions(initialTransactions);
    localStorage.clear();
    addToast('Reset to demo sample data', 'info');
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        currency,
        setCurrency,
        formatAmount,
        user,
        updateUser,
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
        pockets,
        createPocket,
        depositToPocket,
        withdrawFromPocket,
        deletePocket,
        togglePocketRoundUp,
        contacts,
        addContact,
        transactions,
        sendMoney,
        addFunds,
        requestMoney,
        selectedTransactionForReceipt,
        setSelectedTransactionForReceipt,
        toasts,
        addToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
