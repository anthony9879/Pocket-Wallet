import React from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  History, 
  Settings, 
  LayoutDashboard, 
  Send, 
  Plus, 
  ShieldCheck 
} from 'lucide-react';
import { Currency } from '../types/wallet';

interface NavbarProps {
  currentTab: 'overview' | 'send' | 'cards' | 'pockets' | 'activity' | 'settings';
  onSelectTab: (tab: 'overview' | 'send' | 'cards' | 'pockets' | 'activity' | 'settings') => void;
  onOpenSendModal: () => void;
  onOpenAddFundsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSendModal,
  onOpenAddFundsModal,
}) => {
  const { balance, formatAmount, currency, setCurrency, user } = useWallet();

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'send' as const, label: 'Send & Pay', icon: Send },
    { id: 'cards' as const, label: 'Cards & Banks', icon: CreditCard },
    { id: 'pockets' as const, label: 'Savings Pockets', icon: PiggyBank },
    { id: 'activity' as const, label: 'Activity', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-lg tracking-tight">Pocket</span>
                  <span className="font-extrabold text-emerald-600 text-lg tracking-tight">Wallet</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1 flex items-center gap-1">
                  <span>PocketPay</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span>v1.0</span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="hidden sm:block text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>

            {/* Quick Send Button */}
            <button
              onClick={onOpenSendModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send</span>
            </button>

            {/* Add Funds Button */}
            <button
              onClick={onOpenAddFundsModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Funds</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => onSelectTab('settings')}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-100 transition-colors"
            >
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-emerald-600 font-mono leading-tight">{user.handle}</div>
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/20"
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
