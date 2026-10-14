import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  PiggyBank 
} from 'lucide-react';

export type TabType = 'wallet' | 'cards' | 'pockets' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
    { id: 'cards' as const, label: 'Cards', icon: CreditCard },
    { id: 'pockets' as const, label: 'Pockets', icon: PiggyBank },
  ];

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 sm:bottom-4 pointer-events-none flex justify-center px-0 sm:px-4"
    >
      <div className="w-full sm:max-w-md pointer-events-auto bg-white/95 backdrop-blur-md border-t sm:border border-slate-200/90 sm:rounded-3xl shadow-xl sm:shadow-2xl px-3 pt-1.5 pb-3 sm:pb-1.5 flex items-center justify-around gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all focus:outline-none ${
                isActive
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-500'}`} />
              <span className={`text-[10px] sm:text-[11px] font-semibold whitespace-nowrap mt-0.5 tracking-tight ${
                isActive ? 'text-white' : 'text-slate-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
