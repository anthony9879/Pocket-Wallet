import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  PiggyBank 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cardsCount?: number;
  cashbackValue?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  cardsCount = 5,
}) => {
  const isTabActive = (tabId: string) => {
    if (tabId === 'overview') {
      return activeTab === 'overview' || activeTab === 'transfers' || activeTab === 'rewards';
    }
    if (tabId === 'savings-insights') {
      return activeTab === 'savings-insights' || activeTab === 'vaults' || activeTab === 'analytics';
    }
    return activeTab === tabId;
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Wallet',
      description: 'Cash, Pay & Perks',
      icon: Wallet,
    },
    {
      id: 'cards',
      label: 'Cards',
      description: 'Virtual & Debit',
      icon: CreditCard,
      badge: cardsCount > 0 ? `${cardsCount}` : undefined,
    },
    {
      id: 'savings-insights',
      label: 'Savings',
      description: 'Vaults & Budgets',
      icon: PiggyBank,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-4 pointer-events-none max-w-full overflow-hidden">
      <nav 
        aria-label="Main Navigation"
        className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 px-3 py-2 pointer-events-auto"
      >
        <div className="flex items-center justify-around gap-2">
          {navItems.map((item) => {
            const active = isTabActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 group ${
                  active
                    ? 'bg-slate-800/80 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {/* Icon Container with active highlight */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-105 font-bold'
                      : 'bg-transparent text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform group-hover:scale-105" />

                  {/* Optional Counter badge */}
                  {item.badge && !active && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Primary Label */}
                <span
                  className={`text-[11px] sm:text-xs font-bold tracking-tight mt-1 transition-colors ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>

                {/* Micro Subtitle */}
                <span className="hidden sm:block text-[9px] text-slate-500 font-medium leading-none mt-0.5 truncate max-w-[90px]">
                  {item.description}
                </span>

                {/* Active Indicator Dot */}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shadow-xs shadow-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
