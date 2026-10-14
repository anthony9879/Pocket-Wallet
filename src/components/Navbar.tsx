import React from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Wallet, 
  Send, 
  Settings
} from 'lucide-react';
import { Currency } from '../types/wallet';
import { UserAvatar } from './UserAvatar';
import { TabType } from './BottomNav';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSendModal: () => void;
  onOpenAddFundsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSendModal,
}) => {
  const { currency, setCurrency, user } = useWallet();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-6">
          {/* Brand Wordmark */}
          <button
            onClick={() => onSelectTab('wallet')}
            className="flex items-center gap-3 text-left focus:outline-none shrink-0 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm shadow-slate-950/20 group-hover:bg-emerald-700 transition-colors">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="whitespace-nowrap">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Pocket</span>
              <span className="font-extrabold text-emerald-600 text-lg tracking-tight ml-0.5">Wallet</span>
            </div>
          </button>

          {/* Header Actions & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Display currency"
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-emerald-500 cursor-pointer whitespace-nowrap"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>

            {/* Quick Send Button */}
            <button
              onClick={onOpenSendModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold whitespace-nowrap transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send</span>
            </button>

            {/* User Profile Button: Gateway to Settings */}
            <button
              onClick={() => onSelectTab('settings')}
              aria-label="Profile and Settings"
              title="Profile & Settings"
              className={`flex items-center gap-2.5 p-1.5 pl-2 sm:pl-3 rounded-2xl transition-all border ${
                currentTab === 'settings'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white hover:bg-slate-100/80 border-slate-200/90 text-slate-800'
              }`}
            >
              <div className="hidden sm:block text-right">
                <div className={`text-xs font-bold leading-tight ${currentTab === 'settings' ? 'text-white' : 'text-slate-900'}`}>
                  {user.name}
                </div>
                <div className={`text-[11px] font-mono leading-tight flex items-center justify-end gap-1 ${
                  currentTab === 'settings' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <Settings className="w-3 h-3" />
                  <span>Settings</span>
                </div>
              </div>

              <div className="relative">
                <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow-xs ${
                  currentTab === 'settings'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-white'
                }`}>
                  <Settings className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
