import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Transaction, 
  VirtualCard, 
  SavingsVault, 
  Contact, 
  Budget, 
  PerkOffer, 
  Category 
} from './types/wallet';
import { 
  INITIAL_USER, 
  INITIAL_BALANCES, 
  INITIAL_CARDS, 
  INITIAL_CONTACTS, 
  INITIAL_VAULTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_PERKS 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { TransfersTab } from './components/TransfersTab';
import { CardsTab } from './components/CardsTab';
import { VaultsTab } from './components/VaultsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { RewardsTab } from './components/RewardsTab';
import { SendMoneyModal } from './components/Modals/SendMoneyModal';
import { AddMoneyModal } from './components/Modals/AddMoneyModal';
import { RequestMoneyModal } from './components/Modals/RequestMoneyModal';
import { QRCodeModal } from './components/Modals/QRCodeModal';
import { TransactionDetailModal } from './components/Modals/TransactionDetailModal';
import { NewCardModal } from './components/Modals/NewCardModal';
import { NewVaultModal } from './components/Modals/NewVaultModal';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // Persistent state helper
  const usePersist = <T,>(key: string, defaultVal: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      try {
        const saved = localStorage.getItem(`pocket_${key}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse localStorage', e);
      }
      return defaultVal;
    });

    useEffect(() => {
      try {
        localStorage.setItem(`pocket_${key}`, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to set localStorage', e);
      }
    }, [key, state]);

    return [state, setState];
  };

  const [user, setUser] = usePersist<UserProfile>('user', INITIAL_USER);
  const [balances, setBalances] = usePersist<{ [key: string]: number }>('balances', INITIAL_BALANCES);
  const [transactions, setTransactions] = usePersist<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
  const [cards, setCards] = usePersist<VirtualCard[]>('cards', INITIAL_CARDS);
  const [vaults, setVaults] = usePersist<SavingsVault[]>('vaults', INITIAL_VAULTS);
  const [contacts, setContacts] = usePersist<Contact[]>('contacts', INITIAL_CONTACTS);
  const [budgets, setBudgets] = usePersist<Budget[]>('budgets', INITIAL_BUDGETS);
  const [perks, setPerks] = usePersist<PerkOffer[]>('perks', INITIAL_PERKS);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeCurrency, setActiveCurrency] = useState<string>('USD');
  const [hideBalance, setHideBalance] = useState<boolean>(false);

  // Modals state
  const [isSendOpen, setIsSendOpen] = useState<boolean>(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState<boolean>(false);
  const [isRequestOpen, setIsRequestOpen] = useState<boolean>(false);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);
  const [isNewCardOpen, setIsNewCardOpen] = useState<boolean>(false);
  const [isNewVaultOpen, setIsNewVaultOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Handlers
  const handleSendMoney = (params: {
    recipientName: string;
    recipientHandle: string;
    amount: number;
    category: Category;
    note: string;
    avatar?: string;
  }) => {
    // Deduct from balance
    setBalances((prev) => ({
      ...prev,
      USD: Math.max(0, (prev.USD || 0) - params.amount),
    }));

    // Create new transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'send',
      title: `Transfer to ${params.recipientName}`,
      recipientOrSender: params.recipientName,
      amount: -params.amount,
      currency: 'USD',
      category: params.category,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: params.note,
      referenceNumber: `TX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: params.avatar,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update budget spent if applicable
    setBudgets((prev) =>
      prev.map((b) => (b.category === params.category ? { ...b, spent: b.spent + params.amount } : b))
    );
  };

  const handleAddMoney = (amount: number, method: string) => {
    setBalances((prev) => ({
      ...prev,
      USD: (prev.USD || 0) + amount,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'top_up',
      title: `Top-Up via ${method}`,
      recipientOrSender: method,
      amount: amount,
      currency: 'USD',
      category: 'Income & Salary',
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: 'Instant bank deposit',
      referenceNumber: `TX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleQuickSend = (contact: Contact, amount: number) => {
    if ((balances.USD || 0) < amount) {
      alert(`Insufficient funds. Your USD balance is $${balances.USD?.toFixed(2)}.`);
      return;
    }

    handleSendMoney({
      recipientName: contact.name,
      recipientHandle: contact.handle,
      amount,
      category: 'Transfers',
      note: 'Quick 1-Tap Transfer ⚡',
      avatar: contact.avatar,
    });

    confetti({ particleCount: 50, spread: 60 });
  };

  const handleScanSuccess = (recipient: string, amount: number) => {
    if ((balances.USD || 0) < amount) {
      alert(`Insufficient funds for this $${amount} payment.`);
      return;
    }

    handleSendMoney({
      recipientName: recipient,
      recipientHandle: `@${recipient.replace(/\s+/g, '_').toLowerCase()}`,
      amount,
      category: recipient.includes('Coffee') ? 'Food & Dining' : 'Transfers',
      note: 'QR Code Instant Checkout',
    });

    confetti({ particleCount: 70, spread: 65 });
  };

  const handleRequestSent = (title: string, totalAmount: number, splitCount: number) => {
    // Record notice
    console.log(`Split request created: ${title} ($${totalAmount} split ${splitCount} ways)`);
  };

  const handleToggleFreezeCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  const handleUpdateCardLimit = (cardId: string, newLimit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, spendingLimit: newLimit } : c))
    );
  };

  const handleToggleOnlinePayments = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, onlinePaymentsEnabled: !c.onlinePaymentsEnabled } : c))
    );
  };

  const handleToggleInternational = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, internationalEnabled: !c.internationalEnabled } : c))
    );
  };

  const handleRegenerateDisposable = (cardId: string) => {
    const last4 = Math.floor(1000 + Math.random() * 9000);
    const newCvv = Math.floor(100 + Math.random() * 900).toString();
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              cardNumber: `4024 •••• •••• ${last4}`,
              cvv: newCvv,
              currentSpent: 0,
            }
          : c
      )
    );
  };

  const handleCreateCard = (newCard: VirtualCard) => {
    setCards((prev) => [newCard, ...prev]);
  };

  const handleDepositToVault = (vaultId: string, amount: number) => {
    setBalances((prev) => ({
      ...prev,
      USD: Math.max(0, (prev.USD || 0) - amount),
    }));

    setVaults((prev) =>
      prev.map((v) => (v.id === vaultId ? { ...v, currentAmount: v.currentAmount + amount } : v))
    );

    const vault = vaults.find((v) => v.id === vaultId);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'vault_deposit',
      title: `Deposit to ${vault?.name || 'Vault'}`,
      recipientOrSender: vault?.name || 'Savings Vault',
      amount: -amount,
      currency: 'USD',
      category: 'Savings',
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: 'Goal savings transfer',
      referenceNumber: `TX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleWithdrawFromVault = (vaultId: string, amount: number) => {
    setVaults((prev) =>
      prev.map((v) => (v.id === vaultId ? { ...v, currentAmount: Math.max(0, v.currentAmount - amount) } : v))
    );

    setBalances((prev) => ({
      ...prev,
      USD: (prev.USD || 0) + amount,
    }));

    const vault = vaults.find((v) => v.id === vaultId);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'vault_withdraw',
      title: `Withdrawal from ${vault?.name || 'Vault'}`,
      recipientOrSender: vault?.name || 'Savings Vault',
      amount: amount,
      currency: 'USD',
      category: 'Savings',
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: 'Vault fund transfer to main wallet',
      referenceNumber: `TX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleToggleRoundup = (vaultId: string) => {
    setVaults((prev) =>
      prev.map((v) => (v.id === vaultId ? { ...v, autoRoundup: !v.autoRoundup } : v))
    );
  };

  const handleCreateVault = (newVault: SavingsVault) => {
    setVaults((prev) => [...prev, newVault]);
  };

  const handleUpdateBudget = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
  };

  const handleTogglePerk = (perkId: string) => {
    setPerks((prev) =>
      prev.map((p) => (p.id === perkId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleRedeemCashback = (amount: number) => {
    setUser((prev) => ({ ...prev, cashbackPoints: 0 }));
    setBalances((prev) => ({ ...prev, USD: (prev.USD || 0) + amount }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'cashback',
      title: 'Pocket Rewards Cashback Redeemed',
      recipientOrSender: 'Pocket Rewards',
      amount: amount,
      currency: 'USD',
      category: 'Income & Salary',
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: 'Points redeemed to cash',
      referenceNumber: `TX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleToggleFavoriteContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  const handleUpdateTransactionNote = (txId: string, newNote: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, note: newNote } : t))
    );
    if (selectedTx && selectedTx.id === txId) {
      setSelectedTx({ ...selectedTx, note: newNote });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hideBalance={hideBalance}
        setHideBalance={setHideBalance}
        onOpenSend={() => setIsSendOpen(true)}
        onOpenAddMoney={() => setIsAddMoneyOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            user={user}
            balances={balances}
            activeCurrency={activeCurrency}
            setActiveCurrency={setActiveCurrency}
            hideBalance={hideBalance}
            transactions={transactions}
            cards={cards}
            vaults={vaults}
            contacts={contacts}
            onOpenSend={() => setIsSendOpen(true)}
            onOpenAddMoney={() => setIsAddMoneyOpen(true)}
            onOpenRequest={() => setIsRequestOpen(true)}
            onOpenQR={() => setIsQROpen(true)}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            onQuickSendContact={handleQuickSend}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'transfers' && (
          <TransfersTab
            contacts={contacts}
            transactions={transactions}
            onOpenSend={() => setIsSendOpen(true)}
            onOpenRequest={() => setIsRequestOpen(true)}
            onOpenQR={() => setIsQROpen(true)}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            onQuickSendContact={handleQuickSend}
            onToggleFavoriteContact={handleToggleFavoriteContact}
          />
        )}

        {activeTab === 'cards' && (
          <CardsTab
            cards={cards}
            onToggleFreezeCard={handleToggleFreezeCard}
            onUpdateLimit={handleUpdateCardLimit}
            onToggleOnlinePayments={handleToggleOnlinePayments}
            onToggleInternational={handleToggleInternational}
            onRegenerateDisposable={handleRegenerateDisposable}
            onOpenNewCardModal={() => setIsNewCardOpen(true)}
          />
        )}

        {activeTab === 'vaults' && (
          <VaultsTab
            vaults={vaults}
            mainBalance={balances.USD || 0}
            onDepositToVault={handleDepositToVault}
            onWithdrawFromVault={handleWithdrawFromVault}
            onToggleRoundup={handleToggleRoundup}
            onOpenNewVaultModal={() => setIsNewVaultOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            transactions={transactions}
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsTab
            user={user}
            perks={perks}
            onTogglePerk={handleTogglePerk}
            onRedeemCashback={handleRedeemCashback}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Pocket Wallet</span>
            <span>•</span>
            <span>PocketPay Network v1.0</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Instant Peer-to-Peer</span>
            <span>•</span>
            <span>Zero Fees</span>
            <span>•</span>
            <span>FDIC Insured Partner Banking</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        contacts={contacts}
        availableBalance={balances.USD || 0}
        onSendMoney={handleSendMoney}
      />

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onAddMoney={handleAddMoney}
        currentBalance={balances.USD || 0}
      />

      <RequestMoneyModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        contacts={contacts}
        onRequestSent={handleRequestSent}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        user={user}
        onScanSuccess={handleScanSuccess}
      />

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdateNote={handleUpdateTransactionNote}
      />

      <NewCardModal
        isOpen={isNewCardOpen}
        onClose={() => setIsNewCardOpen(false)}
        onCreateCard={handleCreateCard}
      />

      <NewVaultModal
        isOpen={isNewVaultOpen}
        onClose={() => setIsNewVaultOpen(false)}
        onCreateVault={handleCreateVault}
      />
    </div>
  );
};

export default App;
