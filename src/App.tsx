import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { WalletView } from './components/WalletView';
import { CardsView } from './components/CardsView';
import { PocketsView } from './components/PocketsView';
import { SettingsView } from './components/SettingsView';
import { SendRequestModal } from './components/SendRequestModal';
import { AddFundsModal } from './components/AddFundsModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { ToastContainer } from './components/ToastContainer';
import { Contact } from './types/wallet';
import { ShieldCheck } from 'lucide-react';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';

const WalletAppContent: React.FC = () => {
  const { selectedTransactionForReceipt } = useWallet();
  const [currentTab, setCurrentTab] = useState<TabType>('wallet');
  
  // Modals state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendModalTab, setSendModalTab] = useState<'send' | 'request'>('send');
  const [initialRecipient, setInitialRecipient] = useState<Contact | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  useBodyScrollLock(isSendModalOpen || isAddFundsOpen || Boolean(selectedTransactionForReceipt));

  const handleOpenSend = (contact: Contact | null = null) => {
    setInitialRecipient(contact);
    setSendModalTab('send');
    setIsSendModalOpen(true);
  };

  const handleOpenRequest = () => {
    setInitialRecipient(null);
    setSendModalTab('request');
    setIsSendModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSendModal={() => handleOpenSend(null)}
        onOpenAddFundsModal={() => setIsAddFundsOpen(true)}
      />

      {/* Main Content Workspace with bottom clearance for BottomNav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28 sm:pb-32">
        {currentTab === 'wallet' && (
          <WalletView
            onOpenSendModal={handleOpenSend}
            onOpenRequestModal={handleOpenRequest}
            onOpenAddFundsModal={() => setIsAddFundsOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'cards' && <CardsView />}
        {currentTab === 'pockets' && <PocketsView />}
        {currentTab === 'settings' && <SettingsView onClose={() => setCurrentTab('wallet')} />}
      </main>

      {/* Bottom Navigation Menu Bar (Unified 4-Item Navigation) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Global Modals */}
      <SendRequestModal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setInitialRecipient(null);
        }}
        defaultTab={sendModalTab}
        initialRecipient={initialRecipient}
      />

      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
      />

      <TransactionReceiptModal />
      <ToastContainer />

      {/* Clean Footer with bottom clearance for floating nav */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 pb-24 sm:pb-28 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Pocket Wallet</span>
            <span aria-hidden="true">·</span>
            <span>Digital Money Management</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Bank-Grade Security
            </span>
            <span aria-hidden="true">·</span>
            <span>Zero transfer fees</span>
            <span aria-hidden="true">·</span>
            <span>© 2026 Pocket Wallet</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <WalletAppContent />
    </WalletProvider>
  );
}
