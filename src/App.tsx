import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SendPayView } from './components/SendPayView';
import { CardsView } from './components/CardsView';
import { PocketsView } from './components/PocketsView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { SendRequestModal } from './components/SendRequestModal';
import { AddFundsModal } from './components/AddFundsModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { ToastContainer } from './components/ToastContainer';
import { Contact } from './types/wallet';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

const WalletAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'send' | 'cards' | 'pockets' | 'activity' | 'settings'>('overview');
  
  // Modals state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendModalTab, setSendModalTab] = useState<'send' | 'request'>('send');
  const [initialRecipient, setInitialRecipient] = useState<Contact | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSendModal={() => handleOpenSend(null)}
        onOpenAddFundsModal={() => setIsAddFundsOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentTab === 'overview' && (
          <Dashboard
            onOpenSend={handleOpenSend}
            onOpenRequest={handleOpenRequest}
            onOpenAddFunds={() => setIsAddFundsOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'send' && <SendPayView />}
        {currentTab === 'cards' && <CardsView />}
        {currentTab === 'pockets' && <PocketsView />}
        {currentTab === 'activity' && <ActivityView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Pocket Wallet</span>
            <span>·</span>
            <span>Digital Money Management</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PocketPay Network Live
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              256-bit SSL Protected
            </span>
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
