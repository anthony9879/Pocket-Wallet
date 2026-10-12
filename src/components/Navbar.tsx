import React from 'react';
import { UserProfile } from '../types/wallet';
import { Wallet, Send, Plus, QrCode, Eye, EyeOff, Shield, Bell } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hideBalance: boolean;
  setHideBalance: (hide: boolean) => void;
  onOpenSend: () => void;
  onOpenAddMoney: () => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  hideBalance,
  setHideBalance,
  onOpenSend,
  onOpenAddMoney,
  onOpenQR,
}) => {
  const tabs = [
    { id: 'overview', label: 'Wallet' },
    { id: 'transfers', label: 'Transfers & Pay' },
    { id: 'cards', label: 'Virtual Cards' },
    { id: 'vaults', label: 'Savings Vaults' },
    { id: 'analytics', label: 'Insights & Budgets' },
    { id: 'rewards', label: 'Perks & Cashback' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">Pocket Wallet</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  PocketPay
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">Digital Money & Instant Transfers</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action buttons & profile */}
          <div className="flex items-center gap-2">
            {/* Quick action shortcuts */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onOpenSend}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
              <button
                onClick={onOpenAddMoney}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Money</span>
              </button>
              <button
                onClick={onOpenQR}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                title="Scan or Show QR"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy balance toggle */}
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title={hideBalance ? 'Show Balances' : 'Hide Balances (Privacy Mode)'}
            >
              {hideBalance ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white truncate max-w-[110px]">{user.name}</div>
                <div className="text-[10px] text-emerald-400 font-medium">{user.handle}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
