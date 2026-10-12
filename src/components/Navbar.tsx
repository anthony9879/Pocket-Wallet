import React from 'react';
import { UserProfile } from '../types/wallet';
import { Wallet, Eye, EyeOff } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  hideBalance: boolean;
  setHideBalance: (hide: boolean) => void;
  onOpenSend?: () => void;
  onOpenAddMoney?: () => void;
  onOpenQR?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  hideBalance,
  setHideBalance,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">Pocket Wallet</span>
              <span className="text-[11px] text-slate-400 hidden sm:block">Digital Money & Transfers</span>
            </div>
          </div>

          {/* Right Action buttons & profile */}
          <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
};
